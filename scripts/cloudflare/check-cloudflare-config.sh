#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage(){ cat <<'USAGE'
Usage: check-cloudflare-config.sh [--config PATH] [--api-check]

Offline validates the canonical cloudflared YAML. --api-check only verifies that
required Cloudflare env variables are present; it does not print values.
USAGE
}
log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
trap 'log "ERROR: Cloudflare config check failed at line $LINENO"' ERR
config=infrastructure/cloudflare/config.yml; api=0
while [ "$#" -gt 0 ]; do case "$1" in --config) config="${2:?missing config}"; shift 2;; --api-check) api=1; shift;; --help|-h) usage; exit 0;; *) echo "ERROR: unknown argument $1" >&2; exit 2;; esac; done
[ -f "$config" ] || { echo "ERROR: missing $config" >&2; exit 1; }
python3 - <<'PY' "$config"
import sys, re
path=sys.argv[1]
text=open(path).read()
required=['zow.zeaz.dev','api-zcfdash.zeaz.dev','zcfdash.zeaz.dev','zoffice.zeaz.dev','app.zeaz.dev','ztrader.zeaz.dev','dash.zeaz.dev','zaiz.zeaz.dev','zveo.zeaz.dev','zsticker.zeaz.dev','zcino.zeaz.dev','zlms.zeaz.dev','http_status:404']
missing=[x for x in required if x not in text]
if missing: raise SystemExit('missing entries: '+', '.join(missing))
if re.search(r'(api_token|token|secret):\s*[^\s${]', text, re.I): raise SystemExit('possible committed secret in config')
print('Cloudflare config offline validation passed')
PY
if [ "$api" -eq 1 ]; then
  for name in CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ZONE_ID CLOUDFLARE_TUNNEL_ID; do
    [ -n "${!name:-}" ] || { echo "ERROR: $name is required for --api-check" >&2; exit 1; }
  done
  log "Cloudflare API env presence check passed (values not printed)"
fi
