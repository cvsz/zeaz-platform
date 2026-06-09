#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage() { echo 'Usage: scripts/start/start-all-apps.sh [--dry-run]'; }
log() { printf '[zeaz-start] %s\n' "$*"; }
dry=false
while (($#)); do case "$1" in --dry-run) dry=true; shift;; --help|-h) usage; exit 0;; *) usage; exit 2;; esac; done
mkdir -p .runtime/pids .runtime/logs
start_cmd() { local app="$1" path="$2" port="$3" cmd="$4"; log "$app => PORT=$port $cmd"; $dry && return 0; if [[ ! -d "$path" ]]; then log "missing $path; skipping"; return 0; fi; (cd "$path" && PORT="$port" APP_NAME="$app" nohup bash -lc "$cmd" >"../../.runtime/logs/$app.log" 2>&1 & echo $! >"../../.runtime/pids/$app.pid"); }
start_cmd zLinebot apps/zLinebot 4113 'npm start'
log 'Generic app startup is conservative. Use app-specific package installation/build commands before enabling additional starts.'
