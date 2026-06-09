#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

ACTION="${1:-status}"
WEB_DIR="apps/web"
API_DIR="apps/api"
RUNTIME_DIR="runtime/app-servers"
REPORT="reports/platform/zcfdash-control-panel.md"
mkdir -p "$RUNTIME_DIR" "$(dirname "$REPORT")"

WEB_HOST="${WEB_HOST:-127.0.0.1}"
WEB_PORT="${WEB_PORT:-3003}"
API_HOST="${API_HOST:-127.0.0.1}"
API_PORT="${API_PORT:-8088}"
WEB_PID="$RUNTIME_DIR/zcfdash-web-${WEB_PORT}.pid"
API_PID="$RUNTIME_DIR/zcfdash-api-${API_PORT}.pid"
WEB_LOG="$RUNTIME_DIR/zcfdash-web-${WEB_PORT}.log"
API_LOG="$RUNTIME_DIR/zcfdash-api-${API_PORT}.log"

WEB_PUBLIC="https://zcfdash.zeaz.dev"
API_PUBLIC="https://api-zcfdash.zeaz.dev"

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

| Service | Public hostname | Local origin | Status |
|---|---|---|---|
| UI | ${WEB_PUBLIC} | http://${WEB_HOST}:${WEB_PORT} | ${web_status} |
| API | ${API_PUBLIC} | http://${API_HOST}:${API_PORT} | ${api_status} |

## Commands

\`\`\`bash
make -f Makefile -f Makefile.app-servers zcfdash-control-start
make -f Makefile -f Makefile.app-servers zcfdash-control-status
make apps-port-refactor-generate
\`\`\`
EOF_REPORT
}

service_status() {
  local name="$1" pid_file="$2" url="$3"
  if alive "$pid_file"; then
    echo "RUNNING pid=$(cat "$pid_file")"
    return 0
  fi
  if command -v curl >/dev/null 2>&1 && curl -fsS --max-time 2 "$url" >/dev/null 2>&1; then
    echo "RUNNING external"
    return 0
  fi
  echo "STOPPED"
}

status() {
  local web_status api_status
  web_status="$(service_status web "$WEB_PID" "http://${WEB_HOST}:${WEB_PORT}/dashboard")"
  api_status="$(service_status api "$API_PID" "http://${API_HOST}:${API_PORT}/api/runtime/cloudflare/health")"
  echo "UI  ${WEB_PUBLIC} -> http://${WEB_HOST}:${WEB_PORT} :: ${web_status}"
  echo "API ${API_PUBLIC} -> http://${API_HOST}:${API_PORT} :: ${api_status}"
  write_report "$web_status" "$api_status"
}

start_api() {
  if alive "$API_PID"; then
    return 0
  fi
  test -d "$API_DIR" || { echo "ERROR: missing $API_DIR" >&2; exit 1; }
  echo "START: api-zcfdash API origin http://${API_HOST}:${API_PORT}"
  (cd "$API_DIR" && nohup python3 -m uvicorn main:app --host "$API_HOST" --port "$API_PORT" >> "${ROOT}/${API_LOG}" 2>&1 & echo $! > "${ROOT}/${API_PID}")
}

start_web() {
  if alive "$WEB_PID"; then
    return 0
  fi
  test -d "$WEB_DIR" || { echo "ERROR: missing $WEB_DIR" >&2; exit 1; }
  echo "START: zcfdash web origin http://${WEB_HOST}:${WEB_PORT}"
  if [ -f "$WEB_DIR/pnpm-lock.yaml" ]; then
    (cd "$WEB_DIR" && nohup bash -lc "corepack enable >/dev/null 2>&1 || true; HOST=${WEB_HOST} PORT=${WEB_PORT} pnpm run dev -- --hostname ${WEB_HOST} --port ${WEB_PORT}" >> "${ROOT}/${WEB_LOG}" 2>&1 & echo $! > "${ROOT}/${WEB_PID}")
  elif [ -f "$WEB_DIR/yarn.lock" ]; then
    (cd "$WEB_DIR" && nohup bash -lc "HOST=${WEB_HOST} PORT=${WEB_PORT} yarn dev --hostname ${WEB_HOST} --port ${WEB_PORT}" >> "${ROOT}/${WEB_LOG}" 2>&1 & echo $! > "${ROOT}/${WEB_PID}")
  else
    (cd "$WEB_DIR" && nohup bash -lc "HOST=${WEB_HOST} PORT=${WEB_PORT} npm run dev -- --hostname ${WEB_HOST} --port ${WEB_PORT}" >> "${ROOT}/${WEB_LOG}" 2>&1 & echo $! > "${ROOT}/${WEB_PID}")
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

case "$ACTION" in
  start) start ;;
  stop) stop ;;
  restart) stop || true; start ;;
  status|report) status ;;
  *) echo "Usage: $0 start|stop|restart|status|report" >&2; exit 2 ;;
esac
