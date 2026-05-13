#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
fail(){ log "ERROR: $*" >&2; exit 1; }
has(){ command -v "$1" >/dev/null 2>&1; }

ZWALLET_REPO_URL="${ZWALLET_REPO_URL:-https://github.com/cvsz/zwallet.git}"
ZWALLET_REF="${ZWALLET_REF:-main}"
ZWALLET_DIR="${ZWALLET_DIR:-/opt/zwallet}"
PUBLIC_HEALTH_URL="${PUBLIC_HEALTH_URL:-https://admin-wallet.zeaz.dev/}"
LOCAL_HEALTH_URL="${LOCAL_HEALTH_URL:-http://localhost:8081}"
RUN_INSTALLER="${RUN_INSTALLER:-true}"
START_PLACEHOLDER="${START_PLACEHOLDER:-true}"
PLACEHOLDER_PORT="${PLACEHOLDER_PORT:-8081}"
SERVICE_NAME="${SERVICE_NAME:-zwallet-placeholder}"

has git || fail "git is required"
has node || log "WARN: node is not installed; installer may fail"

if [[ ! -d "$ZWALLET_DIR/.git" ]]; then
  log "cloning $ZWALLET_REPO_URL into $ZWALLET_DIR"
  sudo mkdir -p "$(dirname "$ZWALLET_DIR")"
  sudo chown "$(id -u):$(id -g)" "$(dirname "$ZWALLET_DIR")"
  git clone "$ZWALLET_REPO_URL" "$ZWALLET_DIR"
else
  log "updating existing repo at $ZWALLET_DIR"
  git -C "$ZWALLET_DIR" fetch origin --prune
fi

git -C "$ZWALLET_DIR" checkout "$ZWALLET_REF"
git -C "$ZWALLET_DIR" pull --ff-only origin "$ZWALLET_REF" || true

if [[ "$RUN_INSTALLER" == "true" ]]; then
  log "running zwallet installer/typecheck/lint"
  (
    cd "$ZWALLET_DIR"
    if has corepack; then corepack enable; fi
    if has pnpm; then
      pnpm setup:auto
    else
      fail "pnpm is required for zwallet setup:auto"
    fi
  )
else
  log "zwallet installer skipped; set RUN_INSTALLER=true to run"
fi

if [[ "$START_PLACEHOLDER" == "true" ]]; then
  log "starting placeholder service on localhost:$PLACEHOLDER_PORT until zwallet runtime service is defined"
  sudo mkdir -p /opt/zwallet-placeholder
  cat <<'HTML' | sudo tee /opt/zwallet-placeholder/index.html >/dev/null
<!doctype html>
<html>
  <head><title>zWallet Origin Ready</title></head>
  <body>
    <h1>zWallet Origin Ready</h1>
    <p>admin-wallet.zeaz.dev is reaching the zWallet origin placeholder.</p>
    <p>Replace this placeholder with the real zWallet API/UI service when the runtime entrypoint is finalized.</p>
  </body>
</html>
HTML
  cat <<EOF | sudo tee "/etc/systemd/system/${SERVICE_NAME}.service" >/dev/null
[Unit]
Description=zWallet placeholder origin
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/zwallet-placeholder
ExecStart=/usr/bin/python3 -m http.server ${PLACEHOLDER_PORT} --bind 127.0.0.1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
  sudo systemctl daemon-reload
  sudo systemctl enable --now "$SERVICE_NAME"
  sudo systemctl restart "$SERVICE_NAME"
fi

log "checking local origin: $LOCAL_HEALTH_URL"
if curl -fsSI "$LOCAL_HEALTH_URL" >/tmp/zwallet-local-health.headers 2>/tmp/zwallet-local-health.err; then
  cat /tmp/zwallet-local-health.headers
else
  rc=$?
  cat /tmp/zwallet-local-health.err 2>/dev/null || true
  fail "local zwallet health failed rc=$rc"
fi

log "checking public route: $PUBLIC_HEALTH_URL"
if curl -fsSI --max-redirs 5 "$PUBLIC_HEALTH_URL" >/tmp/zwallet-public-health.headers 2>/tmp/zwallet-public-health.err; then
  cat /tmp/zwallet-public-health.headers
  log "zWallet integration check completed"
else
  rc=$?
  cat /tmp/zwallet-public-health.headers 2>/dev/null || true
  cat /tmp/zwallet-public-health.err 2>/dev/null || true
  fail "public route failed rc=$rc; configure Cloudflare Tunnel Public Hostname admin-wallet.zeaz.dev -> http://localhost:${PLACEHOLDER_PORT}"
fi
