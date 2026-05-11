# scripts/cloudflare/gen-token.sh

#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

########################################
# ZeazDev Cloudflare Token Generator
#
# Enterprise-grade
# Deterministic
# Exact permission matching
# Runtime validation
# Production-safe
#
# Supported:
# - dns
# - zt
# - workers
# - waf
# - tunnel
# - r2
#
# Usage:
# bash gen-token.sh dns
########################################

########################################
# REQUIRED ENV
########################################

: "${CF_EMAIL:?Missing CF_EMAIL}"
: "${CF_GLOBAL_API_KEY:?Missing CF_GLOBAL_API_KEY}"

########################################
# CONFIG
########################################

readonly API_BASE="https://api.cloudflare.com/client/v4"

########################################
# ARGUMENTS
########################################

if [[ $# -ne 1 ]]; then
  printf '\nUsage:\n'
  printf '  bash gen-token.sh <type>\n'

  printf '\nSupported Types:\n'
  printf '  dns\n'
  printf '  zt\n'
  printf '  workers\n'
  printf '  waf\n'
  printf '  tunnel\n'
  printf '  r2\n'

  exit 1
fi

readonly TOKEN_TYPE="$1"

########################################
# LOGGING
########################################

log() {
  printf '\n[%s] %s\n' \
    "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
    "$*"
}

########################################
# API
########################################

cf_api() {
  local method="$1"
  local endpoint="$2"
  local payload="${3:-}"

  if [[ -n "${payload}" ]]; then
    curl -sS \
      -X "${method}" \
      "${API_BASE}${endpoint}" \
      -H "X-Auth-Email: ${CF_EMAIL}" \
      -H "X-Auth-Key: ${CF_GLOBAL_API_KEY}" \
      -H "Content-Type: application/json" \
      --data "${payload}"
  else
    curl -sS \
      -X "${method}" \
      "${API_BASE}${endpoint}" \
      -H "X-Auth-Email: ${CF_EMAIL}" \
      -H "X-Auth-Key: ${CF_GLOBAL_API_KEY}" \
      -H "Content-Type: application/json"
  fi
}

########################################
# VERIFY AUTH
########################################

verify_auth() {
  log "Verifying Cloudflare authentication"

  local response

  response="$(
    cf_api \
      GET \
      "/user"
  )"

  local success

  success="$(echo "${response}" | jq -r '.success')"

  if [[ "${success}" != "true" ]]; then
    log "Authentication failed"

    echo "${response}" | jq

    exit 1
  fi

  log "Authentication successful"
}

########################################
# GET PERMISSION ID
########################################

get_permission_id() {
  local exact_name="$1"

  local response

  response="$(
    cf_api \
      GET \
      "/user/tokens/permission_groups"
  )"

  local success

  success="$(echo "${response}" | jq -r '.success')"

  if [[ "${success}" != "true" ]]; then
    log "Failed to fetch permission groups"

    echo "${response}" | jq

    exit 1
  fi

  local permission_id

  permission_id="$(
    echo "${response}" \
      | jq -r \
        --arg NAME "${exact_name}" '
          .result[]
          | select(.name == $NAME)
          | .id
        ' \
      | head -n1
  )"

  if [[ -z "${permission_id}" || "${permission_id}" == "null" ]]; then
    log "Permission not found: ${exact_name}"

    exit 1
  fi

  printf '%s' "${permission_id}"
}

########################################
# TOKEN CONFIG
########################################

TOKEN_NAME=""
PERMISSION_NAME=""
RESOURCE=""

case "${TOKEN_TYPE}" in

  dns)
    TOKEN_NAME="zeaz-dns-token"
    PERMISSION_NAME="Zone DNS Edit"
    RESOURCE="com.cloudflare.api.account.zone.*"
    ;;

  zt)
    TOKEN_NAME="zeaz-zt-token"
    PERMISSION_NAME="Access: Apps and Policies Write"
    RESOURCE="com.cloudflare.api.account.*"
    ;;

  workers)
    TOKEN_NAME="zeaz-workers-token"
    PERMISSION_NAME="Workers Scripts Write"
    RESOURCE="com.cloudflare.api.account.*"
    ;;

  waf)
    TOKEN_NAME="zeaz-waf-token"
    PERMISSION_NAME="Zone WAF Write"
    RESOURCE="com.cloudflare.api.account.*"
    ;;

  tunnel)
    TOKEN_NAME="zeaz-tunnel-token"
    PERMISSION_NAME="Cloudflare Tunnel Write"
    RESOURCE="com.cloudflare.api.account.*"
    ;;

  r2)
    TOKEN_NAME="zeaz-r2-token"
    PERMISSION_NAME="Workers R2 Storage Write"
    RESOURCE="com.cloudflare.api.account.*"
    ;;

  *)
    log "Unsupported token type: ${TOKEN_TYPE}"
    exit 1
    ;;
esac

########################################
# MAIN
########################################

verify_auth

########################################
# RESOLVE PERMISSION
########################################

log "Resolving permission group"

PERMISSION_ID="$(
  get_permission_id "${PERMISSION_NAME}"
)"

log "Permission ID: ${PERMISSION_ID}"

########################################
# PAYLOAD
########################################

PAYLOAD="$(jq -n \
  --arg TOKEN_NAME "${TOKEN_NAME}" \
  --arg RESOURCE "${RESOURCE}" \
  --arg PERMISSION_ID "${PERMISSION_ID}" \
  '{
    name: $TOKEN_NAME,
    policies: [
      {
        effect: "allow",
        resources: {
          ($RESOURCE): "*"
        },
        permission_groups: [
          {
            id: $PERMISSION_ID
          }
        ]
      }
    ]
  }'
)"

########################################
# DEBUG PAYLOAD
########################################

log "Payload"

echo "${PAYLOAD}" | jq

########################################
# CREATE TOKEN
########################################

log "Creating token"

RESPONSE="$(
  cf_api \
    POST \
    "/user/tokens" \
    "${PAYLOAD}"
)"

########################################
# DEBUG RESPONSE
########################################

echo "${RESPONSE}" | jq

SUCCESS="$(
  echo "${RESPONSE}" \
    | jq -r '.success'
)"

if [[ "${SUCCESS}" != "true" ]]; then
  log "Cloudflare API rejected request"

  exit 1
fi

########################################
# OUTPUT
########################################

TOKEN_VALUE="$(
  echo "${RESPONSE}" \
    | jq -r '.result.value'
)"

printf '\n'
printf '=========================================\n'
printf 'TOKEN TYPE\n'
printf '=========================================\n'
printf '%s\n' "${TOKEN_TYPE}"

printf '\n'
printf '=========================================\n'
printf 'TOKEN\n'
printf '=========================================\n'
printf '%s\n' "${TOKEN_VALUE}"

printf '\n'
printf '=========================================\n'
printf 'EXPORT\n'
printf '=========================================\n'

case "${TOKEN_TYPE}" in
  dns)
    printf 'export CF_DNS_TOKEN="%s"\n' "${TOKEN_VALUE}"
    ;;
  zt)
    printf 'export CF_ZT_TOKEN="%s"\n' "${TOKEN_VALUE}"
    ;;
  workers)
    printf 'export CF_WORKERS_TOKEN="%s"\n' "${TOKEN_VALUE}"
    ;;
  waf)
    printf 'export CF_WAF_TOKEN="%s"\n' "${TOKEN_VALUE}"
    ;;
  tunnel)
    printf 'export CF_TUNNEL_TOKEN="%s"\n' "${TOKEN_VALUE}"
    ;;
  r2)
    printf 'export CF_R2_TOKEN="%s"\n' "${TOKEN_VALUE}"
    ;;
esac

printf '\n'
printf '=========================================\n'
printf 'STATUS\n'
printf '=========================================\n'
printf 'Token generated successfully\n'
printf 'CF_ACCOUNT_ID="%s"\n'"{CF_ACCOUNT_ID}\n'
printf 'CF_ZONE_ID="%s"\n'"{CF_ZONE_ID}\n'
printf 'CF_API_TOKEN${CF_API_TOKEN}\n'
printf 'CF_DNS_TOKEN="%s"\n'"{CF_DNS_TOKEN}\n'
printf 'CF_ZT_TOKEN="%s"\n'"{CF_ZT_TOKEN}\n'
printf 'CF_WORKERS_TOKEN="%s"\n'"{CF_WORKERS_TOKEN}\n'
printf 'CF_WAF_TOKEN="%s"\n'"{CF_WAF_TOKEN}\n'
printf 'CF_TUNNEL_TOKEN="%s"\n'"{CF_TUNNEL_TOKEN}\n'
printf 'CF_R2_TOKEN="%s"\n'"{CF_R2_TOKEN}\n'

printf '\n'


#!/usr/bin/env bash
set -euo pipefail

OUTPUT_FILE=".env.cloudflare"
LOG_FILE="/tmp/zveo-cf-env.log"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "============================================================"
echo "Writing Cloudflare secrets to $OUTPUT_FILE"
echo "Started: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "============================================================"

cat > "$OUTPUT_FILE" <<EOF
CF_ACCOUNT_ID="%s"\n'"${CF_ACCOUNT_ID}"
CF_ZONE_ID="%s"\n'${CF_ZONE_ID}"
CF_API_TOKEN="%s"\n'"${CF_API_TOKEN}"
CF_DNS_TOKEN="%s"\n'"${CF_DNS_TOKEN}"
CF_ZT_TOKEN="%s"\n'"${CF_ZT_TOKEN}"
CF_WORKERS_TOKEN="%s"\n'"${CF_WORKERS_TOKEN}"
CF_WAF_TOKEN="%s"\n'"${CF_WAF_TOKEN}"
CF_TUNNEL_TOKEN"%s"\n'"${CF_TUNNEL_TOKEN}"
CF_R2_TOKEN="%s"\n'"${CF_R2_TOKEN}"
EOF

echo "============================================================"
echo "Secrets written to $OUTPUT_FILE"
echo "Finished: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "============================================================"
