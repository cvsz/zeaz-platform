#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE="${1:-cloudflare-api}"

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    log "missing required environment variable: ${name}"
    return 1
  fi
}

validate_environment() {
  require_var CF_ACCOUNT_ID
  require_var CF_API_TOKEN
  require_var CF_ZONE_ID
  require_var PRIMARY_DOMAIN

  [[ "${CF_ACCOUNT_ID}" =~ ^[a-f0-9]{32}$ ]] || { log "CF_ACCOUNT_ID must be 32 lowercase hex chars"; return 1; }
  [[ "${CF_ZONE_ID}" =~ ^[a-f0-9]{32}$ ]] || { log "CF_ZONE_ID must be 32 lowercase hex chars"; return 1; }
  [[ "${#CF_API_TOKEN}" -ge 32 ]] || { log "CF_API_TOKEN must be at least 32 chars"; return 1; }
}

render_runtime_banner() {
  cat <<BANNER
cloudflare-agent-bootstrap
mode=${MODE}
account=${CF_ACCOUNT_ID}
zone=${CF_ZONE_ID}
domain=${PRIMARY_DOMAIN}
repo=${ROOT_DIR}
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
