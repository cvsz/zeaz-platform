#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib/logging.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib/env.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib/cloudflare.sh"

OFFLINE=false
API_CHECK=false
JSON=false
STRICT=false

cleanup() {
  local rc=$?
  if [[ $rc -ne 0 ]]; then
    error "validation failed"
  fi
}
trap cleanup EXIT

while (($#)); do
  case "$1" in
    --offline) OFFLINE=true ;;
    --api-check) API_CHECK=true ;;
    --json) JSON=true ;;
    --strict) STRICT=true ;;
    *) error "unknown argument: $1"; exit 2 ;;
  esac
  shift
done

if $OFFLINE && $API_CHECK; then
  error "--offline and --api-check are mutually exclusive"
  exit 2
fi

load_dotenv_if_present

py_args=()
$JSON && py_args+=(--json)
$STRICT && py_args+=(--strict)
python3 "${ROOT_DIR}/python/cfstack_validate_env.py" "${py_args[@]}"

if $OFFLINE; then
  info "offline mode: skipped Cloudflare API verification"
  exit 0
fi

if $API_CHECK; then
  declare -A token_permission_map=(
    [CLOUDFLARE_API_TOKEN]='account'
    [CLOUDFLARE_DNS_TOKEN]='dns'
    [CLOUDFLARE_WORKERS_TOKEN]='workers'
    [CLOUDFLARE_ZT_TOKEN]='access'
    [CLOUDFLARE_WAF_TOKEN]='waf'
    [CLOUDFLARE_TUNNEL_TOKEN]='tunnel'
    [CLOUDFLARE_R2_TOKEN]='r2'
  )

  for token_var in "${!token_permission_map[@]}"; do
    cloudflare_api_check "${!token_var}" "${token_permission_map[$token_var]}" >/dev/null
    info "token verified: ${token_var}"
  done
fi

info "validation completed"