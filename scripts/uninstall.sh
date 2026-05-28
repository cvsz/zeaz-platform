#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# shellcheck disable=SC1091
source "$(cd "$(dirname "$0")" && pwd)/common.sh"

rollback(){ warn "rollback invoked (no destructive changes were applied yet)"; }
trap 'rollback' ERR

main(){
  validate_plan
  case "$(basename "$0")" in
    install.sh)
      require_env CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ZONE_ID CLOUDFLARE_API_TOKEN ENVIRONMENT PRIMARY_DOMAIN || exit 1
      info "initializing terraform and validating configuration"
      retry 3 terraform -chdir="$PROJECT_ROOT/terraform" init -backend=false
      retry 3 terraform -chdir="$PROJECT_ROOT/terraform" validate
      ;;
    uninstall.sh)
      require_env CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ZONE_ID CLOUDFLARE_API_TOKEN ENVIRONMENT || exit 1
      info "generating destroy plan"
      retry 3 terraform -chdir="$PROJECT_ROOT/terraform" plan -destroy -out tfplan.destroy
      ;;
    repair.sh)
      info "running drift check and reconciliation plan"
      retry 3 terraform -chdir="$PROJECT_ROOT/terraform" plan -detailed-exitcode || true
      ;;
    update.sh)
      info "updating provider lock and modules"
      retry 3 terraform -chdir="$PROJECT_ROOT/terraform" init -upgrade
      ;;
    rotate-secrets.sh)
      require_env SECRET_ROTATION_INTERVAL SOPS_AGE_KEY || exit 1
      info "secret rotation workflow started"
      ;;
    backup.sh)
      info "creating configuration backup"
      ts="$(date -u +%Y%m%dT%H%M%SZ)"
      mkdir -p "$PROJECT_ROOT/backups"
      tar -czf "$PROJECT_ROOT/backups/config-$ts.tgz" "$PROJECT_ROOT/terraform" "$PROJECT_ROOT/docs" "$PROJECT_ROOT/scripts"
      ;;
    restore.sh)
      require_env BACKUP_ARCHIVE || exit 1
      info "restoring from $BACKUP_ARCHIVE"
      tar -xzf "$BACKUP_ARCHIVE" -C "$PROJECT_ROOT"
      ;;
    validate.sh)
      require_env CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ZONE_ID CLOUDFLARE_DNS_TOKEN CLOUDFLARE_WORKERS_TOKEN CLOUDFLARE_ZT_TOKEN CLOUDFLARE_WAF_TOKEN CLOUDFLARE_TUNNEL_TOKEN CLOUDFLARE_R2_TOKEN IDENTITY_PROVIDER_TYPE IDENTITY_PROVIDER_VENDOR IDENTITY_PROVIDER_METADATA_URL ENVIRONMENT REGION PRIMARY_DOMAIN ORIGIN_INFRA_TYPE ORIGIN_HOSTS TERRAFORM_BACKEND_TYPE TERRAFORM_STATE_BUCKET TERRAFORM_LOCK_TABLE SOPS_AGE_KEY SECRET_ROTATION_INTERVAL CLOUDFLARE_PLAN_TIER || exit 1
      health_check
      retry 3 terraform -chdir="$PROJECT_ROOT/terraform" validate
      ;;
    drift-detect.sh)
      info "running terraform drift detection"
      set +e
      terraform -chdir="$PROJECT_ROOT/terraform" plan -detailed-exitcode -out tfplan.drift
      rc=$?
      set -e
      if [ "$rc" -eq 2 ]; then warn "drift detected"; exit 2; fi
      if [ "$rc" -ne 0 ]; then err "drift check failed"; exit "$rc"; fi
      info "no drift detected"
      ;;
  esac
  info "completed"
}

main "$@"