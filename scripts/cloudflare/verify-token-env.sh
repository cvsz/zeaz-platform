#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="${PROJECT_ROOT:-}"
if [[ -z "$ROOT" ]]; then
  ROOT="$PWD"
  while [[ "$ROOT" != "/" ]]; do
    if [[ -d "$ROOT/.git" || -f "$ROOT/.env.example" || -f "$ROOT/Makefile" ]]; then
      break
    fi
    ROOT="$(dirname "$ROOT")"
  done
fi
[[ "$ROOT" != "/" ]] || ROOT="$PWD"
cd "$ROOT"

API_BASE="${CLOUDFLARE_API_BASE:-https://api.cloudflare.com/client/v4}"

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
warn(){ log "WARN: $*" >&2; }
die(){ log "ERROR: $*" >&2; exit 1; }

mask(){
  local value="${1:-}"
  local len="${#value}"
  if [[ "$len" -le 8 ]]; then
    printf '<missing-or-too-short>'
  else
    printf '%s...%s len=%s' "${value:0:4}" "${value: -4}" "$len"
  fi
}

file_has_key(){
  local file="$1" key="$2"
  [[ -f "$file" ]] || return 1
  grep -qE "^${key}=" "$file"
}

load_env_file(){
  local file="$1"
  [[ -f "$file" ]] || return 0
  set -a
  # shellcheck disable=SC1090
  source "$file"
  set +a
}

request_verify(){
  local label="$1" endpoint="$2" body_file err_file http_code curl_rc body err success
  body_file="$(mktemp)"
  err_file="$(mktemp)"

  set +e
  http_code="$(curl -sS -o "$body_file" -w '%{http_code}' \
    -H "Authorization: Bearer ${CLOUDFLARE_BOOTSTRAP_TOKEN}" \
    "${API_BASE}${endpoint}" 2>"$err_file")"
  curl_rc=$?
  set -e

  body="$(cat "$body_file")"
  err="$(cat "$err_file")"
  rm -f "$body_file" "$err_file"

  if [[ "$curl_rc" -ne 0 ]]; then
    warn "$label verify curl failed: rc=${curl_rc} http=${http_code:-000} stderr=${err:-<empty>}"
    return 20
  fi

  if [[ -z "$body" ]]; then
    warn "$label verify returned an empty body: http=${http_code:-000}; endpoint=${endpoint}"
    return 21
  fi

  if [[ ! "$http_code" =~ ^2[0-9][0-9]$ ]]; then
    if printf '%s' "$body" | jq -e . >/dev/null 2>&1; then
      printf '%s\n' "$body" | jq -c --arg label "$label" --arg http "$http_code" '{label:$label,http:$http,success:(.success // false),errors:(.errors // []),messages:(.messages // [])}' >&2
    else
      warn "$label verify failed with HTTP ${http_code}: ${body}"
    fi
    return 22
  fi

  success="$(printf '%s' "$body" | jq -r '.success // false' 2>/dev/null || printf 'false')"
  if [[ "$success" != "true" ]]; then
    printf '%s\n' "$body" | jq -c --arg label "$label" '{label:$label,success:(.success // false),errors:(.errors // []),messages:(.messages // [])}' >&2
    return 23
  fi

  printf '%s\n' "$body" | jq -c --arg label "$label" '{label:$label,success:(.success // false),result:{id:(.result.id // null),status:(.result.status // null)}}'
  return 0
}

load_env_file .env
load_env_file .env.cloudflare

log "Cloudflare env source check"
for key in CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ZONE_ID CLOUDFLARE_BOOTSTRAP_TOKEN; do
  sources=()
  file_has_key .env "$key" && sources+=(.env)
  file_has_key .env.cloudflare "$key" && sources+=(.env.cloudflare)
  printf '%s sources: %s\n' "$key" "${sources[*]:-<none>}"
done

[[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]] || die "CLOUDFLARE_ACCOUNT_ID is missing"
[[ -n "${CLOUDFLARE_ZONE_ID:-}" ]] || die "CLOUDFLARE_ZONE_ID is missing"
[[ -n "${CLOUDFLARE_BOOTSTRAP_TOKEN:-}" ]] || die "CLOUDFLARE_BOOTSTRAP_TOKEN is missing"

printf 'CLOUDFLARE_ACCOUNT_ID: %s\n' "$(mask "$CLOUDFLARE_ACCOUNT_ID")"
printf 'CLOUDFLARE_ZONE_ID: %s\n' "$(mask "$CLOUDFLARE_ZONE_ID")"
printf 'CLOUDFLARE_BOOTSTRAP_TOKEN: %s\n' "$(mask "$CLOUDFLARE_BOOTSTRAP_TOKEN")"

command -v curl >/dev/null 2>&1 || die "curl is required"
command -v jq >/dev/null 2>&1 || die "jq is required"

if request_verify "account-token" "/accounts/${CLOUDFLARE_ACCOUNT_ID}/tokens/verify"; then
  log "CLOUDFLARE_BOOTSTRAP_TOKEN is a valid account token"
  exit 0
fi

if request_verify "user-token" "/user/tokens/verify"; then
  log "CLOUDFLARE_BOOTSTRAP_TOKEN is a valid user token"
  exit 0
fi

die "CLOUDFLARE_BOOTSTRAP_TOKEN could not be verified as an account token or user token"
