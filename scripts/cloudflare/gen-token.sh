#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

: "${CF_EMAIL:?Missing CF_EMAIL}"
: "${CF_GLOBAL_API_KEY:?Missing CF_GLOBAL_API_KEY}"

API_BASE="https://api.cloudflare.com/client/v4"
WRITE_FILE="${1:-}"   # optional: path to .env file to write token into
TYPE="${2:-}"         # token type: dns|zt|workers|waf|tunnel|r2

if [[ -z "$TYPE" ]]; then
  echo "Usage: $0 [--write-file path] <type>"
  exit 1
fi

log(){ printf '[%s] %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$*"; }

cf_api() {
  local method="$1"; local endpoint="$2"; local data="${3:-}"
  if [[ -n "$data" ]]; then
    curl -sS -X "$method" "${API_BASE}${endpoint}" \
      -H "X-Auth-Email: ${CF_EMAIL}" \
      -H "X-Auth-Key: ${CF_GLOBAL_API_KEY}" \
      -H "Content-Type: application/json" \
      --data "$data"
  else
    curl -sS -X "$method" "${API_BASE}${endpoint}" \
      -H "X-Auth-Email: ${CF_EMAIL}" \
      -H "X-Auth-Key: ${CF_GLOBAL_API_KEY}" \
      -H "Content-Type: application/json"
  fi
}

verify_auth() {
  log "Verifying Cloudflare auth"
  local resp success
  resp="$(cf_api GET "/user")"
  success="$(echo "$resp" | jq -r '.success')"
  if [[ "$success" != "true" ]]; then
    echo "$resp" | jq
    log "Auth failed"
    exit 1
  fi
  log "Auth OK"
}

get_permission_id() {
  local name="$1"
  local resp
  resp="$(cf_api GET "/user/tokens/permission_groups")"
  echo "$resp" | jq -r --arg NAME "$name" '.result[] | select(.name == $NAME) | .id' | head -n1
}

# map type -> values
case "$TYPE" in
  dns) TOKEN_NAME="zeaz-dns-token"; PERM="Zone DNS Edit"; RESOURCE="com.cloudflare.api.account.zone.*" ;;
  zt) TOKEN_NAME="zeaz-zt-token"; PERM="Access: Apps and Policies Write"; RESOURCE="com.cloudflare.api.account.*" ;;
  workers) TOKEN_NAME="zeaz-workers-token"; PERM="Workers Scripts Write"; RESOURCE="com.cloudflare.api.account.*" ;;
  waf) TOKEN_NAME="zeaz-waf-token"; PERM="Zone WAF Write"; RESOURCE="com.cloudflare.api.account.*" ;;
  tunnel) TOKEN_NAME="zeaz-tunnel-token"; PERM="Cloudflare Tunnel Write"; RESOURCE="com.cloudflare.api.account.*" ;;
  r2) TOKEN_NAME="zeaz-r2-token"; PERM="Workers R2 Storage Write"; RESOURCE="com.cloudflare.api.account.*" ;;
  *) echo "Unsupported type: $TYPE"; exit 1 ;;
esac

verify_auth
log "Resolving permission group: $PERM"
PERM_ID="$(get_permission_id "$PERM")"
if [[ -z "$PERM_ID" ]]; then
  log "Permission group not found: $PERM"
  exit 1
fi
log "Permission ID: $PERM_ID"

# Build payload using jq to avoid quoting issues
PAYLOAD="$(jq -n \
  --arg name "$TOKEN_NAME" \
  --arg resource "$RESOURCE" \
  --arg perm "$PERM_ID" \
  '{
    name: $name,
    policies: [
      {
        effect: "allow",
        resources: ( { ($resource): "*" } ),
        permission_groups: [ { id: $perm } ]
      }
    ]
  }')"

log "Creating token"
RESPONSE="$(cf_api POST "/user/tokens" "$PAYLOAD")"
echo "$RESPONSE" | jq

SUCCESS="$(echo "$RESPONSE" | jq -r '.success')"
if [[ "$SUCCESS" != "true" ]]; then
  log "API rejected request"
  exit 1
fi

TOKEN_VALUE="$(echo "$RESPONSE" | jq -r '.result.value')"
printf '%s\n' "$TOKEN_VALUE"

# Optionally write to env file
if [[ -n "$WRITE_FILE" ]]; then
  # map type -> env key
  case "$TYPE" in
    dns) KEY="CF_DNS_TOKEN" ;;
    zt) KEY="CF_ZT_TOKEN" ;;
    workers) KEY="CF_WORKERS_TOKEN" ;;
    waf) KEY="CF_WAF_TOKEN" ;;
    tunnel) KEY="CF_TUNNEL_TOKEN" ;;
    r2) KEY="CF_R2_TOKEN" ;;
  esac

  touch "$WRITE_FILE"
  chmod 600 "$WRITE_FILE"
  # remove existing line and append
  grep -v -E "^${KEY}=" "$WRITE_FILE" > "${WRITE_FILE}.tmp" || true
  printf '%s="%s"\n' "$KEY" "$TOKEN_VALUE" >> "${WRITE_FILE}.tmp"
  mv "${WRITE_FILE}.tmp" "$WRITE_FILE"
  chmod 600 "$WRITE_FILE"
  log "Wrote ${KEY} to ${WRITE_FILE}"
fi

log "Done"
