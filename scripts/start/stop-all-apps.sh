#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
trap 'echo "ERROR: ${0##*/} failed at line $LINENO" >&2' ERR
usage(){ echo 'Usage: stop-all-apps.sh [--app NAME]'; }
log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
only=""
while [ "$#" -gt 0 ]; do case "$1" in --app) only="${2:?missing app}"; shift 2;; --help|-h) usage; exit 0;; *) echo "ERROR: unknown argument $1" >&2; exit 2;; esac; done
shopt -s nullglob
for pidfile in .runtime/apps/*.pid; do
  app="$(basename "$pidfile" .pid)"; [ -z "$only" ] || [ "$only" = "$app" ] || continue
  pid="$(cat "$pidfile")"
  if kill -0 "$pid" 2>/dev/null; then kill "$pid"; log "stopped $app pid=$pid"; fi
  rm -f "$pidfile"
done
