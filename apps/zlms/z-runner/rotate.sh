#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
load_env
reason="${1:-scheduled-rotation}"
log warn "rotating runner: $reason"
if command -v systemctl >/dev/null 2>&1; then
  systemctl restart zrunner.service
else
  pkill -TERM -f 'Runner.Listener|run.sh' || true
fi
