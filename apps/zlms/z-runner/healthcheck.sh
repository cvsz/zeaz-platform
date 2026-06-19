#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
load_env
runner_dir="${RUNNER_INSTALL_DIR:-/opt/z-runner}/actions-runner"
[[ -x "$runner_dir/run.sh" ]] || fatal "runner binary not installed"
if pgrep -u "$(id -u)" -f 'Runner.Listener|run.sh' >/dev/null 2>&1; then
  log info "runner process healthy"
else
  fatal "runner process not found"
fi
