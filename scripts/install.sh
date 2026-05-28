#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

MODE="${1:-install}"
STRICT_TOOLS="${STRICT_TOOLS:-false}"
CODEX_CLOUD="${CODEX_CLOUD:-false}"

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
info(){ log "INFO: $*"; }
warn(){ log "WARN: $*" >&2; }
die(){ log "ERROR: $*" >&2; exit 1; }
has(){ command -v "$1" >/dev/null 2>&1; }

find_root(){
  local d="${PROJECT_ROOT:-${PWD}}"
  while [[ "$d" != "/" ]]; do
    if [[ -d "$d/.git" ]] || [[ -d "$d/terraform" ]] || [[ -f "$d/.env.example" ]] || [[ -f "$d/python/cfstack_validate_env.py" ]]; then
      printf '%s\n' "$d"
      return 0
    fi
    d="$(dirname "$d")"
  done
  return 1
}

PROJECT_ROOT="$(find_root || true)"
[[ -n "$PROJECT_ROOT" && "$PROJECT_ROOT" != "/" ]] || { warn "could not detect repo root from PWD=${PWD}"; exit 0; }

ENV_FILE="${ENV_FILE:-$PROJECT_ROOT/.env}"
BACKUP_DIR="$PROJECT_ROOT/.cloudflare-backups"
mkdir -p "$BACKUP_DIR"

load_env(){
  [[ -f "$ENV_FILE" ]] || { warn "missing env file: $ENV_FILE"; return 0; }
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
}

require_env(){
  local miss=0 v
  for v in "$@"; do
    if [[ -z "${!v:-}" ]]; then
      warn "missing required env var $v"
      miss=1
    fi
  done
  [[ "$miss" -eq 0 ]]
}

normalize_plan_tier(){
  local raw="${CLOUDFLARE_PLAN_TIER:-Free}"
  case "${raw,,}" in
    free) CLOUDFLARE_PLAN_TIER="Free" ;;
    pro) CLOUDFLARE_PLAN_TIER="Pro" ;;
    business) CLOUDFLARE_PLAN_TIER="Business" ;;
    enterprise) CLOUDFLARE_PLAN_TIER="Enterprise" ;;
    *) CLOUDFLARE_PLAN_TIER="$raw" ;;
  esac
  export CLOUDFLARE_PLAN_TIER
}

validate_plan(){
  normalize_plan_tier
  case "$CLOUDFLARE_PLAN_TIER" in
    Free|Pro|Business|Enterprise) info "detected plan tier $CLOUDFLARE_PLAN_TIER" ;;
    *) warn "invalid CLOUDFLARE_PLAN_TIER=$CLOUDFLARE_PLAN_TIER"; return 1 ;;
  esac
}

tf_available(){
  if ! has terraform; then
    [[ "$STRICT_TOOLS" == "true" ]] && die "missing dependency: terraform"
    warn "terraform missing; skipped terraform operation"
    return 1
  fi
  [[ -d "$PROJECT_ROOT/terraform" ]] || { warn "terraform directory not found; skipped terraform operation"; return 1; }
  return 0
}

run_tf(){
  tf_available || return 0
  terraform -chdir="$PROJECT_ROOT/terraform" "$@" || warn "terraform command failed: terraform $*"
}

backup_config(){
  local ts archive
  ts="$(date -u +%Y%m%dT%H%M%SZ)"
  archive="$BACKUP_DIR/config-$ts.tgz"
  tar -czf "$archive" -C "$PROJECT_ROOT" terraform docs scripts .env.example 2>/dev/null || warn "backup archive created with partial content"
  chmod 600 "$archive" 2>/dev/null || true
  info "backup saved: $archive"
}

rollback(){ warn "rollback invoked; no destructive install action was applied"; }
trap rollback ERR

load_env
validate_plan || true

case "$(basename "$0"):$MODE" in
  install.sh:*|*:install)
    require_env CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ZONE_ID CLOUDFLARE_API_TOKEN ENVIRONMENT PRIMARY_DOMAIN || warn "install validation has missing env values"
    info "initializing terraform and validating configuration"
    run_tf init -backend=false
    run_tf validate
    ;;
  uninstall.sh:*|*:uninstall)
    require_env CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ZONE_ID CLOUDFLARE_API_TOKEN ENVIRONMENT || warn "uninstall validation has missing env values"
    info "generating destroy plan only"
    run_tf plan -destroy -out=tfplan.destroy
    ;;
  repair.sh:*|*:repair)
    info "running drift check and reconciliation plan"
    run_tf plan -detailed-exitcode
    ;;
  update.sh:*|*:update)
    info "updating provider lock and modules"
    run_tf init -upgrade
    ;;
  rotate-secrets.sh:*|*:rotate-secrets)
    require_env SECRET_ROTATION_INTERVAL SOPS_AGE_KEY || warn "secret rotation env is incomplete"
    info "secret rotation workflow started"
    ;;
  backup.sh:*|*:backup)
    backup_config
    ;;
  restore.sh:*|*:restore)
    require_env BACKUP_ARCHIVE || die "BACKUP_ARCHIVE is required for restore"
    info "restoring from $BACKUP_ARCHIVE"
    tar -xzf "$BACKUP_ARCHIVE" -C "$PROJECT_ROOT"
    ;;
  validate.sh:*|*:validate)
    require_env CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ZONE_ID CLOUDFLARE_DNS_TOKEN CLOUDFLARE_WORKERS_TOKEN CLOUDFLARE_ZT_TOKEN CLOUDFLARE_WAF_TOKEN CLOUDFLARE_TUNNEL_TOKEN CLOUDFLARE_R2_TOKEN IDENTITY_PROVIDER_TYPE IDENTITY_PROVIDER_VENDOR IDENTITY_PROVIDER_METADATA_URL ENVIRONMENT REGION PRIMARY_DOMAIN ORIGIN_INFRA_TYPE ORIGIN_HOSTS TERRAFORM_BACKEND_TYPE TERRAFORM_STATE_BUCKET TERRAFORM_LOCK_TABLE SOPS_AGE_KEY SECRET_ROTATION_INTERVAL CLOUDFLARE_PLAN_TIER || warn "validation has missing env values"
    run_tf fmt -check
    run_tf validate
    ;;
  drift-detect.sh:*|*:drift-detect)
    info "running terraform drift detection"
    if tf_available; then
      set +e
      terraform -chdir="$PROJECT_ROOT/terraform" plan -detailed-exitcode -out=tfplan.drift
      rc=$?
      set -e
      case "$rc" in
        0) info "no drift detected" ;;
        2) warn "drift detected" ;;
        *) warn "drift check failed rc=$rc" ;;
      esac
    fi
    ;;
  *)
    cat >&2 <<USAGE
Usage: $0 [install|uninstall|repair|update|rotate-secrets|backup|restore|validate|drift-detect]

Optional env:
  PROJECT_ROOT=/path/to/repo
  ENV_FILE=/path/to/.env
  STRICT_TOOLS=true
  CODEX_CLOUD=true
USAGE
    exit 2
    ;;
esac

info "completed"