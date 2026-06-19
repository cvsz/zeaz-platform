#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
RUNTIME_DIR="${ZQUEST_RUNTIME_DIR:-$ROOT/runtime/zquest}"
PID_FILE="${ZQUEST_PID_FILE:-$RUNTIME_DIR/zquest.pid}"
LOG_FILE="${ZQUEST_LOG_FILE:-$RUNTIME_DIR/zquest.log}"
PYTHON_BIN="${PYTHON:-python3}"
HOST="${ZQUEST_HOST:-127.0.0.1}"
PORT="${ZQUEST_PORT:-8080}"
DOCROOT="${ZQUEST_DOCROOT:-$ROOT/apps/zquest}"
DB_PATH="${ZQUEST_DATABASE_PATH:-$ROOT/apps/zeaz-api/data/zquest.sqlite3}"
SERVER_SCRIPT="${ZQUEST_SERVER_SCRIPT:-$ROOT/scripts/zquest-server.py}"

usage() {
  cat <<'EOF'
Usage: scripts/zquest-control.sh start|stop|status|restart
EOF
}

log() {
  printf '[zquest] %s\n' "$*"
}

is_running() {
  [[ -f "$PID_FILE" ]] || return 1
  local pid
  pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  [[ -n "$pid" ]] || return 1
  kill -0 "$pid" >/dev/null 2>&1
}

start() {
  mkdir -p "$RUNTIME_DIR"
  if is_running; then
    log "already running pid=$(cat "$PID_FILE") port=$PORT"
    return 0
  fi
  if [[ ! -f "$SERVER_SCRIPT" ]]; then
    log "missing server script: $SERVER_SCRIPT"
    return 1
  fi
  log "starting on http://${HOST}:${PORT}"
  nohup env ZQUEST_HOST="$HOST" ZQUEST_PORT="$PORT" ZQUEST_DOCROOT="$DOCROOT" ZQUEST_DATABASE_PATH="$DB_PATH" \
    "$PYTHON_BIN" "$SERVER_SCRIPT" >"$LOG_FILE" 2>&1 &
  echo $! >"$PID_FILE"
  for _ in $(seq 1 20); do
    if curl -fsS --max-time 1 "http://${HOST}:${PORT}/api/runtime/zquest/health" >/dev/null 2>&1; then
      status
      return 0
    fi
    if ! is_running; then
      log "process exited early; see $LOG_FILE"
      [[ -s "$LOG_FILE" ]] && sed -n '1,120p' "$LOG_FILE"
      return 1
    fi
    sleep 0.25
  done
  log "timed out waiting for health; see $LOG_FILE"
  [[ -s "$LOG_FILE" ]] && sed -n '1,120p' "$LOG_FILE"
  return 1
}

stop() {
  if ! is_running; then
    log "not running"
    rm -f "$PID_FILE"
    return 0
  fi
  local pid
  pid="$(cat "$PID_FILE")"
  log "stopping pid=$pid"
  kill "$pid" >/dev/null 2>&1 || true
  sleep 1
  kill -9 "$pid" >/dev/null 2>&1 || true
  rm -f "$PID_FILE"
}

status() {
  if is_running; then
    if curl -fsS --max-time 2 "http://${HOST}:${PORT}/api/runtime/zquest/health" >/dev/null 2>&1; then
      log "running pid=$(cat "$PID_FILE") http://${HOST}:${PORT}"
      return 0
    fi
    log "pid file present but health is not ready; see $LOG_FILE"
    return 1
  fi
  if command -v curl >/dev/null 2>&1 && curl -fsS --max-time 2 "http://${HOST}:${PORT}/api/runtime/zquest/health" >/dev/null 2>&1; then
    log "running external http://${HOST}:${PORT}"
    return 0
  fi
  log "stopped"
}

smoke() {
  "$PYTHON_BIN" "$ROOT/scripts/zquest-smoke.py" --base-url "http://${HOST}:${PORT}"
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  restart) stop; start ;;
  status) status ;;
  smoke) smoke ;;
  help|-h|--help|"") usage ;;
  *) usage; exit 2 ;;
esac
