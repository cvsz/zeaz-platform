#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

MODE="${1:-}"
STRICT_TOOLS="${STRICT_TOOLS:-false}"
CODEX_CLOUD="${CODEX_CLOUD:-false}"
[[ "${MODE}" == "--strict-tools" ]] && STRICT_TOOLS=true

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
warn(){ log "WARN: $*" >&2; }
die(){ log "ERROR: $*" >&2; exit 1; }
has(){ command -v "$1" >/dev/null 2>&1; }

find_root() {
  local d="${PROJECT_ROOT:-${PWD}}"
  while [[ "${d}" != "/" ]]; do
    if [[ -d "${d}/.git" ]] || [[ -d "${d}/terraform" ]] || [[ -f "${d}/.env.example" ]] || [[ -f "${d}/python/cfstack_validate_env.py" ]]; then
      printf '%s\n' "${d}"
      return 0
    fi
    d="$(dirname "${d}")"
  done
  return 1
}

ROOT="$(find_root || true)"
[[ -n "${ROOT}" && "${ROOT}" != "/" ]] || { warn "could not detect repo root from PWD=${PWD}"; exit 0; }

ENV_FILE="${ENV_FILE:-$ROOT/.env}"
TOKEN_ENV_FILE="${TOKEN_ENV_FILE:-$ROOT/.env.cloudflare}"
BACKUP_DIR="$ROOT/.cloudflare-backups"
mkdir -p "$BACKUP_DIR"

read_env_value(){
  local file="$1" key="$2"
  [[ -f "$file" ]] || return 0
  awk -F= -v k="$key" '$1 == k {v=$0; sub(/^[^=]*=/, "", v); gsub(/^"|"$/, "", v); print v}' "$file" | tail -n 1
}

pick(){
  local key="$1" default="${2:-}" value=""
  value="${!key:-}"
  [[ -n "$value" ]] || value="$(read_env_value "$ENV_FILE" "$key")"
  [[ -n "$value" ]] || value="$(read_env_value "$TOKEN_ENV_FILE" "$key")"
  [[ -n "$value" ]] || value="$default"
  printf '%s' "$value"
}

if [[ -f "$ENV_FILE" ]]; then
  cp "$ENV_FILE" "$BACKUP_DIR/env.$(date -u +%Y%m%dT%H%M%SZ).bak"
  log "backup saved under $BACKUP_DIR"
fi

cat > "$ENV_FILE" <<ENV
CF_ACCOUNT_ID=$(pick CF_ACCOUNT_ID)
CF_ZONE_ID=$(pick CF_ZONE_ID)
CF_API_TOKEN=$(pick CF_API_TOKEN)
CF_DNS_TOKEN=$(pick CF_DNS_TOKEN)
CF_WORKERS_TOKEN=$(pick CF_WORKERS_TOKEN)
CF_ZT_TOKEN=$(pick CF_ZT_TOKEN)
CF_WAF_TOKEN=$(pick CF_WAF_TOKEN)
CF_TUNNEL_TOKEN=$(pick CF_TUNNEL_TOKEN)
CF_R2_TOKEN=$(pick CF_R2_TOKEN)
CF_AUDIT_TOKEN=$(pick CF_AUDIT_TOKEN)
CF_AI_GATEWAY_TOKEN=$(pick CF_AI_GATEWAY_TOKEN)
CF_AI_GATEWAY_SLUG=$(pick CF_AI_GATEWAY_SLUG zeaz)

CLOUDFLARE_PLAN_TIER=$(pick CLOUDFLARE_PLAN_TIER Free)
IDENTITY_PROVIDER_TYPE=$(pick IDENTITY_PROVIDER_TYPE saml)
IDENTITY_PROVIDER_VENDOR=$(pick IDENTITY_PROVIDER_VENDOR authentik)
IDENTITY_PROVIDER_METADATA_URL=$(pick IDENTITY_PROVIDER_METADATA_URL https://auth.zeaz.dev/application/saml/cloudflare-zero-trust/metadata/)

PRIMARY_DOMAIN=$(pick PRIMARY_DOMAIN zeaz.dev)
ENVIRONMENT=$(pick ENVIRONMENT prod)
REGION=$(pick REGION ap-southeast-1)

ORIGIN_INFRA_TYPE=$(pick ORIGIN_INFRA_TYPE vm)
ORIGIN_HOSTS=$(pick ORIGIN_HOSTS app.internal,pay.internal)

TERRAFORM_BACKEND_TYPE=$(pick TERRAFORM_BACKEND_TYPE s3)
TERRAFORM_STATE_BUCKET=$(pick TERRAFORM_STATE_BUCKET zeaz-dev-cloudflare-platform-tfstate)
TERRAFORM_LOCK_TABLE=$(pick TERRAFORM_LOCK_TABLE zeaz-dev-cloudflare-platform-tflock)

SOPS_AGE_KEY=$(pick SOPS_AGE_KEY)
SECRET_ROTATION_INTERVAL=$(pick SECRET_ROTATION_INTERVAL 30d)
ENV

chmod 600 "$ENV_FILE"
log "wrote $ENV_FILE"

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if has python3 && [[ -f "$ROOT/python/cfstack_validate_env.py" ]]; then
  python3 "$ROOT/python/cfstack_validate_env.py" --strict || warn "env validation failed because required secrets/IDs are missing or invalid"
else
  warn "python3 or validator missing; skipped env validation"
fi

if has terraform && [[ -d "$ROOT/terraform" ]]; then
  terraform -chdir="$ROOT/terraform" fmt -recursive || warn "terraform fmt failed"
  terraform -chdir="$ROOT/terraform" init -backend=false || warn "terraform init failed"
  terraform -chdir="$ROOT/terraform" validate || warn "terraform validate failed"
else
  [[ "$STRICT_TOOLS" == "true" ]] && die "terraform is required but missing"
  warn "terraform missing or terraform/ directory not found; skipped terraform init/validate"
fi

log "environment setup complete"
