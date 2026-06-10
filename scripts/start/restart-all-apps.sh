#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage() { echo 'Usage: scripts/start/restart-all-apps.sh [--dry-run]'; }
[[ "${1:-}" =~ ^(--help|-h)$ ]] && { usage; exit 0; }
scripts/start/stop-all-apps.sh
scripts/start/start-all-apps.sh "$@"
