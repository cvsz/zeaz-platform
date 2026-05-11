#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

readonly API_BASE="https://api.cloudflare.com/client/v4"
readonly OUTPUT_DIR="./secrets"
readonly ENV_FILE="${OUTPUT_DIR}/cloudflare.env"
readonly REQUEST_TIMEOUT_SECONDS="20"
readonly MAX_RETRIES="3"

require_env() {
  local key="$1"
  if [[ -z "${!key:-}" ]]; then
    printf 'Missing required environment variable: %s\n' "${key}" >&2
    exit 1
  fi
}

log() {
  printf '\n[%s] %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$*"
}

api_call() {
  local method="$1"
  local endpoint="$2"
  local payload="${3:-}"

  local attempt
  for attempt in $(seq 1 "${MAX_RETRIES}"); do
    if [[ -n "${payload}" ]]; then
      if curl -fsS --max-time "${REQUEST_TIMEOUT_SECONDS}" \
        -X "${method}" \
        "${API_BASE}${endpoint}" \
        -H "Authorization: Bearer ${CF_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data "${payload}"; then
        return 0
      fi
    else
      if curl -fsS --max-time "${REQUEST_TIMEOUT_SECONDS}" \
        -X "${method}" \
        "${API_BASE}${endpoint}" \
        -H "Authorization: Bearer ${CF_API_TOKEN}" \
        -H "Content-Type: application/json"; then
        return 0
      fi
    fi

    if [[ "${attempt}" -lt "${MAX_RETRIES}" ]]; then
      local sleep_for
      sleep_for="$((attempt * 2))"
      log "Request failed. Retry ${attempt}/${MAX_RETRIES} in ${sleep_for}s"
      sleep "${sleep_for}"
    fi
  done

  printf 'Cloudflare API call failed after %s attempts: %s %s\n' "${MAX_RETRIES}" "${method}" "${endpoint}" >&2
  return 1
}

policy_dns() {
  jq -cn --arg zone "${CF_ZONE_ID}" '[{effect:"allow",resources:{("com.cloudflare.api.account.zone."+$zone):"*"},permission_groups:[{id:"82e64a83756745bbbb1c9c2701bf816b"},{id:"c8fed203ed3043cba015a93ad1616f1f"}]}]'
}

policy_zt() {
  jq -cn --arg account "${CF_ACCOUNT_ID}" '[{effect:"allow",resources:{("com.cloudflare.api.account."+$account):"*"},permission_groups:[{id:"c1fde68c7bcc44588cbb6ddbc16d6480"},{id:"c1250ab6c65d4f1d8cc6f5f0476c9b3c"}]}]'
}

policy_workers() {
  jq -cn --arg account "${CF_ACCOUNT_ID}" '[{effect:"allow",resources:{("com.cloudflare.api.account."+$account):"*"},permission_groups:[{id:"e086da7e2179491d91ee5f35b3ca210a"},{id:"f267e341f3dd4697bec6c725f3e7f2c4"}]}]'
}

policy_waf() {
  jq -cn --arg zone "${CF_ZONE_ID}" '[{effect:"allow",resources:{("com.cloudflare.api.account.zone."+$zone):"*"},permission_groups:[{id:"5a9c0d1a4e0b4c8ba7e5d6d5b6e3b111"}]}]'
}

policy_tunnel() {
  jq -cn --arg account "${CF_ACCOUNT_ID}" '[{effect:"allow",resources:{("com.cloudflare.api.account."+$account):"*"},permission_groups:[{id:"8d5f4f6c2c7f4a1d91aa8c6d2bcff111"}]}]'
}

policy_r2() {
  jq -cn --arg account "${CF_ACCOUNT_ID}" '[{effect:"allow",resources:{("com.cloudflare.api.account."+$account):"*"},permission_groups:[{id:"0d8c9f5a6b2f4a5f8e7c3a2b1d4f1111"}]}]'
}

create_token() {
  local token_name="$1"
  local policies="$2"

  local payload
  payload="$(jq -cn --arg name "${token_name}" --argjson policies "${policies}" '{name:$name,policies:$policies}')"

  local response
  response="$(api_call POST "/user/tokens" "${payload}")"

  local success
  success="$(jq -r '.success' <<<"${response}")"
  if [[ "${success}" != "true" ]]; then
    jq -c '.' <<<"${response}" >&2
    return 1
  fi

  jq -r '.result.value' <<<"${response}"
}

main() {
  require_env CF_API_TOKEN
  require_env CF_ACCOUNT_ID
  require_env CF_ZONE_ID
  command -v jq >/dev/null
  command -v curl >/dev/null

  mkdir -p "${OUTPUT_DIR}"

  log "Generating Cloudflare API tokens"
  local cf_api_token cf_dns_token cf_zt_token cf_workers_token cf_waf_token cf_tunnel_token cf_r2_token

  cf_api_token="${CF_API_TOKEN}"
  cf_dns_token="$(create_token "zeaz-dns-token" "$(policy_dns)")"
  cf_zt_token="$(create_token "zeaz-zt-token" "$(policy_zt)")"
  cf_workers_token="$(create_token "zeaz-workers-token" "$(policy_workers)")"
  cf_waf_token="$(create_token "zeaz-waf-token" "$(policy_waf)")"
  cf_tunnel_token="$(create_token "zeaz-tunnel-token" "$(policy_tunnel)")"
  cf_r2_token="$(create_token "zeaz-r2-token" "$(policy_r2)")"

  umask 077
  cat >"${ENV_FILE}" <<EOV
CF_API_TOKEN=${cf_api_token}
CF_DNS_TOKEN=${cf_dns_token}
CF_ZT_TOKEN=${cf_zt_token}
CF_WORKERS_TOKEN=${cf_workers_token}
CF_WAF_TOKEN=${cf_waf_token}
CF_TUNNEL_TOKEN=${cf_tunnel_token}
CF_R2_TOKEN=${cf_r2_token}
EOV

  chmod 600 "${ENV_FILE}"
  log "Cloudflare token generation complete: ${ENV_FILE}"
}

main "$@"
