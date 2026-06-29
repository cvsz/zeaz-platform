#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck source=../lib/gemini-sandbox.sh
# shellcheck disable=SC1091
source "${ROOT_DIR}/scripts/lib/gemini-sandbox.sh"
gemini_init_sandbox_paths "${ROOT_DIR}"

OUTPUT_FILE="${OUTPUT_FILE:-${ROOT_DIR}/../.mcp.json}"
OUTPUT_FILE="$(gemini_resolve_output_file "${OUTPUT_FILE}" ".mcp.json")"

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
  local vars=(
    CLOUDFLARE_ACCOUNT_ID
    CLOUDFLARE_API_TOKEN
    CLOUDFLARE_WORKERS_TOKEN
    CLOUDFLARE_AUDIT_TOKEN
    CLOUDFLARE_AI_GATEWAY_SLUG
  )

  for v in "${vars[@]}"; do
    require_var "$v"
  done

  [[ "${CLOUDFLARE_ACCOUNT_ID}" =~ ^[a-f0-9]{32}$ ]] || { log "CLOUDFLARE_ACCOUNT_ID must be 32 lowercase hex chars"; return 1; }
  [[ "${#CLOUDFLARE_API_TOKEN}" -ge 32 ]] || { log "CLOUDFLARE_API_TOKEN must be at least 32 chars"; return 1; }
  [[ "${#CLOUDFLARE_WORKERS_TOKEN}" -ge 32 ]] || { log "CLOUDFLARE_WORKERS_TOKEN must be at least 32 chars"; return 1; }
  [[ "${#CLOUDFLARE_AUDIT_TOKEN}" -ge 32 ]] || { log "CLOUDFLARE_AUDIT_TOKEN must be at least 32 chars"; return 1; }
  [[ "${CLOUDFLARE_AI_GATEWAY_SLUG}" =~ ^[a-z0-9-]{3,64}$ ]] || { log "CLOUDFLARE_AI_GATEWAY_SLUG must match ^[a-z0-9-]{3,64}$"; return 1; }
}

main() {
  validate_environment

  mkdir -p "$(dirname "${OUTPUT_FILE}")"
  cat > "${OUTPUT_FILE}" <<JSON
{
  "servers": {
    "cloudflare-rest": {
      "type": "http",
      "url": "https://api.cloudflare.com/client/v4",
      "headers": {
        "Authorization": "Bearer ${CLOUDFLARE_API_TOKEN}",
        "Content-Type": "application/json"
      }
    },
    "cloudflare-ai-gateway": {
      "type": "http",
      "url": "https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${CLOUDFLARE_AI_GATEWAY_SLUG}",
      "headers": {
        "Authorization": "Bearer ${CLOUDFLARE_WORKERS_TOKEN}",
        "Content-Type": "application/json"
      }
    },
    "cloudflare-logs": {
      "type": "http",
      "url": "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/logs/retrieve",
      "headers": {
        "Authorization": "Bearer ${CLOUDFLARE_AUDIT_TOKEN}",
        "Content-Type": "application/json"
      }
    }
  }
}
JSON

  chmod 0600 "${OUTPUT_FILE}"
  log "rendered ${OUTPUT_FILE} with strict permissions"
}

main "$@"
