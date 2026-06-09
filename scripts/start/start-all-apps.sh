#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage(){ cat <<'USAGE'
Usage: start-all-apps.sh [--dry-run] [--app NAME]

Starts canonical apps with PORT/APP_DOMAIN/APP_BASE_URL exported. Runtime logs and
PID files are written under .runtime/apps.
USAGE
}
log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
trap 'log "ERROR: app startup failed at line $LINENO"' ERR
dry=0; only=""
while [ "$#" -gt 0 ]; do case "$1" in --dry-run) dry=1; shift;; --app) only="${2:?missing app}"; shift 2;; --help|-h) usage; exit 0;; *) echo "ERROR: unknown argument $1" >&2; exit 2;; esac; done
mkdir -p .runtime/apps
choose_cmd(){ local dir="$1"; if [ -f "$dir/package.json" ]; then python3 - <<'PY' "$dir/package.json"
import json,sys
s=(json.load(open(sys.argv[1])).get('scripts') or {})
for k in ('start','dev','dev:web'):
    if k in s:
        print(k); break
PY
  elif [ -f "$dir/frontend/package.json" ]; then echo "frontend:start"; elif [ -f "$dir/requirements.txt" ]; then echo "python"; fi; }
while IFS='|' read -r app domain port dir; do
  [ -z "$only" ] || [ "$only" = "$app" ] || continue
  if [ ! -d "$dir" ]; then log "WARN: $app missing at $dir; skipped"; continue; fi
  pidfile=".runtime/apps/$app.pid"; logfile=".runtime/apps/$app.log"
  if [ -f "$pidfile" ] && kill -0 "$(cat "$pidfile")" 2>/dev/null; then log "$app already running pid=$(cat "$pidfile")"; continue; fi
  cmd="$(choose_cmd "$dir" || true)"
  [ -n "$cmd" ] || { log "WARN: no start command detected for $app; skipped"; continue; }
  log "starting $app on port $port using $cmd"
  if [ "$dry" -eq 1 ]; then continue; fi
  (
    cd "$dir"
    export PORT="$port" APP_NAME="$app" APP_DOMAIN="$domain" APP_BASE_URL="https://$domain"
    case "$cmd" in
      frontend:start) cd frontend; if command -v pnpm >/dev/null 2>&1; then exec pnpm run start; else exec npm run start; fi ;;
      python) exec python3 -m uvicorn main:app --host 0.0.0.0 --port "$PORT" ;;
      *) if command -v pnpm >/dev/null 2>&1 && [ -f pnpm-lock.yaml ]; then exec pnpm run "$cmd"; else exec npm run "$cmd"; fi ;;
    esac
  ) >>"$logfile" 2>&1 &
  echo $! > "$pidfile"
done < <(scripts/ports/list-all-ports.sh --plain)
