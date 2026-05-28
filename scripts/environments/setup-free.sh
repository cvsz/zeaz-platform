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

ENV_FILE="${ENV_FILE:-$ROOT/.env}"
EXAMPLE_FILE="${EXAMPLE_FILE:-$ROOT/.env.example}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT/.cloudflare-backups}"
mkdir -p "$BACKUP_DIR"

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
warn(){ log "WARN: $*" >&2; }
die(){ log "ERROR: $*" >&2; exit 1; }

[[ -f "$EXAMPLE_FILE" ]] || die "missing $EXAMPLE_FILE"

read_value(){
  local file="$1" key="$2"
  [[ -f "$file" ]] || return 0
  awk -F= -v k="$key" '$1 == k {v=$0; sub(/^[^=]*=/, "", v); print v}' "$file" | tail -n 1
}

if [[ -f "$ENV_FILE" ]]; then
  backup="$BACKUP_DIR/env.$(date -u +%Y%m%dT%H%M%SZ).bak"
  cp "$ENV_FILE" "$backup"
  chmod 600 "$backup" 2>/dev/null || true
  log "backup saved: $backup"
fi

tmp="$(mktemp "$ENV_FILE.free.XXXXXX")"
while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
    key="${line%%=*}"
    existing="$(read_value "$ENV_FILE" "$key")"
    if [[ -n "$existing" ]]; then
      printf '%s=%s\n' "$key" "$existing" >> "$tmp"
    else
      printf '%s\n' "$line" >> "$tmp"
    fi
  else
    printf '%s\n' "$line" >> "$tmp"
  fi
done < "$EXAMPLE_FILE"

# Enforce safe free/no-cost defaults even when the template changes later.
for key in COST_LOCK ALLOW_PAID_CLOUDFLARE_FEATURES ALLOW_R2_WRITE ALLOW_WORKERS_DEPLOY ALLOW_LOAD_BALANCING ALLOW_ADVANCED_WAF ALLOW_LOGPUSH TERRAFORM_BACKEND_TYPE CLOUDFLARE_PLAN_TIER; do
  sed -i.bak "/^${key}=/d" "$tmp"
done
rm -f "$tmp.bak"
cat >> "$tmp" <<'ENV'

# Enforced Free/no-cost defaults from scripts/environments/setup-free.sh
CLOUDFLARE_PLAN_TIER=Free
COST_LOCK=true
ALLOW_PAID_CLOUDFLARE_FEATURES=false
ALLOW_R2_WRITE=false
ALLOW_WORKERS_DEPLOY=false
ALLOW_LOAD_BALANCING=false
ALLOW_ADVANCED_WAF=false
ALLOW_LOGPUSH=false
TERRAFORM_BACKEND_TYPE=local
ENV

mv "$tmp" "$ENV_FILE"
chmod 600 "$ENV_FILE"
log "wrote $ENV_FILE with Free/no-cost defaults"

if command -v python3 >/dev/null 2>&1 && [[ -f python/cfstack_validate_env.py ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  if ! python3 python/cfstack_validate_env.py; then
    warn "strict deployment validation is incomplete; fill real Cloudflare tokens/IDs and run make validate-env-strict"
  fi
fi
