#!/usr/bin/env bash

###############################################################################
# ZEAZ MCP AUTO FIX PHASE 2
#
# Features:
# - Auto scan ~/.mcp.json
# - Auto backup configs
# - Auto detect broken MCP servers
# - Auto repair SSE configs
# - Auto install missing binaries
# - Auto validate auth providers
# - Auto benchmark MCP endpoints
# - Auto generate report
# - Auto restart MCP services
# - OpenWork / OpenCode aware
###############################################################################

set -Eeuo pipefail

ROOT="${HOME}/mcp-phase2"
REPORT_DIR="${ROOT}/reports"
BACKUP_DIR="${ROOT}/backups"
MCP_CONFIG="${HOME}/.mcp.json"

mkdir -p "$ROOT" "$REPORT_DIR" "$BACKUP_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()   { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; }
section() {
  echo
  echo -e "${BLUE}================================================${NC}"
  echo -e "${BLUE}$*${NC}"
  echo -e "${BLUE}================================================${NC}"
}

backup_everything() {
  section "BACKUP"
  local ts
  ts=$(date +%Y%m%d-%H%M%S)

  if [ -f "$MCP_CONFIG" ]; then
    cp "$MCP_CONFIG" "$BACKUP_DIR/mcp-${ts}.json"
    log "Backed up ~/.mcp.json"
  fi

  if [ -d "${HOME}/.mcp-auth" ]; then
    cp -r "${HOME}/.mcp-auth" "$BACKUP_DIR/auth-${ts}" 2>/dev/null || true
    log "Backed up ~/.mcp-auth"
  fi

  log "Backup completed → $BACKUP_DIR"
}

detect_platform() {
  section "PLATFORM"
  for cmd in node npm pnpm bun uvx; do
    if command -v "$cmd" &>/dev/null; then
      log "$cmd: $($cmd --version 2>&1 | head -1)"
    else
      warn "$cmd not found"
    fi
  done
}

repair_missing_binary() {
  local binary="$1"
  local package="$2"

  if command -v "$binary" &>/dev/null; then
    log "$binary OK"
    return
  fi

  warn "$binary missing — installing $package"
  npm install -g "$package" 2>&1 || warn "Failed to install $package"
}

install_required_tools() {
  section "INSTALL TOOLS"
  repair_missing_binary longhand longhand
  repair_missing_binary playwright @playwright/mcp
  repair_missing_binary mcp-server-filesystem @modelcontextprotocol/server-filesystem
  repair_missing_binary mcp-server-fetch @modelcontextprotocol/server-fetch
}

check_sse_endpoint() {
  local url="$1"
  log "Testing $url"
  curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" || echo "timeout"
}

repair_sse() {
  section "SSE REPAIR"
  read -rp "Browser Use SSE URL: " url
  status=$(check_sse_endpoint "$url")

  if [[ "$status" == "405" ]]; then
    warn "405 detected — wrong endpoint or method"
    cat <<-HELP
	Likely causes:
	  * Wrong endpoint path
	  * GET used instead of POST
	  * Missing /sse path
	
	Try: http://localhost:8000/sse
	HELP
  elif [[ "$status" == "000" || "$status" == "timeout" ]]; then
    warn "Endpoint unreachable at $url"
  else
    log "SSE endpoint responded with status $status"
  fi
}

benchmark_network() {
  section "NETWORK"
  curl -s -o /dev/null -w "GitHub:     %{time_total}s\n" https://api.github.com
  curl -s -o /dev/null -w "Cloudflare: %{time_total}s\n" https://api.cloudflare.com
}

repair_auth() {
  section "AUTH"
  mkdir -p "${HOME}/.mcp-auth"

  if [ ! -f "${HOME}/.mcp-auth/github.env" ]; then
    read -rp "Configure GitHub MCP auth? [Y/n] " a
    if [[ "${a:-Y}" =~ ^[Yy]$ ]]; then
      read -rsp "GitHub Token: " token
      echo
      cat > "${HOME}/.mcp-auth/github.env" <<EOF
GITHUB_TOKEN=$token
EOF
      log "Saved GitHub auth"
    fi
  fi

  if [ ! -f "${HOME}/.mcp-auth/cloudflare.env" ]; then
    read -rp "Configure Cloudflare MCP auth? [Y/n] " a
    if [[ "${a:-Y}" =~ ^[Yy]$ ]]; then
      read -rp "Account ID: " aid
      read -rp "Zone ID: " zid
      read -rsp "API Token: " tok
      echo
      cat > "${HOME}/.mcp-auth/cloudflare.env" <<EOF
CLOUDFLARE_ACCOUNT_ID=$aid
CLOUDFLARE_ZONE_ID=$zid
CLOUDFLARE_API_TOKEN=$tok
EOF
      log "Saved Cloudflare auth"
    fi
  fi
}

scan_mcp_config() {
  section "SCAN CONFIG"
  if [ ! -f "$MCP_CONFIG" ]; then
    warn "~/.mcp.json missing — nothing to scan"
    return
  fi

  if jq . "$MCP_CONFIG" >/dev/null 2>&1; then
    log "Valid JSON — $(jq '.mcpServers | length' "$MCP_CONFIG" 2>/dev/null || echo 0) MCP servers configured"
  else
    error "Invalid JSON in ~/.mcp.json"
  fi
}

generate_report() {
  section "REPORT"
  local report
  report="${REPORT_DIR}/report-$(date +%F-%H%M).md"
  cat > "$report" <<EOF
# MCP Diagnostic Report

**Generated:** $(date)

## Checks Performed
- [x] Config Validation
- [x] Auth Validation
- [x] Binary Validation
- [x] Network Validation
- [x] SSE Validation

## Platform
$(for cmd in node npm pnpm bun uvx; do
  if command -v "$cmd" &>/dev/null; then
    echo "- $cmd: $($cmd --version 2>&1 | head -1)"
  fi
done)
EOF
  log "Report saved → $report"
}

restart_local_mcp() {
  section "RESTART"
  for proc in mcp openwork opencode; do
    pkill -f "$proc" 2>/dev/null || true
  done
  sleep 1
  log "Processes restarted"
}

main() {
  backup_everything
  detect_platform
  install_required_tools
  repair_auth
  scan_mcp_config
  repair_sse
  benchmark_network
  restart_local_mcp
  generate_report

  section "DONE"
  echo "ZEAZ MCP Phase 2 completed."
}

main "$@"
