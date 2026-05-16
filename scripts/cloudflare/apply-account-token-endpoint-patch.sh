#!/usr/bin/env bash
set -Eeuo pipefail

TARGET="scripts/cloudflare/clean-and-regenerate-tokens.sh"

[[ -f "$TARGET" ]] || {
  echo "ERROR: $TARGET not found"
  exit 1
}

echo "Patching $TARGET → account-level token API..."

cp "$TARGET" "$TARGET.bak.$(date -u +%Y%m%dT%H%M%SZ)"

python3 - <<'PY'
from pathlib import Path

p = Path("scripts/cloudflare/clean-and-regenerate-tokens.sh")
s = p.read_text()

# ---- Replace all user token endpoints → account token endpoints ----
replacements = [
    ("/user/tokens/", "/accounts/${CF_ACCOUNT_ID}/tokens/"),
    ("/user/tokens", "/accounts/${CF_ACCOUNT_ID}/tokens"),
]

for old, new in replacements:
    s = s.replace(old, new)

# ---- Safety: ensure no leftover user endpoints ----
if "/user/tokens" in s:
    print("WARNING: Some /user/tokens still remain")

# ---- Ensure CF_ACCOUNT_ID required ----
if "CF_ACCOUNT_ID" not in s:
    raise SystemExit("CF_ACCOUNT_ID missing in script")

# ---- Optional: log migration marker ----
if "ACCOUNT_TOKEN_MODE" not in s:
    s = s.replace(
        "set -Eeuo pipefail",
        "set -Eeuo pipefail\n\n# ACCOUNT_TOKEN_MODE enabled (auto-patched)"
    )

p.write_text(s)
PY

chmod +x "$TARGET"

echo
echo "✅ Patch complete."
echo "Backup saved next to script."
echo
echo "Next: run dry test"
echo
echo "CF_ACCOUNT_ID=... CF_ZONE_ID=... CF_BOOTSTRAP_TOKEN=... \\"
echo "scripts/cloudflare/clean-and-regenerate-tokens.sh --dry-run"
