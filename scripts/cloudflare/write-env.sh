#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# Safe writer for Cloudflare env file
# Usage:
#   CF_ACCOUNT_ID=... CF_ZONE_ID=... ./write-env.sh [output-file]
# If no output-file provided, defaults to .env.cloudflare

OUTPUT_FILE="${1:-.env.cloudflare}"
LOG_FILE="/tmp/zveo-cf-env.log"

exec > >(tee -a "$LOG_FILE") 2>&1

: "${CF_ACCOUNT_ID:?Missing CF_ACCOUNT_ID}"
: "${CF_ZONE_ID:?Missing CF_ZONE_ID}"

# Optional tokens may be empty
CF_API_TOKEN="${CF_API_TOKEN:-}"
CF_DNS_TOKEN="${CF_DNS_TOKEN:-}"
CF_ZT_TOKEN="${CF_ZT_TOKEN:-}"
CF_WORKERS_TOKEN="${CF_WORKERS_TOKEN:-}"
CF_WAF_TOKEN="${CF_WAF_TOKEN:-}"
CF_TUNNEL_TOKEN="${CF_TUNNEL_TOKEN:-}"
CF_R2_TOKEN="${CF_R2_TOKEN:-}"

log() {
  printf '[%s] %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$*"
}

log "Writing Cloudflare secrets to ${OUTPUT_FILE}"
touch "${OUTPUT_FILE}"
chmod 600 "${OUTPUT_FILE}"

# Write to a temp file then atomically move
TMP="$(mktemp "${OUTPUT_FILE}.XXXXXX")"
chmod 600 "${TMP}"

cat > "${TMP}" <<EOF
CF_ACCOUNT_ID="${CF_ACCOUNT_ID}"
CF_ZONE_ID="${CF_ZONE_ID}"
CF_API_TOKEN="${CF_API_TOKEN}"
CF_DNS_TOKEN="${CF_DNS_TOKEN}"
CF_ZT_TOKEN="${CF_ZT_TOKEN}"
CF_WORKERS_TOKEN="${CF_WORKERS_TOKEN}"
CF_WAF_TOKEN="${CF_WAF_TOKEN}"
CF_TUNNEL_TOKEN="${CF_TUNNEL_TOKEN}"
CF_R2_TOKEN="${CF_R2_TOKEN}"
EOF

mv "${TMP}" "${OUTPUT_FILE}"
chmod 600 "${OUTPUT_FILE}"

log "Secrets written to ${OUTPUT_FILE} with permissions 600"
exit 0
