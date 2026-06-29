#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

ACTION="${1:-status}"
PLAN="${APPS_PORT_PLAN:-configs/platform/apps-port-plan.json}"
OVERLAY_GLOB="${APPS_ROUTE_OVERLAY_GLOB:-configs/platform/*-route-overlay.json}"
RUNTIME_DIR="${APPS_SERVER_RUNTIME_DIR:-runtime/app-servers}"
REPORT="reports/platform/apps-server-control.md"
HOST_BIND="${HOST_BIND:-127.0.0.1}"
ONLY_APP="${APP:-}"
ONLY_HOST="${HOST_FILTER:-}"
INCLUDE_RESERVED="${INCLUDE_RESERVED:-true}"
mkdir -p "$RUNTIME_DIR" "$(dirname "$REPORT")"

usage() {
  cat <<'EOF'
Usage:
  bash scripts/platform/apps-server-control.sh start|stop|restart|status|report

Route sources:
  APPS_PORT_PLAN=configs/platform/apps-port-plan.json
  APPS_ROUTE_OVERLAY_GLOB=configs/platform/*-route-overlay.json

Filters:
  APP=<app_id>                 Limit to one app_id from base plan or overlays
  HOST_FILTER=<hostname>       Limit to one hostname from base plan or overlays
  INCLUDE_RESERVED=false       Skip reserved routes

Examples:
  make -f Makefile -f Makefile.app-servers apps-server-status
  make -f Makefile -f Makefile.app-servers apps-server-start
  APP=zcfdash make -f Makefile -f Makefile.app-servers apps-server-start
  HOST_FILTER=zcfdash.zeaz.dev make -f Makefile -f Makefile.app-servers apps-server-start
  make -f Makefile -f Makefile.app-servers apps-server-stop
EOF
}

if [ ! -f "$PLAN" ]; then
  echo "ERROR: missing route plan: $PLAN" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 is required" >&2
  exit 1
fi

json_routes() {
  python3 - "$PLAN" "$OVERLAY_GLOB" "$ONLY_APP" "$ONLY_HOST" "$INCLUDE_RESERVED" <<'PY'
import glob
import json
import sys
from pathlib import Path

plan_path, overlay_glob, only_app, only_host, include_reserved_raw = sys.argv[1:6]
include_reserved = include_reserved_raw.lower() == 'true'
routes = []

base = Path(plan_path)
if base.exists():
    routes.extend(json.loads(base.read_text()).get('routes', []))

for overlay_path in sorted(glob.glob(overlay_glob)):
    overlay = json.loads(Path(overlay_path).read_text())
    overlay_routes = overlay.get('routes', [])
    if not isinstance(overlay_routes, list):
        raise SystemExit(f"ERROR: overlay routes must be a list: {overlay_path}")
    routes.extend(overlay_routes)

seen = set()
for r in routes:
    app_id = r.get('app_id') or ''
    hostname = r.get('hostname') or ''
    path = r.get('path') or ''
    role = r.get('role') or ''
    status = r.get('status') or ''
    port = str(r.get('port') or '')
    origin = r.get('origin') or ''
    alias_for = r.get('alias_for') or ''

    if not path or path.startswith('system/') or role == 'tcp':
        continue
    if only_app and only_app not in {app_id, alias_for, path.split('/')[-1]}:
        continue
    if only_host and hostname != only_host:
        continue
    if not include_reserved and status == 'reserved':
        continue

    # Start one local process per app path + origin port. Multiple hostnames can share it.
    key = (path, port, origin)
    if key in seen:
        continue
    seen.add(key)
    print('\t'.join([app_id, hostname, path, port, role, status, origin, alias_for]))
PY
}

pm_for_dir() {
  local dir="$1"
  if [ -f "$dir/pnpm-lock.yaml" ]; then echo pnpm
  elif [ -f "$dir/yarn.lock" ]; then echo yarn
  elif [ -f "$dir/package-lock.json" ]; then echo npm
  elif [ -f "$dir/package.json" ]; then echo npm
  else echo ""
  fi
}

package_script() {
  local dir="$1"
  python3 - "$dir/package.json" <<'PY' 2>/dev/null || true
import json, sys
from pathlib import Path
p = Path(sys.argv[1])
if not p.exists():
    raise SystemExit(0)
data = json.loads(p.read_text())
scripts = data.get('scripts') or {}
for name in ('server-start', 'start', 'preview', 'dev'):
    if name in scripts:
        print(name)
        break
PY
}

pid_file_for() {
  local app_id="$1" port="$2"
  echo "$ROOT/$RUNTIME_DIR/${app_id}-${port}.pid"
}

log_file_for() {
  local app_id="$1" port="$2"
  echo "$ROOT/$RUNTIME_DIR/${app_id}-${port}.log"
}

is_pid_alive() {
  local pid_file="$1"
  [ -f "$pid_file" ] || return 1
  local pid
  pid="$(cat "$pid_file" 2>/dev/null || true)"
  [ -n "$pid" ] || return 1
  kill -0 "$pid" >/dev/null 2>&1
}

route_status() {
  local app_id="$1" hostname="$2" path="$3" port="$4" role="$5" status="$6" origin="$7" alias_for="${8:-}"
  local pid_file
  pid_file="$(pid_file_for "$app_id" "$port")"
  if is_pid_alive "$pid_file"; then
    echo "RUNNING pid=$(cat "$pid_file") app=$app_id host=$hostname port=$port path=$path alias=${alias_for:-none}"
  elif command -v curl >/dev/null 2>&1 && curl -fsS --max-time 2 "http://127.0.0.1:${port}/" >/dev/null 2>&1; then
    echo "RUNNING external app=$app_id host=$hostname port=$port path=$path alias=${alias_for:-none}"
  else
    echo "STOPPED app=$app_id host=$hostname port=$port path=$path alias=${alias_for:-none}"
  fi
}

start_route() {
  local app_id="$1" hostname="$2" path="$3" port="$4" role="$5" status="$6" origin="$7" alias_for="${8:-}"
  local dir="$ROOT/$path"
  local pid_file log_file pm script cmd
  pid_file="$(pid_file_for "$app_id" "$port")"
  log_file="$(log_file_for "$app_id" "$port")"

  if is_pid_alive "$pid_file"; then
    echo "SKIP: already running app=$app_id pid=$(cat "$pid_file") port=$port"
    return 0
  fi

  if [ ! -d "$dir" ]; then
    echo "WARN: missing app dir app=$app_id path=$path"
    return 0
  fi

  if [ -f "$dir/Makefile" ] && grep -Eq '^server-start:' "$dir/Makefile"; then
    echo "START: make -C $path server-start"
    (cd "$dir" && HOST="$HOST_BIND" PORT="$port" make server-start) >> "$log_file" 2>&1 || {
      echo "WARN: app Makefile server-start failed app=$app_id; see $log_file"
      return 0
    }
    echo "OK: delegated start app=$app_id"
    return 0
  fi

  if [ -f "$dir/docker-compose.yml" ] || [ -f "$dir/compose.yml" ] || [ -f "$dir/docker-compose.yaml" ] || [ -f "$dir/compose.yaml" ]; then
    echo "START: docker compose up -d app=$app_id"
    (cd "$dir" && docker compose up -d) >> "$log_file" 2>&1 || {
      echo "WARN: docker compose start failed app=$app_id; see $log_file"
      return 0
    }
    echo "OK: docker compose started app=$app_id"
    return 0
  fi

  pm="$(pm_for_dir "$dir")"
  if [ -n "$pm" ]; then
    script="$(package_script "$dir")"
    if [ -n "$script" ]; then
      case "$pm" in
        pnpm) cmd="corepack enable >/dev/null 2>&1 || true; HOST=$HOST_BIND PORT=$port pnpm run $script" ;;
        yarn) cmd="HOST=$HOST_BIND PORT=$port yarn $script" ;;
        npm) cmd="HOST=$HOST_BIND PORT=$port npm run $script" ;;
      esac
      echo "START: $pm run $script app=$app_id port=$port"
      touch "$log_file"
      (cd "$dir" && nohup $pm run $script < /dev/null >> "$log_file" 2>&1 & echo $! > "$pid_file")
      sleep 1
      route_status "$app_id" "$hostname" "$path" "$port" "$role" "$status" "$origin" "$alias_for"
      return 0
    fi
  fi

  if find "$dir" -maxdepth 2 -type f -name '*.py' | grep -q .; then
    if command -v uvicorn >/dev/null 2>&1 && [ -f "$dir/main.py" ]; then
      echo "START: uvicorn main:app app=$app_id port=$port"
      (cd "$dir" && nohup uvicorn main:app --host "$HOST_BIND" --port "$port" >> "$log_file" 2>&1 & echo $! > "$pid_file")
      sleep 1
      route_status "$app_id" "$hostname" "$path" "$port" "$role" "$status" "$origin" "$alias_for"
      return 0
    fi
  fi

  echo "SKIP: no supported start command app=$app_id path=$path"
}

stop_route() {
  local app_id="$1" hostname="$2" path="$3" port="$4" role="$5" status="$6" origin="$7" alias_for="${8:-}"
  local dir="$ROOT/$path"
  local pid_file pid
  pid_file="$(pid_file_for "$app_id" "$port")"

  if [ -d "$dir" ] && [ -f "$dir/Makefile" ] && grep -Eq '^server-stop:' "$dir/Makefile"; then
    echo "STOP: make -C $path server-stop"
    (cd "$dir" && make server-stop) >/dev/null 2>&1 || true
  fi

  if [ -d "$dir" ] && { [ -f "$dir/docker-compose.yml" ] || [ -f "$dir/compose.yml" ] || [ -f "$dir/docker-compose.yaml" ] || [ -f "$dir/compose.yaml" ]; }; then
    echo "STOP: docker compose down app=$app_id"
    (cd "$dir" && docker compose down) >/dev/null 2>&1 || true
  fi

  if is_pid_alive "$pid_file"; then
    pid="$(cat "$pid_file")"
    echo "STOP: pid=$pid app=$app_id port=$port"
    kill "$pid" >/dev/null 2>&1 || true
    sleep 1
    kill -9 "$pid" >/dev/null 2>&1 || true
  fi
  rm -f "$pid_file"
}

write_report_header() {
  cat > "$REPORT" <<EOF_REPORT
# Apps server control report

Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Action: \`$ACTION\`
Base plan: \`$PLAN\`
Overlay glob: \`$OVERLAY_GLOB\`

| App | Hostname | Alias | Path | Port | Role | Status | Result |
|---|---|---|---|---:|---|---|---|
EOF_REPORT
}

run_routes() {
  write_report_header
  while IFS=$'\t' read -r app_id hostname path port role status origin alias_for; do
    [ -n "$app_id" ] || continue
    result=""
    case "$ACTION" in
      start) result="$(start_route "$app_id" "$hostname" "$path" "$port" "$role" "$status" "$origin" "$alias_for" | tail -n 1)" ;;
      stop) result="$(stop_route "$app_id" "$hostname" "$path" "$port" "$role" "$status" "$origin" "$alias_for" | tail -n 1 || true)" ;;
      restart) stop_route "$app_id" "$hostname" "$path" "$port" "$role" "$status" "$origin" "$alias_for" >/dev/null 2>&1 || true; result="$(start_route "$app_id" "$hostname" "$path" "$port" "$role" "$status" "$origin" "$alias_for" | tail -n 1)" ;;
      status|report) result="$(route_status "$app_id" "$hostname" "$path" "$port" "$role" "$status" "$origin" "$alias_for")" ;;
      *) usage; exit 2 ;;
    esac
    echo "$result"
    printf '| `%s` | `%s` | `%s` | `%s` | `%s` | `%s` | `%s` | `%s` |\n' "$app_id" "$hostname" "${alias_for:-}" "$path" "$port" "$role" "$status" "${result//|/ }" >> "$REPORT"
  done < <(json_routes)
  echo "PASS: wrote $REPORT"
}

case "$ACTION" in
  start|stop|restart|status|report) run_routes ;;
  help|-h|--help) usage ;;
  *) usage; exit 2 ;;
esac
