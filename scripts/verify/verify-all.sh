#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage(){ cat <<'USAGE'
Usage: verify-all.sh [--skip-domain]

Runs offline-first ZEAZ platform checks and writes reports/verify/latest.json.
USAGE
}
log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
trap 'log "ERROR: verification failed at line $LINENO"' ERR
skip_domain=0
while [ "$#" -gt 0 ]; do case "$1" in --skip-domain) skip_domain=1; shift;; --help|-h) usage; exit 0;; *) echo "ERROR: unknown argument $1" >&2; exit 2;; esac; done
mkdir -p reports/verify
json=reports/verify/latest.json
tmp="$(mktemp)"
pass=0; warn=0; fail=0
add(){ local status="$1" name="$2" detail="$3"; case "$status" in pass) pass=$((pass+1));; warn) warn=$((warn+1));; fail) fail=$((fail+1));; esac; printf '%s\t%s\t%s\n' "$status" "$name" "$detail" >> "$tmp"; }
command -v node >/dev/null 2>&1 && add pass node "$(node --version)" || add warn node missing
command -v pnpm >/dev/null 2>&1 && add pass pnpm "$(pnpm --version)" || add warn pnpm missing
command -v docker >/dev/null 2>&1 && add pass docker "$(docker --version)" || add warn docker missing
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then add pass docker_compose "$(docker compose version --short)"; else add warn docker_compose missing; fi
scripts/db/check-postgres.sh --offline >/dev/null && add pass postgres_env valid || add fail postgres_env invalid
scripts/ports/check-port-conflicts.sh >/dev/null && add pass ports canonical || add fail ports conflict
scripts/cloudflare/check-cloudflare-config.sh >/dev/null && add pass cloudflare_config valid || add fail cloudflare_config invalid
scripts/proxy/check-nginx-config.sh >/dev/null && add pass nginx_config valid || add fail nginx_config invalid
[ -f .env.example ] && add pass env_example present || add fail env_example missing
python3 - <<'PYSCAN' >/tmp/zeaz-placeholder-scan.txt
from pathlib import Path
import re
roots=[Path('.env.example'),Path('docker-compose.yml'),Path('infrastructure'),Path('scripts'),Path('docs/reports')]
terms=['replace-'+'me','change'+'me','dummy-'+'secret','fake-'+'token','change_'+'me_securely']
rx=re.compile('|'.join(re.escape(t) for t in terms), re.I)
hits=[]
for root in roots:
    paths=[root] if root.is_file() else list(root.rglob('*')) if root.exists() else []
    for p in paths:
        if not p.is_file() or p.name == 'verify-all.sh':
            continue
        try: text=p.read_text(errors='ignore')
        except Exception: continue
        for idx,line in enumerate(text.splitlines(),1):
            if rx.search(line): hits.append(f'{p}:{idx}:{line}')
if hits:
    print('\n'.join(hits))
    raise SystemExit(1)
PYSCAN
if [ -s /tmp/zeaz-placeholder-scan.txt ]; then add fail placeholder_scan "unsafe placeholders found in platform-owned files"; else add pass placeholder_scan clean; fi
while IFS='|' read -r app domain port dir; do
  if command -v curl >/dev/null 2>&1; then
    code="$(curl -fsS -m 2 -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port/health" 2>/dev/null || true)"
    [ -n "$code" ] && [ "$code" != 000 ] && add pass "local_$app" "HTTP $code" || add warn "local_$app" "not listening on $port"
    if [ "$skip_domain" -ne 1 ] && [ "$domain" != internal ]; then curl -fsSI -m 5 "https://$domain" >/dev/null 2>&1 && add pass "domain_$app" "$domain" || add warn "domain_$app" "$domain unreachable"
    fi
  fi
done < <(scripts/ports/list-all-ports.sh --plain)
python3 - <<'PY' "$tmp" "$json" "$pass" "$warn" "$fail"
import json,sys,datetime
rows=[]
for line in open(sys.argv[1]):
    status,name,detail=line.rstrip('\n').split('\t',2)
    rows.append({'status':status,'name':name,'detail':detail})
out={'generated_at':datetime.datetime.now(datetime.UTC).isoformat(),'summary':{'pass':int(sys.argv[3]),'warn':int(sys.argv[4]),'fail':int(sys.argv[5])},'checks':rows}
open(sys.argv[2],'w').write(json.dumps(out,indent=2)+'\n')
PY
cat "$json"
[ "$fail" -eq 0 ]
