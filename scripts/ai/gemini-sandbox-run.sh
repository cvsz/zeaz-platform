#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
# shellcheck source=../lib/gemini-sandbox.sh
# shellcheck disable=SC1091
source "${PROJECT_ROOT}/scripts/lib/gemini-sandbox.sh"

usage() {
  cat <<'USAGE'
Usage:
  scripts/ai/gemini-sandbox-run.sh [--help]
  scripts/ai/gemini-sandbox-run.sh --print-env
  scripts/ai/gemini-sandbox-run.sh -- COMMAND [ARGS...]

Run a command with Gemini-safe writable cache/log paths. When the repository is
read-only, cache/log output falls back to /tmp/gemini-pack instead of failing.

Environment:
  GEMINI_PACK_ROOT   Fallback root. Default: /tmp/gemini-pack
  GEMINI_CACHE_DIR   Preferred cache directory. Default: <repo>/.cache/ecc
  GEMINI_LOG_DIR     Preferred log directory. Default: <repo>/.logs
  GEMINI_LOG_FILE    Log file. Default: <log-dir>/script.log

Examples:
  scripts/ai/gemini-sandbox-run.sh --print-env
  scripts/ai/gemini-sandbox-run.sh -- bash scripts/ai/install-ecc.sh --dry-run
  scripts/ai/gemini-sandbox-run.sh -- bash scripts/ai/render-mcp-config.sh
USAGE
}

cleanup() {
  local exit_code=$?
  gemini_log INFO "cleanup complete; exit_code=${exit_code}"
}
trap cleanup EXIT

main() {
  case "${1:-}" in
    -h|--help)
      usage
      return 0
      ;;
    --print-env)
      gemini_init_sandbox_paths "${PROJECT_ROOT}"
      printf 'PROJECT_ROOT=%s\n' "${PROJECT_ROOT}"
      printf 'GEMINI_PACK_ROOT=%s\n' "${GEMINI_PACK_ROOT}"
      printf 'GEMINI_CACHE_DIR=%s\n' "${GEMINI_CACHE_DIR}"
      printf 'GEMINI_LOG_DIR=%s\n' "${GEMINI_LOG_DIR}"
      return 0
      ;;
    --)
      shift
      ;;
    "")
      usage >&2
      return 2
      ;;
    *)
      echo "ERROR: expected -- before command: $*" >&2
      usage >&2
      return 2
      ;;
  esac

  if [[ $# -eq 0 ]]; then
    echo "ERROR: missing command after --" >&2
    return 2
  fi

  gemini_init_sandbox_paths "${PROJECT_ROOT}"
  GEMINI_LOG_FILE="${GEMINI_LOG_FILE:-${GEMINI_LOG_DIR}/script.log}"
  gemini_start_file_log "${GEMINI_LOG_FILE}"

  gemini_log INFO "running command: $*"
  "$@"
}

main "$@"
