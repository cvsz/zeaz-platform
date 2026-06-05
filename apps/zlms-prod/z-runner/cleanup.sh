#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
load_env
workdir="${RUNNER_WORKDIR:-/var/lib/z-runner/work}"
quarantine="${RUNNER_QUARANTINE_DIR:-/var/lib/z-runner/quarantine}"
require_cmd find
install -d -m 0700 "$quarantine"
find "$workdir" -mindepth 1 -maxdepth 1 -mmin +60 -exec rm -rf -- {} +
if command -v docker >/dev/null 2>&1; then
  docker ps -aq --filter "label=zrunner=true" | xargs -r docker rm -f >/dev/null 2>&1 || true
  docker volume ls -q --filter "label=zrunner=true" | xargs -r docker volume rm -f >/dev/null 2>&1 || true
fi
log info "cleanup completed"
