#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

PROJECT_ROOT="${PROJECT_ROOT:-}"
ENV_FILE="${ENV_FILE:-}"
TOKEN_ENV_FILE="${TOKEN_ENV_FILE:-}"

readonly REQUIRED_ENV_VARS=(
  CF_ACCOUNT_ID CF_ZONE_ID CF_API_TOKEN CF_DNS_TOKEN CF_WORKERS_TOKEN CF_ZT_TOKEN CF_WAF_TOKEN CF_TUNNEL_TOKEN CF_R2_TOKEN
  IDENTITY_PROVIDER_TYPE IDENTITY_PROVIDER_VENDOR IDENTITY_PROVIDER_METADATA_URL
  ENVIRONMENT REGION PRIMARY_DOMAIN ORIGIN_INFRA_TYPE ORIGIN_HOSTS
  TERRAFORM_BACKEND_TYPE TERRAFORM_STATE_BUCKET TERRAFORM_LOCK_TABLE
  SOPS_AGE_KEY SECRET_ROTATION_INTERVAL CLOUDFLARE_PLAN_TIER
)

find_root() {
  local d="${PROJECT_ROOT:-${PWD}}"

  while [[ "$d" != "/" ]]; do
    if [[ -d "$d/.git" ]] ||
       [[ -d "$d/terraform" ]] ||
       [[ -f "$d/.env.example" ]] ||
       [[ -f "$d/python/cfstack_validate_env.py" ]] ||
       [[ -f "$d/package.json" ]]; then
      printf '%s\n' "$d"
      return 0
    fi

    d="$(dirname "$d")"
  done

  return 1
}

load_dotenv_if_present() {
  local root=""
  root="$(find_root)" || root="${PWD}"

  local env_path="${1:-${ENV_FILE:-$root/.env}}"
  local token_env_path="${TOKEN_ENV_FILE:-$root/.env.cloudflare}"

  local load_files=()
  [[ -f "$token_env_path" ]] && load_files+=("$token_env_path")
  [[ -f "$env_path" ]] && load_files+=("$env_path")

  if ((${#load_files[@]} > 0)); then
    local var
    local loaded_vars=()
    for var in "${REQUIRED_ENV_VARS[@]}" CF_AUDIT_TOKEN CF_AI_GATEWAY_TOKEN CF_AI_GATEWAY_SLUG; do
      if [[ -n "${!var+x}" ]]; then
        loaded_vars+=("$var")
      fi
    done

    set -a
    local f
    for f in "${load_files[@]}"; do
      # shellcheck disable=SC1090
      source "$f"
    done
    set +a

    local preserved
    for preserved in "${loaded_vars[@]}"; do
      export "$preserved=${!preserved}"
    done
  fi

  : "${CF_AI_GATEWAY_SLUG:=zeaz}"
  export CF_AI_GATEWAY_SLUG
}

require_env_presence() {
  local missing=0
  local var
  for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [[ -z "${!var:-}" ]]; then
      missing=$((missing + 1))
      printf 'ERROR: %s: missing\n' "${var}" >&2
    fi
  done
  return "${missing}"
}
