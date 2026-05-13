#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
fail(){ log "ERROR: $*" >&2; exit 1; }
has(){ command -v "$1" >/dev/null 2>&1; }

ZVEO_REPO_URL="${ZVEO_REPO_URL:-https://github.com/cvsz/zveo.git}"
ZVEO_REF="${ZVEO_REF:-main}"
ZVEO_DIR="${ZVEO_DIR:-/opt/zveo}"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker/docker-compose.yml}"
COMPOSE_PROFILE="${COMPOSE_PROFILE:-node}"
LOCAL_HEALTH_URL="${LOCAL_HEALTH_URL:-http://localhost:8080}"
PUBLIC_HEALTH_URL="${PUBLIC_HEALTH_URL:-https://zveo.zeaz.dev/}"
RUN_SEED="${RUN_SEED:-false}"

compose(){
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif has docker-compose; then
    docker-compose "$@"
  else
    fail "docker compose is required"
  fi
}

has git || fail "git is required"
has docker || fail "docker is required"

if [[ ! -d "$ZVEO_DIR/.git" ]]; then
  log "cloning $ZVEO_REPO_URL into $ZVEO_DIR"
  sudo mkdir -p "$(dirname "$ZVEO_DIR")"
  sudo chown "$(id -u):$(id -g)" "$(dirname "$ZVEO_DIR")"
  git clone "$ZVEO_REPO_URL" "$ZVEO_DIR"
else
  log "updating existing repo at $ZVEO_DIR"
  git -C "$ZVEO_DIR" fetch origin --prune
fi

git -C "$ZVEO_DIR" checkout "$ZVEO_REF"
git -C "$ZVEO_DIR" pull --ff-only origin "$ZVEO_REF" || true

[[ -f "$ZVEO_DIR/$COMPOSE_FILE" ]] || fail "missing compose file: $ZVEO_DIR/$COMPOSE_FILE"

log "starting zVEO compose profile=$COMPOSE_PROFILE"
(
  cd "$ZVEO_DIR"
  compose -f "$COMPOSE_FILE" --profile "$COMPOSE_PROFILE" up -d --build postgres redis minio db-migrate api-gateway dashboard
)

if [[ "$RUN_SEED" == "true" ]]; then
  log "running database seed"
  (
    cd "$ZVEO_DIR"
    compose -f "$COMPOSE_FILE" --profile "$COMPOSE_PROFILE" run --rm db-seed
  )
else
  log "database seed skipped; set RUN_SEED=true to seed"
fi

log "waiting for local origin: $LOCAL_HEALTH_URL"
for attempt in {1..60}; do
  if curl -fsSI "$LOCAL_HEALTH_URL" >/tmp/zveo-local-health.headers 2>/tmp/zveo-local-health.err; then
    cat /tmp/zveo-local-health.headers
    break
  fi
  if [[ "$attempt" == "60" ]]; then
    cat /tmp/zveo-local-health.err 2>/dev/null || true
    fail "local origin did not become healthy: $LOCAL_HEALTH_URL"
  fi
  sleep 2
done

log "checking public tunnel route: $PUBLIC_HEALTH_URL"
if curl -fsSI --max-redirs 5 "$PUBLIC_HEALTH_URL" >/tmp/zveo-public-health.headers 2>/tmp/zveo-public-health.err; then
  cat /tmp/zveo-public-health.headers
  log "zVEO origin deployment completed"
else
  rc=$?
  cat /tmp/zveo-public-health.headers 2>/dev/null || true
  cat /tmp/zveo-public-health.err 2>/dev/null || true
  fail "public health check failed rc=$rc; verify Cloudflare Tunnel Public Hostname points to $LOCAL_HEALTH_URL"
fi
