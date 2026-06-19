#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# scripts/fix-mcp-stack.sh

CONFIG_FILE="${HOME}/.mcp.json"
BACKUP_DIR="${HOME}/mcp-backups"
AUTH_DIR="${HOME}/.mcp-auth"

mkdir -p "$BACKUP_DIR"
mkdir -p "$AUTH_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() {
  echo -e "${GREEN}[INFO]${NC} $*"
}

warn() {
  echo -e "${YELLOW}[WARN]${NC} $*"
}

err() {
  echo -e "${RED}[ERROR]${NC} $*"
}

backup_configs() {
  info "Backing up MCP configs"

  if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" \
      "$BACKUP_DIR/mcp.$(date +%Y%m%d-%H%M%S).json"
  fi
}

install_global_package() {
  local pkg="$1"

  if npm list -g "$pkg" >/dev/null 2>&1; then
    info "$pkg already installed"
    return
  fi

  info "Installing $pkg"

  npm install -g "$pkg"
}

ensure_binary() {
  local binary="$1"
  local pkg="$2"

  if command -v "$binary" >/dev/null 2>&1; then
    return
  fi

  warn "$binary missing"

  read -rp "Install $pkg ? [Y/n] " answer

  if [[ "${answer:-Y}" =~ ^[Yy]$ ]]; then
    install_global_package "$pkg"
  fi
}

configure_github() {

  if grep -q GITHUB_TOKEN "$AUTH_DIR/github.env" 2>/dev/null; then
    return
  fi

  warn "GitHub token missing"

  read -rsp "Enter GitHub Token: " token
  echo

  cat > "$AUTH_DIR/github.env" <<EOF
GITHUB_TOKEN=$token
EOF
}

configure_cloudflare() {

  if [ -f "$AUTH_DIR/cloudflare.env" ]; then
    return
  fi

  warn "Cloudflare auth missing"

  read -rp "Cloudflare Account ID: " account
  read -rp "Cloudflare Zone ID: " zone
  read -rsp "Cloudflare API Token: " token
  echo

  cat > "$AUTH_DIR/cloudflare.env" <<EOF
CLOUDFLARE_ACCOUNT_ID=$account
CLOUDFLARE_ZONE_ID=$zone
CLOUDFLARE_API_TOKEN=$token
EOF
}

configure_supabase() {

  if [ -f "$AUTH_DIR/supabase.env" ]; then
    return
  fi

  read -rp "Supabase URL: " url
  read -rsp "Supabase Service Key: " key
  echo

  cat > "$AUTH_DIR/supabase.env" <<EOF
SUPABASE_URL=$url
SUPABASE_SERVICE_ROLE_KEY=$key
EOF
}

configure_postgres() {

  if [ -f "$AUTH_DIR/postgres.env" ]; then
    return
  fi

  read -rp "Postgres connection string: " conn

  cat > "$AUTH_DIR/postgres.env" <<EOF
POSTGRES_CONNECTION_STRING=$conn
EOF
}

install_mcp_servers() {

  ensure_binary longhand longhand

  install_global_package \
    "@modelcontextprotocol/server-filesystem"

  install_global_package \
    "@modelcontextprotocol/server-github"

  install_global_package \
    "@modelcontextprotocol/server-postgres"

  install_global_package \
    "@modelcontextprotocol/server-memory"

  install_global_package \
    "@playwright/mcp"

  install_global_package \
    "@browserbasehq/mcp"

  install_global_package \
    "@modelcontextprotocol/server-fetch"
}

validate_network() {

  info "Testing Internet"

  curl \
    --connect-timeout 10 \
    https://google.com >/dev/null

  info "Internet OK"
}

validate_github() {

  if [ ! -f "$AUTH_DIR/github.env" ]; then
    return
  fi

  source "$AUTH_DIR/github.env"

  curl \
    -s \
    -H "Authorization: token $GITHUB_TOKEN" \
    https://api.github.com/user \
    >/dev/null

  info "GitHub OK"
}

validate_cloudflare() {

  if [ ! -f "$AUTH_DIR/cloudflare.env" ]; then
    return
  fi

  source "$AUTH_DIR/cloudflare.env"

  curl \
    -s \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    https://api.cloudflare.com/client/v4/user/tokens/verify \
    >/dev/null

  info "Cloudflare OK"
}

report() {

cat <<EOF

====================================
MCP STACK FIX COMPLETED
====================================

Configs:

$AUTH_DIR

Backups:

$BACKUP_DIR

Validate:

openwork
opencode
codex

Then test MCP connections again.

EOF
}

main() {

  backup_configs

  validate_network

  install_mcp_servers

  configure_github

  configure_cloudflare

  configure_postgres

  configure_supabase

  validate_github

  validate_cloudflare

  report
}

main "$@"
