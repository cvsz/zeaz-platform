#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
trap 'echo "ERROR: restart-all-apps.sh failed at line $LINENO" >&2' ERR
usage(){ echo 'Usage: restart-all-apps.sh [--app NAME]'; }
for arg in "$@"; do case "$arg" in --help|-h) usage; exit 0;; esac; done
scripts/start/stop-all-apps.sh "$@"
scripts/start/start-all-apps.sh "$@"
