#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUTPUT_FILE="${ROOT_DIR}/../.mcp.json"

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
    CF_ACCOUNT_ID
    CF_API_TOKEN
    CF_WORKERS_TOKEN
    CF_AUDIT_TOKEN
    CF_AI_GATEWAY_SLUG
  )

  for v in "${vars[@]}"; do
    require_var "$v"
  done

  [[ "${CF_ACCOUNT_ID}" =~ ^[a-f0-9]{32}$ ]] || { log "CF_ACCOUNT_ID must be 32 lowercase hex chars"; return 1; }
  [[ "${#CF_API_TOKEN}" -ge 32 ]] || { log "CF_API_TOKEN must be at least 32 chars"; return 1; }
  [[ "${#CF_WORKERS_TOKEN}" -ge 32 ]] || { log "CF_WORKERS_TOKEN must be at least 32 chars"; return 1; }
  [[ "${#CF_AUDIT_TOKEN}" -ge 32 ]] || { log "CF_AUDIT_TOKEN must be at least 32 chars"; return 1; }
  [[ "${CF_AI_GATEWAY_SLUG}" =~ ^[a-z0-9-]{3,64}$ ]] || { log "CF_AI_GATEWAY_SLUG must match ^[a-z0-9-]{3,64}$"; return 1; }
}

main() {
  validate_environment

  cat > "${OUTPUT_FILE}" <<JSON
{
  "servers": {
    "cloudflare-rest": {
      "type": "http",
      "url": "https://api.cloudflare.com/client/v4",
      "headers": {
        "Authorization": "Bearer ${CF_API_TOKEN}",
        "Content-Type": "application/json"
      }
    },
    "cloudflare-ai-gateway": {
      "type": "http",
      "url": "https://gateway.ai.cloudflare.com/v1/${CF_ACCOUNT_ID}/${CF_AI_GATEWAY_SLUG}",
      "headers": {
        "Authorization": "Bearer ${CF_WORKERS_TOKEN}",
        "Content-Type": "application/json"
      }
    },
    "cloudflare-logs": {
      "type": "http",
      "url": "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/logs/retrieve",
      "headers": {
        "Authorization": "Bearer ${CF_AUDIT_TOKEN}",
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
