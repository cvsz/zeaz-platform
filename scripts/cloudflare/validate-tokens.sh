#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

source secrets/cloudflare.env

required=(
  CF_DNS_TOKEN
  CF_ZT_TOKEN
  CF_WORKERS_TOKEN
  CF_WAF_TOKEN
  CF_TUNNEL_TOKEN
  CF_R2_TOKEN
)

log() {
  printf '\n[%s] %s\n' \
    "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
    "$*"
}

validate_token() {
  local name="$1"
  local token="$2"

  log "Validating ${name}"

  response="$(
    curl -sS \
      "https://api.cloudflare.com/client/v4/user/tokens/verify" \
      -H "Authorization: Bearer ${token}"
  )"

  success="$(echo "${response}" | jq -r '.success')"

  if [[ "${success}" != "true" ]]; then
    echo "${response}" | jq
    exit 1
  fi

  log "${name} valid"
}

for key in "${required[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    log "Missing variable: ${key}"
    exit 1
  fi
done

validate_token "CF_DNS_TOKEN" "${CF_DNS_TOKEN}"
validate_token "CF_ZT_TOKEN" "${CF_ZT_TOKEN}"
validate_token "CF_WORKERS_TOKEN" "${CF_WORKERS_TOKEN}"
validate_token "CF_WAF_TOKEN" "${CF_WAF_TOKEN}"
validate_token "CF_TUNNEL_TOKEN" "${CF_TUNNEL_TOKEN}"
validate_token "CF_R2_TOKEN" "${CF_R2_TOKEN}"

log "All tokens validated successfully"
