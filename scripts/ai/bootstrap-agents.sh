#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck source=../lib/gemini-sandbox.sh
# shellcheck disable=SC1091
source "${ROOT_DIR}/scripts/lib/gemini-sandbox.sh"
gemini_init_sandbox_paths "${ROOT_DIR}"

MODE="${1:-cloudflare-api}"

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

redact_id() {
  local value="${1:-}"
  if [[ ${#value} -le 10 ]]; then
    printf '[redacted]'
  else
    printf '%s...%s' "${value:0:6}" "${value: -4}"
  fi
}

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    log "missing required environment variable: ${name}"
    return 1
  fi
}

validate_environment() {
  require_var CLOUDFLARE_ACCOUNT_ID
  require_var CLOUDFLARE_API_TOKEN
  require_var CLOUDFLARE_ZONE_ID
  require_var PRIMARY_DOMAIN

  [[ "${CLOUDFLARE_ACCOUNT_ID}" =~ ^[a-f0-9]{32}$ ]] || { log "CLOUDFLARE_ACCOUNT_ID must be 32 lowercase hex chars"; return 1; }
  [[ "${CLOUDFLARE_ZONE_ID}" =~ ^[a-f0-9]{32}$ ]] || { log "CLOUDFLARE_ZONE_ID must be 32 lowercase hex chars"; return 1; }
  [[ "${#CLOUDFLARE_API_TOKEN}" -ge 32 ]] || { log "CLOUDFLARE_API_TOKEN must be at least 32 chars"; return 1; }
}

render_runtime_banner() {
  cat <<BANNER
cloudflare-agent-bootstrap
mode=${MODE}
account=$(redact_id "${CLOUDFLARE_ACCOUNT_ID}")
zone=$(redact_id "${CLOUDFLARE_ZONE_ID}")
domain=${PRIMARY_DOMAIN}
repo=${ROOT_DIR}
cache=${GEMINI_CACHE_DIR}
logs=${GEMINI_LOG_DIR}
BANNER
}

main() {
  validate_environment
  case "${MODE}" in
    cloudflare-api)
      render_runtime_banner
      log "validated Cloudflare MCP runtime environment"
      ;;
    *)
      log "unsupported mode: ${MODE}"
      return 2
      ;;
  esac
}

main "$@"
