#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

ACTION="${1:-status}"
PLAN="${APPS_PORT_PLAN:-configs/platform/apps-port-plan.json}"
OVERLAY_GLOB="${APPS_ROUTE_OVERLAY_GLOB:-configs/platform/*-route-overlay.json}"
WEB_HOSTNAME="${WEB_HOSTNAME:-zcfdash.zeaz.dev}"
API_HOSTNAME="${API_HOSTNAME:-api-zcfdash.zeaz.dev}"
WEB_DIR="apps/zeaz-web"
API_DIR="apps/zeaz-api"
RUNTIME_DIR="runtime/app-servers"
REPORT="reports/platform/zcfdash-control-panel.md"
mkdir -p "$RUNTIME_DIR" "$(dirname "$REPORT")"

WEB_HOST="${WEB_HOST:-127.0.0.1}"
API_HOST="${API_HOST:-127.0.0.1}"
WEB_PUBLIC="https://${WEB_HOSTNAME}"
API_PUBLIC="https://${API_HOSTNAME}"

route_field() {
  local hostname="$1" field="$2"
  python3 - "$PLAN" "$OVERLAY_GLOB" "$hostname" "$field" <<'PY'
import glob, json, sys
from pathlib import Path
plan_path, overlay_glob, hostname, field = sys.argv[1:5]
routes = []
base = Path(plan_path)
if base.exists():
    routes.extend(json.loads(base.read_text()).get("routes", []))
for overlay_path in sorted(glob.glob(overlay_glob)):
    routes.extend(json.loads(Path(overlay_path).read_text()).get("routes", []))
for route in routes:
    if route.get("hostname") == hostname:
        print(route.get(field, ""))
        raise SystemExit(0)
raise SystemExit(1)
PY
}

WEB_PORT="${WEB_PORT:-$(route_field "$WEB_HOSTNAME" port 2>/dev/null || true)}"
API_PORT="${API_PORT:-$(route_field "$API_HOSTNAME" port 2>/dev/null || true)}"
WEB_DIR="${WEB_DIR_OVERRIDE:-$(route_field "$WEB_HOSTNAME" path 2>/dev/null || echo "$WEB_DIR")}" 
API_DIR="${API_DIR_OVERRIDE:-$(route_field "$API_HOSTNAME" path 2>/dev/null || echo "$API_DIR")}" 

if [ -z "$WEB_PORT" ] || [ -z "$API_PORT" ]; then
  echo "ERROR: missing zcfdash ports in app route list/overlay" >&2
  echo "Expected hostnames: $WEB_HOSTNAME and $API_HOSTNAME" >&2
  echo "Run or inspect: $PLAN and $OVERLAY_GLOB" >&2
  exit 1
fi

WEB_PID="$RUNTIME_DIR/zcfdash-web-${WEB_PORT}.pid"
API_PID="$RUNTIME_DIR/zcfdash-api-${API_PORT}.pid"
WEB_LOG="$RUNTIME_DIR/zcfdash-web-${WEB_PORT}.log"
API_LOG="$RUNTIME_DIR/zcfdash-api-${API_PORT}.log"

alive() {
  local pid_file="$1"
  [ -f "$pid_file" ] || return 1
  local pid
  pid="$(cat "$pid_file" 2>/dev/null || true)"
  [ -n "$pid" ] || return 1
  kill -0 "$pid" >/dev/null 2>&1
}

write_report() {
  local web_status="$1" api_status="$2"
  cat > "$REPORT" <<EOF_REPORT
# zcfdash Cloudflare control panel server report

Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Port source: app route list + route overlays
Base plan: ${PLAN}
Overlay glob: ${OVERLAY_GLOB}

| Service | Public hostname | App path | Local origin | Status |
|---|---|---|---|---|
| UI | ${WEB_PUBLIC} | ${WEB_DIR} | http://${WEB_HOST}:${WEB_PORT} | ${web_status} |
| API | ${API_PUBLIC} | ${API_DIR} | http://${API_HOST}:${API_PORT} | ${api_status} |

## Commands

\`\`\`bash
make -f Makefile -f Makefile.app-servers zcfdash-control-start
make -f Makefile -f Makefile.app-servers zcfdash-control-status
make apps-port-refactor-generate
\`\`\`
EOF_REPORT
}

service_status() {
  local pid_file="$1" url="$2"
  if alive "$pid_file"; then
    echo "RUNNING pid=$(cat "$pid_file")"
    return 0
  fi
  if command -v curl >/dev/null 2>&1 && curl -sS --max-time 2 "$url" >/dev/null 2>&1; then
    echo "RUNNING external"
    return 0
  fi
  echo "STOPPED"
}

status() {
  local web_status api_status
  web_status="$(service_status "$WEB_PID" "http://${WEB_HOST}:${WEB_PORT}/dashboard")"
  api_status="$(service_status "$API_PID" "http://${API_HOST}:${API_PORT}/api/runtime/cloudflare/health")"
  echo "UI  ${WEB_PUBLIC} -> http://${WEB_HOST}:${WEB_PORT} (${WEB_DIR}) :: ${web_status}"
  echo "API ${API_PUBLIC} -> http://${API_HOST}:${API_PORT} (${API_DIR}) :: ${api_status}"
  write_report "$web_status" "$api_status"
}

start_api() {
  if alive "$API_PID"; then
    return 0
  fi
  test -d "$API_DIR" || { echo "ERROR: missing $API_DIR" >&2; exit 1; }
  echo "START: ${API_HOSTNAME} API origin http://${API_HOST}:${API_PORT} from ${API_DIR}"
  (cd "$API_DIR" && setsid bash -lc "echo \$\$ > \"${ROOT}/${API_PID}\"; exec env PYTHONPATH=\"${ROOT}\" \"${ROOT}/apps/ztrader/backend/.venv/bin/python3\" -m uvicorn main:app --host \"$API_HOST\" --port \"$API_PORT\"" >> "${ROOT}/${API_LOG}" 2>&1 &)
}

start_web() {
  if alive "$WEB_PID"; then
    return 0
  fi
  test -d "$WEB_DIR" || { echo "ERROR: missing $WEB_DIR" >&2; exit 1; }
  echo "START: ${WEB_HOSTNAME} web origin http://${WEB_HOST}:${WEB_PORT} from ${WEB_DIR}"
  if [ -f "$WEB_DIR/pnpm-lock.yaml" ]; then
    (cd "$WEB_DIR" && setsid bash -lc "echo \$\$ > \"${ROOT}/${WEB_PID}\"; corepack enable >/dev/null 2>&1 || true; exec env HOSTNAME=${WEB_HOST} PORT=${WEB_PORT} pnpm run dev" >> "${ROOT}/${WEB_LOG}" 2>&1 &)
  elif [ -f "$WEB_DIR/yarn.lock" ]; then
    (cd "$WEB_DIR" && setsid bash -lc "echo \$\$ > \"${ROOT}/${WEB_PID}\"; exec env HOSTNAME=${WEB_HOST} PORT=${WEB_PORT} yarn dev" >> "${ROOT}/${WEB_LOG}" 2>&1 &)
  else
    (cd "$WEB_DIR" && setsid bash -lc "echo \$\$ > \"${ROOT}/${WEB_PID}\"; exec env HOSTNAME=${WEB_HOST} PORT=${WEB_PORT} npm run dev" >> "${ROOT}/${WEB_LOG}" 2>&1 &)
  fi
}

start() {
  python3 scripts/platform/generate-port-refactor-assets.py >/dev/null 2>&1 || true
  start_api
  start_web
  sleep 2
  status
}

stop_one() {
  local pid_file="$1" label="$2"
  if alive "$pid_file"; then
    local pid
    pid="$(cat "$pid_file")"
    echo "STOP: $label pid=$pid"
    kill "$pid" >/dev/null 2>&1 || true
    sleep 1
    kill -9 "$pid" >/dev/null 2>&1 || true
  fi
  rm -f "$pid_file"
}

stop() {
  stop_one "$WEB_PID" web
  stop_one "$API_PID" api
  status
}

open_info() {
  echo "UI local origin:   http://${WEB_HOST}:${WEB_PORT}"
  echo "UI public route:   ${WEB_PUBLIC}"
  echo "API local origin:  http://${API_HOST}:${API_PORT}/api/runtime/cloudflare/health"
  echo "API public route:  ${API_PUBLIC}/api/runtime/cloudflare/health"
  echo "Port source:       ${PLAN} + ${OVERLAY_GLOB}"
}

case "$ACTION" in
  start) start ;;
  stop) stop ;;
  restart) stop || true; start ;;
  status|report) status ;;
  open) open_info ;;
  *) echo "Usage: $0 start|stop|restart|status|report|open" >&2; exit 2 ;;
esac
