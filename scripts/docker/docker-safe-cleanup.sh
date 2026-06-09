#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage(){ cat <<'USAGE'
Usage: docker-safe-cleanup.sh [--dry-run] [--include-volumes]

Safe Docker cleanup. Volumes are never pruned unless --include-volumes and
CONFIRM_DOCKER_VOLUME_PRUNE=yes are both supplied.
USAGE
}
log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
trap 'log "ERROR: docker cleanup failed at line $LINENO"' ERR
dry=0; volumes=0
while [ "$#" -gt 0 ]; do case "$1" in --dry-run) dry=1; shift;; --include-volumes) volumes=1; shift;; --help|-h) usage; exit 0;; *) echo "ERROR: unknown argument $1" >&2; exit 2;; esac; done
command -v docker >/dev/null 2>&1 || { echo "ERROR: docker not found" >&2; exit 127; }
log "docker system df before"; docker system df || true
run(){ if [ "$dry" -eq 1 ]; then printf 'DRY-RUN: %q ' "$@"; printf '\n'; else "$@"; fi; }
run docker container prune -f
run docker image prune -f
run docker builder prune -f
run docker network prune -f
if [ "$volumes" -eq 1 ]; then
  [ "${CONFIRM_DOCKER_VOLUME_PRUNE:-no}" = yes ] || { echo "ERROR: CONFIRM_DOCKER_VOLUME_PRUNE=yes required for volume prune" >&2; exit 1; }
  run docker volume prune -f
fi
log "docker system df after"; docker system df || true
