#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage() { cat <<'USAGE'
Usage: scripts/docker/docker-safe-cleanup.sh [--include-volumes]

Prunes stopped containers, dangling images, build cache, and unused networks.
Volumes are never pruned unless --include-volumes and CONFIRM_CLEANUP_VOLUMES=yes are both set.
USAGE
}
log() { printf '[zeaz-docker-cleanup] %s\n' "$*"; }
include_volumes=false
while (($#)); do case "$1" in --include-volumes) include_volumes=true; shift;; --help|-h) usage; exit 0;; *) usage; exit 2;; esac; done
command -v docker >/dev/null 2>&1 || { log 'docker not found'; exit 3; }
log 'docker system df before cleanup'; docker system df || true
docker container prune -f
docker image prune -f
docker builder prune -f
docker network prune -f
if $include_volumes; then
  [[ "${CONFIRM_CLEANUP_VOLUMES:-}" == yes ]] || { log 'volume cleanup requested but CONFIRM_CLEANUP_VOLUMES=yes not set; skipping volumes'; }
  [[ "${CONFIRM_CLEANUP_VOLUMES:-}" == yes ]] && docker volume prune -f
fi
log 'docker system df after cleanup'; docker system df || true
