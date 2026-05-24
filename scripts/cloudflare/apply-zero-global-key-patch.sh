#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT="scripts/cloudflare/clean-and-regenerate-tokens.sh"
PERMS="scripts/cloudflare/permissions.sh"

[[ -f "$SCRIPT" ]] || {
  echo "ERROR: missing $SCRIPT"
  exit 1
}

cp "$SCRIPT" "$SCRIPT.bak.$(date -u +%Y%m%dT%H%M%SZ)"

cat > "$PERMS" <<'EOS'
#!/usr/bin/env bash
set -Eeuo pipefail

readonly CF_API_BASE="https://api.cloudflare.com/client/v4"

: "${CF_ACCOUNT_ID:?CF_ACCOUNT_ID required}"
: "${CF_BOOTSTRAP_TOKEN:?CF_BOOTSTRAP_TOKEN required}"

cf_api() {
  local method="$1"
  local endpoint="$2"
  local payload="${3:-}"

  local args=(
    -sS
    -X "$method"
    "${CF_API_BASE}${endpoint}"
    -H "Authorization: Bearer ${CF_BOOTSTRAP_TOKEN}"
    -H "Content-Type: application/json"
  )

  [[ -n "$payload" ]] && args+=(--data "$payload")
  curl "${args[@]}"
}

permission_id_by_name() {
  local wanted="$1"

  cf_api GET "/accounts/${CF_ACCOUNT_ID}/tokens/permission_groups" |
    jq -r --arg wanted "$wanted" '
      (.result // [])
      | map(select(.name == $wanted))
      | .[0].id // empty
    '
}
EOS

chmod +x "$PERMS"

python3 - <<'PY'
from pathlib import Path

p = Path("scripts/cloudflare/clean-and-regenerate-tokens.sh")
s = p.read_text()

s = s.replace(
''': "${CLOUDFLARE_EMAIL:?CLOUDFLARE_EMAIL must be exported, for example: export CLOUDFLARE_EMAIL=you@example.com}"
: "${CF_GLOBAL_API_KEY:?CF_GLOBAL_API_KEY must be exported}"''',
''': "${CF_ACCOUNT_ID:?CF_ACCOUNT_ID must be exported}"
: "${CF_BOOTSTRAP_TOKEN:?CF_BOOTSTRAP_TOKEN must be exported}"'''
)

s = s.replace(
'''readonly API_BASE="https://api.cloudflare.com/client/v4"''',
'''readonly API_BASE="https://api.cloudflare.com/client/v4"
source "$(dirname "$0")/permissions.sh"'''
)

s = s.replace(
'''    -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}"
    -H "X-Auth-Key: ${CF_GLOBAL_API_KEY}"''',
'''    -H "Authorization: Bearer ${CF_BOOTSTRAP_TOKEN}"'''
)

start = s.find("declare -A _PERM_ID_MAP=(")
if start != -1:
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

s = s.replace(
'''declare -A _RESOURCE_MAP=(
  [dns]="com.cloudflare.api.account.zone.*"
  [zt]="com.cloudflare.api.account.*"
  [workers]="com.cloudflare.api.account.*"
  [waf]="com.cloudflare.api.account.*"
  [tunnel]="com.cloudflare.api.account.*"
  [r2]="com.cloudflare.api.account.*"
)''',
'''declare -A _RESOURCE_MAP=(
  [dns]="com.cloudflare.api.account.zone.${CF_ZONE_ID}"
  [zt]="com.cloudflare.api.account.${CF_ACCOUNT_ID}"
  [workers]="com.cloudflare.api.account.${CF_ACCOUNT_ID}"
  [pages]="com.cloudflare.api.account.${CF_ACCOUNT_ID}"
  [waf]="com.cloudflare.api.account.${CF_ACCOUNT_ID}"
  [tunnel]="com.cloudflare.api.account.${CF_ACCOUNT_ID}"
  [r2]="com.cloudflare.api.account.${CF_ACCOUNT_ID}"
  [d1]="com.cloudflare.api.account.${CF_ACCOUNT_ID}"
)'''
)

s = s.replace(
'''  _perm="${PERM_ID_OVERRIDE:-${_PERM_ID_MAP[$_t]}}"''',
'''  _perm_name="${_PERM_NAME_MAP[$_t]:-}"

  if [[ -z "${_perm_name}" ]]; then
    warn "No permission mapping for type=${_t}; skipping"
    continue
  fi

  if [[ -n "${PERM_ID_OVERRIDE}" ]]; then
    _perm="${PERM_ID_OVERRIDE}"
  else
    _perm="$(permission_id_by_name "${_perm_name}")"
  fi

  if [[ -z "${_perm}" ]]; then
    die "Permission ID not found for '${_perm_name}'. Run: scripts/cloudflare/list-permission-groups.sh"
  fi'''
)

s = s.replace(
'''if [[ -z "${_PERM_ID_MAP[$_t]:-}" ]]; then
    warn "Unknown token type '${_t}' — skipping. Valid types: dns zt workers waf tunnel r2"
    continue
  fi''',
'''if [[ -z "${_PERM_NAME_MAP[$_t]:-}" ]]; then
    warn "Unknown token type '${_t}' — skipping. Valid types: dns zt workers pages waf tunnel r2 d1"
    continue
  fi'''
)

s = s.replace(
'''TYPES_CSV="dns,zt,workers,waf,tunnel,r2"''',
'''TYPES_CSV="dns,zt,workers,pages,waf,tunnel,r2,d1"'''
)

s = s.replace(
'''  [workers]="zeaz-workers-token"
  [waf]="zeaz-waf-token"''',
'''  [workers]="zeaz-workers-token"
  [pages]="zeaz-pages-token"
  [d1]="zeaz-d1-token"
  [waf]="zeaz-waf-token"'''
)

s = s.replace(
'''  [workers]="CF_WORKERS_TOKEN"
  [waf]="CF_WAF_TOKEN"''',
'''  [workers]="CF_WORKERS_TOKEN"
  [pages]="CF_PAGES_TOKEN"
  [d1]="CF_D1_TOKEN"
  [waf]="CF_WAF_TOKEN"'''
)

s = s.replace(
'''  [CF_WORKERS_TOKEN]="workers"
  [CF_WAF_TOKEN]="waf"''',
'''  [CF_WORKERS_TOKEN]="workers"
  [CF_PAGES_TOKEN]="pages"
  [CF_D1_TOKEN]="d1"
  [CF_WAF_TOKEN]="waf"'''
)

s = s.replace(
'''  CF_WORKERS_TOKEN
  CF_WAF_TOKEN''',
'''  CF_WORKERS_TOKEN
  CF_PAGES_TOKEN
  CF_D1_TOKEN
  CF_WAF_TOKEN'''
)

p.write_text(s)
PY

cat > scripts/cloudflare/list-permission-groups.sh <<'EOF2'
#!/usr/bin/env bash
set -Eeuo pipefail

source "$(dirname "$0")/permissions.sh"

cf_api GET "/accounts/${CF_ACCOUNT_ID}/tokens/permission_groups" |
  jq -r '
    (.result // [])
    | sort_by(.name)
    | .[]
    | [.name, .id] | @tsv
  '
EOF2

chmod +x scripts/cloudflare/list-permission-groups.sh
chmod +x "$SCRIPT"

echo "Patch applied."
echo "Backup created beside $SCRIPT"
echo
echo "Test:"
echo "  CF_ACCOUNT_ID=... CF_ZONE_ID=... CF_BOOTSTRAP_TOKEN=... \\"
echo "  $SCRIPT --dry-run --regenerate --types dns,workers,pages,r2,d1"
