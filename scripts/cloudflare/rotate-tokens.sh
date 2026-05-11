#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

readonly TOKENS_FILE="./secrets/cloudflare.env"
readonly BACKUP_DIR="./backups/tokens"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() {
  printf '\n[%s] %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$*"
}

rollback() {
  local backup_file="$1"
  if [[ -f "${backup_file}" ]]; then
    cp "${backup_file}" "${TOKENS_FILE}"
    log "Rollback completed from ${backup_file}"
  fi
}

main() {
  mkdir -p "${BACKUP_DIR}"
  local timestamp backup_file
  timestamp="$(date -u +"%Y%m%dT%H%M%SZ")"
  backup_file="${BACKUP_DIR}/cloudflare.env.${timestamp}"

  if [[ -f "${TOKENS_FILE}" ]]; then
    cp "${TOKENS_FILE}" "${backup_file}"
    log "Backup created: ${backup_file}"
  fi

  if ! "${SCRIPT_DIR}/generate-tokens.sh"; then
    log "Token generation failed; starting rollback"
    rollback "${backup_file}"
    exit 1
  fi

  # shellcheck disable=SC1090
  source "${TOKENS_FILE}"

  local required=(CF_API_TOKEN CF_DNS_TOKEN CF_ZT_TOKEN CF_WORKERS_TOKEN CF_WAF_TOKEN CF_TUNNEL_TOKEN CF_R2_TOKEN)
  local key
  for key in "${required[@]}"; do
    if [[ -z "${!key:-}" ]]; then
      log "Missing token after rotation: ${key}; rolling back"
      rollback "${backup_file}"
      exit 1
    fi
  done

  log "Token rotation complete"
}

main "$@"
