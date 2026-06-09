#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage() { echo 'Usage: scripts/start/check-all-apps.sh'; }
[[ "${1:-}" =~ ^(--help|-h)$ ]] && { usage; exit 0; }
status=0
scripts/ports/list-all-ports.sh | awk -F, 'NR>1 && $1!="postgres" && $1!="redis"{print $1,$4}' | while read -r app port; do
  if curl -fsS -m 2 "http://127.0.0.1:${port}/health" >/dev/null 2>&1 || curl -fsSI -m 2 "http://127.0.0.1:${port}/" >/dev/null 2>&1; then
    printf '[zeaz-app-check] ok %s port %s\n' "$app" "$port"
  else
    printf '[zeaz-app-check] unavailable %s port %s\n' "$app" "$port"
    status=1
  fi
done
exit "$status"
