#!/usr/bin/env bash
set -Eeuo pipefail

echo "🚀 Installing Zero-Global-Key Cloudflare System..."

SCRIPT="scripts/cloudflare/clean-and-regenerate-tokens.sh"
PERMS="scripts/cloudflare/permissions.sh"
LIST="scripts/cloudflare/list-permission-groups.sh"

[[ -f "$SCRIPT" ]] || {
  echo "❌ ERROR: $SCRIPT not found"
  exit 1
}

# -----------------------------------------------------------------------------
# Backup
# -----------------------------------------------------------------------------
BACKUP="$SCRIPT.bak.$(date -u +%Y%m%dT%H%M%SZ)"
cp "$SCRIPT" "$BACKUP"
echo "📦 Backup created: $BACKUP"

# -----------------------------------------------------------------------------
# Create permissions helper
# -----------------------------------------------------------------------------
cat > "$PERMS" <<'EOS'
#!/usr/bin/env bash
set -Eeuo pipefail

API="https://api.cloudflare.com/client/v4"

: "${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID required}"
: "${CLOUDFLARE_BOOTSTRAP_TOKEN:?CLOUDFLARE_BOOTSTRAP_TOKEN required}"

cf_api() {
  local method="$1"
  local endpoint="$2"
  local payload="${3:-}"

  local args=(
    -sS
    -X "$method"
    "$API$endpoint"
    -H "Authorization: Bearer $CLOUDFLARE_BOOTSTRAP_TOKEN"
    -H "Content-Type: application/json"
  )

  [[ -n "$payload" ]] && args+=(--data "$payload")
  curl "${args[@]}"
}

permission_id_by_name() {
  local name="$1"

  cf_api GET "/accounts/$CLOUDFLARE_ACCOUNT_ID/tokens/permission_groups" |
    jq -r --arg name "$name" '
      (.result // [])
      | map(select(.name == $name))
      | .[0].id // empty
    '
}
EOS

chmod +x "$PERMS"

# -----------------------------------------------------------------------------
# Patch main script
# -----------------------------------------------------------------------------
python3 - <<'PY'
from pathlib import Path

p = Path("scripts/cloudflare/clean-and-regenerate-tokens.sh")
s = p.read_text()

# --- Inject permissions helper ---
if "permissions.sh" not in s:
    s = s.replace(
        'readonly API_BASE="https://api.cloudflare.com/client/v4"',
        'readonly API_BASE="https://api.cloudflare.com/client/v4"\nsource "$(dirname "$0")/permissions.sh"'
    )

# --- Replace auth ---
s = s.replace(
    'X-Auth-Email: ${CLOUDFLARE_EMAIL}',
    'Authorization: Bearer ${CLOUDFLARE_BOOTSTRAP_TOKEN}'
)
s = s.replace(
    'X-Auth-Key: ${CF_GLOBAL_API_KEY}',
    ''
)

# --- Replace env requirements ---
s = s.replace(
    'CLOUDFLARE_EMAIL',
    'CLOUDFLARE_ACCOUNT_ID'
)
s = s.replace(
    'CF_GLOBAL_API_KEY',
    'CLOUDFLARE_BOOTSTRAP_TOKEN'
)

# --- Replace endpoints ---
s = s.replace("/user/tokens/", "/accounts/${CLOUDFLARE_ACCOUNT_ID}/tokens/")
s = s.replace("/user/tokens", "/accounts/${CLOUDFLARE_ACCOUNT_ID}/tokens")

# --- Replace permission map ---
if "_PERM_ID_MAP" in s:
    start = s.find("declare -A _PERM_ID_MAP=(")
    end = s.find(")", start)
    end = s.find("\n", end) + 1

    s = s[:start] + '''declare -A _PERM_NAME_MAP=(
  [dns]="DNS Write"
  [workers]="Workers Scripts Write"
  [pages]="Pages Write"
  [r2]="Workers R2 Storage Write"
  [d1]="D1 Write"
  [zt]="Access: Apps and Policies Write"
  [waf]="WAF Write"
  [tunnel]="Cloudflare Tunnel Write"
)

''' + s[end:]

# --- Replace permission usage ---
s = s.replace(
    '_perm="${PERM_ID_OVERRIDE:-${_PERM_ID_MAP[$_t]}}"',
    '''_perm_name="${_PERM_NAME_MAP[$_t]:-}"

if [[ -n "${PERM_ID_OVERRIDE}" ]]; then
  _perm="${PERM_ID_OVERRIDE}"
else
  _perm="$(permission_id_by_name "${_perm_name}")"
fi

if [[ -z "${_perm}" ]]; then
  echo "ERROR: Missing permission ID for ${_perm_name}"
  exit 1
fi'''
)

# --- Fix resource scoping ---
s = s.replace(
    "com.cloudflare.api.account.zone.*",
    "com.cloudflare.api.account.zone.${CLOUDFLARE_ZONE_ID}"
)
s = s.replace(
    "com.cloudflare.api.account.*",
    "com.cloudflare.api.account.${CLOUDFLARE_ACCOUNT_ID}"
)

p.write_text(s)
PY

# -----------------------------------------------------------------------------
# Add permission list helper
# -----------------------------------------------------------------------------
cat > "$LIST" <<'EOF2'
#!/usr/bin/env bash
set -Eeuo pipefail

source "$(dirname "$0")/permissions.sh"

cf_api GET "/accounts/$CLOUDFLARE_ACCOUNT_ID/tokens/permission_groups" |
  jq -r '.result[] | [.name, .id] | @tsv'
EOF2

chmod +x "$LIST"

echo
echo "✅ Installation complete!"
echo
echo "Next steps:"
echo
echo "1. Export variables:"
echo "   export CLOUDFLARE_ACCOUNT_ID=..."
echo "   export CLOUDFLARE_ZONE_ID=..."
echo "   export CLOUDFLARE_BOOTSTRAP_TOKEN=..."
echo
echo "2. Verify permissions:"
echo "   $LIST"
echo
echo "3. Dry run:"
echo "   $SCRIPT --dry-run --regenerate --types dns,workers"
echo