#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

MODE="${1:-check}"
STRICT_TOOLS="${STRICT_TOOLS:-false}"
CODEX_CLOUD="${CODEX_CLOUD:-false}"

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
[[ -n "$ROOT" && "$ROOT" != "/" ]] || { warn "could not detect repo root from PWD=${PWD}"; exit 0; }

ENV_FILE="${ENV_FILE:-$ROOT/.env}"
BACKUP_DIR="$ROOT/.cloudflare-backups"
mkdir -p "$BACKUP_DIR"

[[ -f "$ENV_FILE" ]] || {
  warn "missing env file: $ENV_FILE"
  warn "run scripts/environments/setup.sh first"
  exit 0
}

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

validate_env(){
  if has python3 && [[ -f "$ROOT/python/cfstack_validate_env.py" ]]; then
    python3 "$ROOT/python/cfstack_validate_env.py" --strict || warn "env validation failed because required secrets/IDs are missing or invalid"
  else
    warn "python3 or validator missing; skipped env validation"
  fi
}

backup_env(){
  cp "$ENV_FILE" "$BACKUP_DIR/env.$(date -u +%Y%m%dT%H%M%SZ).bak"
  log "env backup saved under $BACKUP_DIR"
}

tf_available(){
  if ! has terraform; then
    [[ "$STRICT_TOOLS" == "true" ]] && die "missing dependency: terraform"
    warn "terraform missing; skipped terraform operation"
    return 1
  fi

  if [[ ! -d "$ROOT/terraform" ]]; then
    warn "terraform directory not found; skipped terraform operation"
    return 1
  fi

  return 0
}

tf_init(){
  tf_available || return 0
  terraform -chdir="$ROOT/terraform" init || warn "terraform init failed"
}

tf_validate(){
  tf_available || return 0
  terraform -chdir="$ROOT/terraform" fmt -check -recursive || warn "terraform fmt check failed"
  terraform -chdir="$ROOT/terraform" init || warn "terraform init failed"
  terraform -chdir="$ROOT/terraform" validate || warn "terraform validate failed"
}

drift(){
  tf_available || return 0
  set +e
  terraform -chdir="$ROOT/terraform" plan -detailed-exitcode -out=tfplan.drift
  rc=$?
  set -e

  case "$rc" in
    0) log "no drift detected" ;;
    2) warn "drift detected" ;;
    *) warn "terraform drift check failed rc=$rc" ;;
  esac
}

plan(){
  tf_available || return 0
  terraform -chdir="$ROOT/terraform" plan || warn "terraform plan failed"
}

upgrade(){
  tf_available || return 0
  backup_env
  terraform -chdir="$ROOT/terraform" init -upgrade || warn "terraform upgrade failed"
  terraform -chdir="$ROOT/terraform" validate || warn "terraform validate failed after upgrade"
}

codex_cloud_info(){
  [[ "$CODEX_CLOUD" == "true" ]] || return 0
  log "CODEX_CLOUD enabled"
  log "PROJECT_ROOT=$ROOT"
  log "ENV_FILE=$ENV_FILE"
}

case "$MODE" in
  check)
    codex_cloud_info
    validate_env
    tf_validate
    drift
    ;;
  validate)
    codex_cloud_info
    validate_env
    tf_validate
    ;;
  drift)
    codex_cloud_info
    validate_env
    drift
    ;;
  plan)
    codex_cloud_info
    validate_env
    tf_init
    plan
    ;;
  upgrade)
    codex_cloud_info
    validate_env
    upgrade
    ;;
  backup)
    backup_env
    ;;
  *)
    cat >&2 <<USAGE
Usage:
  $0 check      # validate env + terraform + drift
  $0 validate   # env + terraform validation only
  $0 drift      # terraform drift check only
  $0 plan       # terraform init + plan
  $0 upgrade    # terraform init -upgrade
  $0 backup     # backup .env only

Optional:
  PROJECT_ROOT=/home/zeazdev/cloudflare-platform $0 check
  STRICT_TOOLS=true $0 check
  CODEX_CLOUD=true $0 check
USAGE
    exit 2
    ;;
esac

log "maintenance complete: $MODE"
