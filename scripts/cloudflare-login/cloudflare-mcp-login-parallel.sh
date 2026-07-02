#!/bin/bash

# Cloudflare MCP Parallel Login Script
# Logs in to multiple Cloudflare MCP servers in parallel for speed

set -e

SERVERS=(
    "cloudflare"
    "cloudflare-bindings"
    "cloudflare-builds"
    "cloudflare-observability"
)

MAX_PARALLEL_JOBS=4
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔐 Cloudflare MCP Parallel Login${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

# Function to login to a server
login_server() {
    local server=$1
    local output_file="$TEMP_DIR/$server.log"
    
    echo -e "${YELLOW}⏳ Starting login: $server${NC}"
    
    if codex mcp login "$server" > "$output_file" 2>&1; then
        echo -e "${GREEN}✅ Success: $server${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed: $server${NC}"
        cat "$output_file"
        return 1
    fi
}

export -f login_server
export TEMP_DIR

# Run logins in parallel
echo "Launching parallel login jobs (max: $MAX_PARALLEL_JOBS)..."
echo ""

failed_count=0

# Use GNU Parallel if available, otherwise fall back to manual job management
if command -v parallel &> /dev/null; then
    echo "${SERVERS[@]}" | tr ' ' '\n' | \
    parallel --max-procs "$MAX_PARALLEL_JOBS" login_server
    failed_count=$?
else
    # Manual parallel job management
    declare -A pids
    
    for server in "${SERVERS[@]}"; do
        # Wait if we've reached max parallel jobs
        while [ $(jobs -r | wc -l) -ge $MAX_PARALLEL_JOBS ]; do
            sleep 0.1
        done
        
        # Start job in background
        login_server "$server" &
        pids[$server]=$!
    done
    
    # Wait for all jobs to complete
    for server in "${SERVERS[@]}"; do
        if ! wait ${pids[$server]} 2>/dev/null; then
            ((failed_count++))
        fi
    done
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Results${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $failed_count -eq 0 ]; then
    echo -e "${GREEN}🎉 All servers authenticated successfully!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  $failed_count server(s) failed authentication${NC}"
    exit 1
fi
