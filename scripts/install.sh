#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

log(){ printf '{"level":"info","msg":"%s"}\n' "$1"; }
trap 'printf "{\"level\":\"error\",\"msg\":\"install failed\"}\n" >&2' ERR

log "validating environment"
./scripts/validate.sh
log "running bootstrap"
./scripts/bootstrap-system.sh
log "installation complete"
