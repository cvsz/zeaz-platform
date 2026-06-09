#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage() { echo 'Usage: scripts/start/stop-all-apps.sh'; }
[[ "${1:-}" =~ ^(--help|-h)$ ]] && { usage; exit 0; }
for pidfile in .runtime/pids/*.pid; do
  [[ -f "$pidfile" ]] || continue
  pid=$(cat "$pidfile")
  if [[ "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" 2>/dev/null; then
    printf '[zeaz-stop] stopping %s\n' "$pid"
    kill "$pid" || true
  fi
  rm -f "$pidfile"
done
