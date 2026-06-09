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

config=infrastructure/cloudflare/config.yml
api=0
while [ "$#" -gt 0 ]; do
  case "$1" in
    --config) config="${2:?missing config}"; shift 2;;
    --api-check) api=1; shift;;
    --help|-h) usage; exit 0;;
    *) echo "ERROR: unknown argument $1" >&2; exit 2;;
  esac
done

[ -f "$config" ] || { echo "ERROR: missing $config" >&2; exit 1; }
[ -x scripts/ports/list-all-ports.sh ] || { echo "ERROR: missing executable scripts/ports/list-all-ports.sh" >&2; exit 1; }

python3 - "$config" <<'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8")

if "${" in text:
    raise SystemExit("cloudflared config must not contain shell env placeholders; render a runtime config instead")

if re.search(r"(api_token|token|secret):\s*[^\s#]", text, re.I):
    raise SystemExit("possible committed token/secret in config")

if "http_status:404" not in text:
    raise SystemExit("missing fallback http_status:404 ingress rule")

if "service: http://localhost:80" not in text:
    raise SystemExit("Cloudflare ingress should route through Nginx on localhost:80")
PY

while IFS='|' read -r app domain port path; do
  [ -n "$app" ] || continue
  [ "$domain" != internal ] || continue
  grep -q "hostname: $domain" "$config" || { echo "ERROR: missing Cloudflare hostname $domain" >&2; exit 1; }
  grep -A1 "hostname: $domain" "$config" | grep -q "service: http://localhost:80" || {
    echo "ERROR: hostname $domain must route through Nginx localhost:80" >&2
    exit 1
  }
done < <(scripts/ports/list-all-ports.sh --plain)

if [ "$api" -eq 1 ]; then
  for name in CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ZONE_ID CLOUDFLARE_TUNNEL_ID; do
    [ -n "${!name:-}" ] || { echo "ERROR: $name is required for --api-check" >&2; exit 1; }
  done
  log "Cloudflare API env presence check passed (values not printed)"
fi

log "Cloudflare config offline validation passed"
