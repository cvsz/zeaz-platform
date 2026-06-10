#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

ACTION="${1:-status}"
APP_DIR="apps/zdash"
HOSTNAME="zcfdash.zeaz.dev"
HOST_BIND="${HOST_BIND:-127.0.0.1}"
PORT="${PORT:-5173}"
PUBLIC_URL="https://${HOSTNAME}"
LOCAL_URL="http://${HOST_BIND}:${PORT}"
RUNTIME_DIR="runtime/app-servers"
PID_FILE="${RUNTIME_DIR}/zcfdash-${PORT}.pid"
LOG_FILE="${RUNTIME_DIR}/zcfdash-${PORT}.log"
REPORT="reports/platform/zcfdash-server.md"
mkdir -p "$RUNTIME_DIR" "$(dirname "$REPORT")"

is_alive() {
  [ -f "$PID_FILE" ] || return 1
  local pid
  pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  [ -n "$pid" ] || return 1
  kill -0 "$pid" >/dev/null 2>&1
}

write_report() {
  local result="$1"
  cat > "$REPORT" <<EOF_REPORT
# zcfdash server report

Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Hostname: ${HOSTNAME}
Local origin: ${LOCAL_URL}
Public route: ${PUBLIC_URL}
App path: ${APP_DIR}
Result: ${result}

EOF_REPORT
}

status() {
  if is_alive; then
    local msg="RUNNING pid=$(cat "$PID_FILE") ${LOCAL_URL} -> ${PUBLIC_URL}"
    echo "$msg"
    write_report "$msg"
    return 0
  fi

  if command -v curl >/dev/null 2>&1 && curl -fsS --max-time 2 "$LOCAL_URL/" >/dev/null 2>&1; then
    local msg="RUNNING external ${LOCAL_URL} -> ${PUBLIC_URL}"
    echo "$msg"
    write_report "$msg"
    return 0
  fi

  local msg="STOPPED ${LOCAL_URL} -> ${PUBLIC_URL}"
  echo "$msg"
  write_report "$msg"
}

start() {
  if [ ! -d "$APP_DIR" ]; then
    echo "ERROR: missing ${APP_DIR}" >&2
    exit 1
  fi

  if is_alive; then
    status
    return 0
  fi

  if [ -f "$APP_DIR/Makefile" ] && grep -Eq '^server-start:' "$APP_DIR/Makefile"; then
    echo "START: make -C ${APP_DIR} server-start for ${HOSTNAME}"
    (cd "$APP_DIR" && HOST="$HOST_BIND" PORT="$PORT" make server-start) >> "$LOG_FILE" 2>&1 || {
      echo "WARN: delegated zDash server-start failed; fallback to Node start; see ${LOG_FILE}"
    }
    status
    return 0
  fi

  if [ -f "$APP_DIR/frontend/package.json" ]; then
    echo "START: zcfdash frontend origin on ${LOCAL_URL}"
    if [ -f "$APP_DIR/frontend/pnpm-lock.yaml" ]; then
      (cd "$APP_DIR/frontend" && nohup bash -lc "corepack enable >/dev/null 2>&1 || true; HOST=${HOST_BIND} PORT=${PORT} pnpm run dev -- --host ${HOST_BIND} --port ${PORT}" >> "${ROOT}/${LOG_FILE}" 2>&1 & echo $! > "${ROOT}/${PID_FILE}")
    elif [ -f "$APP_DIR/frontend/package-lock.json" ]; then
      (cd "$APP_DIR/frontend" && nohup bash -lc "HOST=${HOST_BIND} PORT=${PORT} npm run dev -- --host ${HOST_BIND} --port ${PORT}" >> "${ROOT}/${LOG_FILE}" 2>&1 & echo $! > "${ROOT}/${PID_FILE}")
    else
      (cd "$APP_DIR/frontend" && nohup bash -lc "HOST=${HOST_BIND} PORT=${PORT} npm run dev -- --host ${HOST_BIND} --port ${PORT}" >> "${ROOT}/${LOG_FILE}" 2>&1 & echo $! > "${ROOT}/${PID_FILE}")
    fi
    sleep 2
    status
    return 0
  fi

  echo "ERROR: no supported zcfdash start path found" >&2
  exit 1
}

stop() {
  if [ -f "$APP_DIR/Makefile" ] && grep -Eq '^server-stop:' "$APP_DIR/Makefile"; then
    (cd "$APP_DIR" && make server-stop) >/dev/null 2>&1 || true
  fi

  if is_alive; then
    local pid
    pid="$(cat "$PID_FILE")"
    echo "STOP: pid=${pid} ${HOSTNAME}"
    kill "$pid" >/dev/null 2>&1 || true
    sleep 1
    kill -9 "$pid" >/dev/null 2>&1 || true
  fi
  rm -f "$PID_FILE"
  status
}

case "$ACTION" in
  start) start ;;
  stop) stop ;;
  restart) stop || true; start ;;
  status|report) status ;;
  *) echo "Usage: $0 start|stop|restart|status|report" >&2; exit 2 ;;
esac
