#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage() { echo 'Usage: scripts/cloudflare/check-cloudflare-config.sh [--config infrastructure/cloudflare/config.yml]'; }
log() { printf '[zeaz-cloudflare-check] %s\n' "$*"; }
config=infrastructure/cloudflare/config.yml
while (($#)); do case "$1" in --config) config="$2"; shift 2;; --help|-h) usage; exit 0;; *) usage; exit 2;; esac; done
[[ -f "$config" ]] || { log "missing $config"; exit 1; }
if command -v python3 >/dev/null 2>&1; then
  python3 - "$config" <<'PY'
import re, sys
from pathlib import Path
p=Path(sys.argv[1]); text=p.read_text()
required={
'zow.zeaz.dev':'http://localhost:4101','api-zcfdash.zeaz.dev':'http://localhost:4102','zcfdash.zeaz.dev':'http://localhost:4103','zoffice.zeaz.dev':'http://localhost:4104','app.zeaz.dev':'http://localhost:4105','ztrader.zeaz.dev':'http://localhost:4106','dash.zeaz.dev':'http://localhost:4107','zaiz.zeaz.dev':'http://localhost:4108','zveo.zeaz.dev':'http://localhost:4109','zsticker.zeaz.dev':'http://localhost:4110','zcino.zeaz.dev':'http://localhost:4111','zlms.zeaz.dev':'http://localhost:4112'}
for host, svc in required.items():
    if f'hostname: {host}' not in text or f'service: {svc}' not in text:
        raise SystemExit(f'missing mapping {host} -> {svc}')
if 'http_status:404' not in text: raise SystemExit('missing fallback http_status:404')
if re.search(r'[A-Za-z0-9_-]{35,}', text.replace('${CLOUDFLARE_TUNNEL_ID}','')): raise SystemExit('config appears to contain a long token/id-like literal')
print('[zeaz-cloudflare-check] config mappings and fallback validated')
PY
fi
