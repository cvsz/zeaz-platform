#!/bin/bash

# Cloudflare MCP Automated Login Script (Advanced)
# Features: Retry logic, credential handling, detailed logging

set -e

# Configuration
CLOUDFLARE_SERVERS=(
    "cloudflare"
    "cloudflare-bindings"
    "cloudflare-builds"
    "cloudflare-observability"
)

MAX_RETRIES=3
RETRY_DELAY=2
LOG_FILE="${LOG_FILE:-./cloudflare-mcp-login.log}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

# Check if required environment variables are set
check_credentials() {
    if [ -z "$CLOUDFLARE_API_TOKEN" ] && [ -z "$CLOUDFLARE_API_KEY" ]; then
        log "WARN" "No Cloudflare credentials found in environment variables"
        log "INFO" "Set CLOUDFLARE_API_TOKEN or CLOUDFLARE_API_KEY to avoid interactive prompts"
    fi
}

# Retry function
retry_login() {
    local server=$1
    local attempt=1
    
    while [ $attempt -le $MAX_RETRIES ]; do
        log "INFO" "Login attempt $attempt/$MAX_RETRIES for $server"
        
        if codex mcp login "$server" 2>&1 | tee -a "$LOG_FILE"; then
            return 0
        fi
        
        if [ $attempt -lt $MAX_RETRIES ]; then
            log "WARN" "Attempt $attempt failed for $server. Retrying in ${RETRY_DELAY}s..."
            sleep "$RETRY_DELAY"
        fi
        
        ((attempt++))
    done
    
    return 1
}

# Main function
main() {
    log "INFO" "Starting Cloudflare MCP Server Automated Login"
    log "INFO" "Processing ${#CLOUDFLARE_SERVERS[@]} servers"
    
    check_credentials
    
    echo ""
    echo -e "${BLUE}🔐 Cloudflare MCP Server Login${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    
    local succeeded=()
    local failed=()
    
    for server in "${CLOUDFLARE_SERVERS[@]}"; do
        echo -e "${YELLOW}⏳ Processing $server...${NC}"
        
        if retry_login "$server"; then
            succeeded+=("$server")
            echo -e "${GREEN}✅ Successfully authenticated: $server${NC}\n"
            log "SUCCESS" "Logged in to $server"
        else
            failed+=("$server")
            echo -e "${RED}❌ Failed to authenticate: $server${NC}\n"
            log "ERROR" "Failed to login to $server after $MAX_RETRIES attempts"
        fi
    done
    
    # Print summary
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📊 Authentication Summary${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ ${#succeeded[@]} -gt 0 ]; then
        echo -e "${GREEN}✅ Succeeded (${#succeeded[@]}):${NC}"
        for server in "${succeeded[@]}"; do
            echo -e "   ${GREEN}✓${NC} $server"
        done
        echo ""
    fi
    
    if [ ${#failed[@]} -gt 0 ]; then
        echo -e "${RED}❌ Failed (${#failed[@]}):${NC}"
        for server in "${failed[@]}"; do
            echo -e "   ${RED}✗${NC} $server"
        done
        echo ""
        echo -e "${YELLOW}⚠️  Some servers failed. Check ${LOG_FILE} for details.${NC}"
        log "ERROR" "Login process completed with errors"
        exit 1
    fi
    
    echo -e "${GREEN}🎉 All Cloudflare MCP servers successfully authenticated!${NC}"
    log "SUCCESS" "All servers authenticated successfully"
}

# Run main function
main "$@"
