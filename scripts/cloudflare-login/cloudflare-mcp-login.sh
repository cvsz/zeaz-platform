#!/bin/bash

# Cloudflare MCP Automated Login Script
# Logs in to all Cloudflare MCP servers

set -e

echo "🔐 Starting Cloudflare MCP Server Login..."
echo ""

# Array of MCP servers to authenticate
servers=(
    "cloudflare"
    "cloudflare-bindings"
    "cloudflare-builds"
    "cloudflare-observability"
)

failed=()
succeeded=()

for server in "${servers[@]}"; do
    echo "⏳ Logging in to $server..."
    
    if codex mcp login "$server"; then
        succeeded+=("$server")
        echo "✅ Successfully logged in to $server"
    else
        failed+=("$server")
        echo "❌ Failed to login to $server"
    fi
    
    echo ""
done

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Login Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ${#succeeded[@]} -gt 0 ]; then
    echo "✅ Succeeded (${#succeeded[@]}):"
    for server in "${succeeded[@]}"; do
        echo "   - $server"
    done
fi

if [ ${#failed[@]} -gt 0 ]; then
    echo "❌ Failed (${#failed[@]}):"
    for server in "${failed[@]}"; do
        echo "   - $server"
    done
    echo ""
    echo "⚠️  Some servers failed. Check your credentials and try again."
    exit 1
fi

echo ""
echo "🎉 All Cloudflare MCP servers successfully authenticated!"
