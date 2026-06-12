# scripts/mcp-auto-healer-v3.sh

#!/usr/bin/env bash

set -Eeuo pipefail

###############################################################################
# CONFIG
###############################################################################

MCP_CONFIG="${HOME}/.mcp.json"

BASE_DIR="${HOME}/mcp-health"

BACKUP_DIR="${BASE_DIR}/backups"
REPORT_DIR="${BASE_DIR}/reports"
AUTH_DIR="${HOME}/.mcp-auth"

mkdir -p "${BACKUP_DIR}"
mkdir -p "${REPORT_DIR}"
mkdir -p "${AUTH_DIR}"

###############################################################################
# COLORS
###############################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

###############################################################################
# LOGGING
###############################################################################

log() {
  echo -e "${GREEN}[INFO]${NC} $*"
}

warn() {
  echo -e "${YELLOW}[WARN]${NC} $*"
}

fail() {
  echo -e "${RED}[FAIL]${NC} $*"
}

section() {
  echo
  echo -e "${BLUE}==================================================${NC}"
  echo -e "${BLUE}$*${NC}"
  echo -e "${BLUE}==================================================${NC}"
}

###############################################################################
# REQUIREMENTS
###############################################################################

require_tools() {

  local tools=(
    jq
    curl
    timeout
    date
  )

  for tool in "${tools[@]}"
  do
    if ! command -v "$tool" >/dev/null 2>&1
    then
      fail "Missing required tool: $tool"
      exit 1
    fi
  done
}

###############################################################################
# BACKUP
###############################################################################

backup_config() {

  section "BACKUP"

  if [ -f "${MCP_CONFIG}" ]
  then

    local backup_file

    backup_file="${BACKUP_DIR}/mcp-$(date +%Y%m%d-%H%M%S).json"

    cp "${MCP_CONFIG}" "${backup_file}"

    log "Backup created"

    echo "${backup_file}"

  else

    warn "${MCP_CONFIG} not found"

  fi
}

###############################################################################
# CONFIG VALIDATION
###############################################################################

validate_config() {

  section "VALIDATE CONFIG"

  if [ ! -f "${MCP_CONFIG}" ]
  then
    fail "${MCP_CONFIG} not found"
    exit 1
  fi

  if ! jq empty "${MCP_CONFIG}" >/dev/null 2>&1
  then
    fail "Invalid JSON"
    exit 1
  fi

  log "Valid JSON"
}

###############################################################################
# AUTH
###############################################################################

ensure_auth_file() {

  local file="$1"

  if [ ! -f "${AUTH_DIR}/${file}" ]
  then

    warn "${file} missing"

    read -rp "Create ${file}? [Y/n] " answer

    if [[ "${answer:-Y}" =~ ^[Yy]$ ]]
    then
      touch "${AUTH_DIR}/${file}"
      log "Created ${AUTH_DIR}/${file}"
    fi
  fi
}

check_auth() {

  section "AUTH FILES"

  ensure_auth_file github.env
  ensure_auth_file cloudflare.env
  ensure_auth_file postgres.env
  ensure_auth_file supabase.env
}

###############################################################################
# COMMAND CHECK
###############################################################################

check_command() {

  local cmd="$1"

  if [ -z "${cmd}" ]
  then
    return
  fi

  if command -v "${cmd}" >/dev/null 2>&1
  then
    log "Command OK: ${cmd}"
  else
    warn "Command Missing: ${cmd}"
  fi
}

###############################################################################
# URL CHECK
###############################################################################

check_url() {

  local url="$1"

  if [ -z "${url}" ]
  then
    return
  fi

  local status

  status=$(
    curl \
      --silent \
      --output /dev/null \
      --write-out "%{http_code}" \
      --max-time 10 \
      "${url}" || echo "FAIL"
  )

  case "${status}" in

    200)
      log "HTTP 200 ${url}"
      ;;

    401)
      warn "HTTP 401 ${url}"
      ;;

    403)
      warn "HTTP 403 ${url}"
      ;;

    404)
      warn "HTTP 404 ${url}"
      ;;

    405)
      warn "HTTP 405 ${url}"
      warn "Possible SSE endpoint mismatch"
      ;;

    FAIL)
      warn "Connection failed ${url}"
      ;;

    *)
      warn "HTTP ${status} ${url}"
      ;;

  esac
}

###############################################################################
# SERVER SCAN
###############################################################################

scan_servers() {

  section "SCAN MCP SERVERS"

  jq -c '
  .mcpServers
  | to_entries[]
  ' "${MCP_CONFIG}" |
  while read -r row
  do

    local name
    local command
    local url

    name=$(echo "${row}" | jq -r '.key')
    command=$(echo "${row}" | jq -r '.value.command // ""')
    url=$(echo "${row}" | jq -r '.value.url // ""')

    echo
    echo "----------------------------------------"
    echo "SERVER : ${name}"
    echo "----------------------------------------"

    if [ -n "${command}" ]
    then
      check_command "${command}"
    fi

    if [ -n "${url}" ]
    then
      check_url "${url}"
    fi

  done
}

###############################################################################
# NETWORK TEST
###############################################################################

network_test() {

  section "NETWORK"

  local github_status

  github_status=$(
    curl \
      -s \
      -o /dev/null \
      -w "%{http_code}" \
      https://api.github.com
  )

  echo "GitHub API : ${github_status}"

  local cloudflare_status

  cloudflare_status=$(
    curl \
      -s \
      -o /dev/null \
      -w "%{http_code}" \
      https://api.cloudflare.com
  )

  echo "Cloudflare API : ${cloudflare_status}"
}

###############################################################################
# REPORT
###############################################################################

generate_report() {

  section "REPORT"

  local report

  report="${REPORT_DIR}/report-$(date +%Y%m%d-%H%M%S).md"

  {
    echo "# MCP Health Report"
    echo
    echo "Generated: $(date)"
    echo
    echo "Config: ${MCP_CONFIG}"
    echo
    echo "Host: $(hostname)"
    echo
  } > "${report}"

  log "Report generated"

  echo "${report}"
}

###############################################################################
# MAIN
###############################################################################

main() {

  require_tools

  backup_config

  validate_config

  check_auth

  network_test

  scan_servers

  generate_report

  section "COMPLETE"

  echo "MCP scan completed successfully."
}

main "$@"
