#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SERVER="${ROOT}/tools/codex-scheduler-mcp/dist/src/index.js"

log() {
  printf '[codex-scheduler] %s\n' "$*" >&2
}

on_error() {
  local exit_code=$?
  log "failed with exit code ${exit_code}"
  exit "${exit_code}"
}

trap on_error ERR

if [[ "${1:-}" == "--help" ]]; then
  printf 'Usage: %s\n' "${0##*/}"
  printf 'Start the project-local Codex Scheduler MCP stdio server.\n'
  exit 0
fi

if [[ $# -ne 0 ]]; then
  log "unexpected arguments; use --help"
  exit 2
fi

if [[ ! -f "${SERVER}" ]]; then
  log "missing ${SERVER}; run pnpm --dir tools/codex-scheduler-mcp --ignore-workspace build"
  exit 3
fi

exec node "${SERVER}"
