#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

log(){ printf '{"level":"info","msg":"%s"}\n' "$1"; }
trap 'printf "{\"level\":\"error\",\"msg\":\"uninstall failed\"}\n" >&2' ERR

log "destroying terraform resources"
terraform -chdir=terraform destroy -auto-approve || true
log "uninstall complete"
