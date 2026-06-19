#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

PROJECT_ROOT="${PROJECT_ROOT:-}"
ENV_FILE="${ENV_FILE:-}"
TOKEN_ENV_FILE="${TOKEN_ENV_FILE:-}"

readonly REQUIRED_ENV_VARS=(
  CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ZONE_ID CLOUDFLARE_API_TOKEN CLOUDFLARE_DNS_TOKEN CLOUDFLARE_WORKERS_TOKEN CLOUDFLARE_ZT_TOKEN CLOUDFLARE_WAF_TOKEN CLOUDFLARE_TUNNEL_TOKEN CLOUDFLARE_R2_TOKEN
  IDENTITY_PROVIDER_TYPE IDENTITY_PROVIDER_VENDOR IDENTITY_PROVIDER_METADATA_URL
  ENVIRONMENT REGION PRIMARY_DOMAIN ORIGIN_INFRA_TYPE ORIGIN_HOSTS
  TERRAFORM_BACKEND_TYPE
  SOPS_AGE_KEY SECRET_ROTATION_INTERVAL CLOUDFLARE_PLAN_TIER
)

readonly S3_BACKEND_REQUIRED_ENV_VARS=(TERRAFORM_STATE_BUCKET TERRAFORM_LOCK_TABLE)

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

normalize_env_file_if_repo_managed() {
  local file="$1" root normalizer
  [[ -f "$file" ]] || return 0
  root="$(find_root)" || root="${PROJECT_ROOT:-${PWD}}"
  normalizer="$root/scripts/cloudflare/clean-env-empty-values.sh"
  [[ -x "$normalizer" ]] || return 0
  case "$(basename "$file")" in
    .env|.env.cloudflare|*.env)
      bash "$normalizer" "$file"
      chmod 600 "$file" 2>/dev/null || true
      ;;
  esac
}

load_dotenv_if_present() {
  local root=""
  root="$(find_root)" || root="${PWD}"

  local env_path="${1:-${ENV_FILE:-$root/.env}}"
  local token_env_path="${TOKEN_ENV_FILE:-$root/.env.cloudflare}"

  local load_files=()
  [[ -f "$env_path" ]] && load_files+=("$env_path")
  [[ -f "$token_env_path" ]] && load_files+=("$token_env_path")

  if ((${#load_files[@]} > 0)); then
    local var
    local loaded_vars=()
    for var in "${REQUIRED_ENV_VARS[@]}" "${S3_BACKEND_REQUIRED_ENV_VARS[@]}" CLOUDFLARE_AUDIT_TOKEN CLOUDFLARE_AI_GATEWAY_TOKEN CLOUDFLARE_AI_GATEWAY_SLUG CLOUDFLARE_BOOTSTRAP_TOKEN; do
      if [[ -n "${!var+x}" ]]; then
        loaded_vars+=("$var")
      fi
    done

    set -a
    local f
    for f in "${load_files[@]}"; do
      normalize_env_file_if_repo_managed "$f"
      # shellcheck disable=SC1090
      source "$f"
    done
    set +a

    local preserved
    for preserved in "${loaded_vars[@]}"; do
      export "$preserved=${!preserved}"
    done
  fi

  : "${CLOUDFLARE_AI_GATEWAY_SLUG:=zeaz}"
  : "${COST_LOCK:=true}"
  export CLOUDFLARE_AI_GATEWAY_SLUG COST_LOCK
}

require_env_presence() {
  local missing=0
  local var
  for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [[ -z "${!var:-}" ]]; then
      missing=$((missing + 1))
      printf 'ERROR: %s: missing\n' "$var" >&2
    fi
  done

  if [[ "${TERRAFORM_BACKEND_TYPE:-}" == "s3" ]]; then
    for var in "${S3_BACKEND_REQUIRED_ENV_VARS[@]}"; do
      if [[ -z "${!var:-}" ]]; then
        missing=$((missing + 1))
        printf 'ERROR: %s: missing for s3 backend\n' "$var" >&2
      fi
    done
  fi

  return "$missing"
}
