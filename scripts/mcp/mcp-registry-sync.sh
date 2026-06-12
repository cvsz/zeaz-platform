#!/usr/bin/env bash
# MCP Registry Sync — Sync all MCP configurations to a shared registry
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT/scripts/mcp/_lib.sh"
REGISTRY="$ROOT/runtime/mcp/registry.json"
INVENTORY="$ROOT/runtime/mcp/inventory.json"
HEALTH="$ROOT/runtime/mcp/health.json"
STATE="$ROOT/runtime/mcp/state.json"

log "MCP Registry Sync — building unified registry"

# Build unified registry from all sources
jq -n \
  --slurpfile inv "$INVENTORY" \
  --slurpfile health "$HEALTH" \
  '{
    "version": "1.0.0",
    "updated": (if $inv[0].timestamp then $inv[0].timestamp else (now | strftime("%Y-%m-%dT%H:%M:%SZ")) end),
    "servers": (
      [$inv[0].configs[] | {key: .name, value: .}] | from_entries
    ),
    "health": (if $health[0].servers then $health[0].servers else {} end),
    "summary": (if $health[0].summary then $health[0].summary else {} end),
    "metadata": {
      "global_packages": (if $inv[0].global then $inv[0].global else [] end),
      "total_servers": ($inv[0].configs | length),
      "total_global": ($inv[0].global | length)
    }
  }' > "$REGISTRY"

log "  Registry → $REGISTRY"
log "  Total: $(jq '.metadata.total_servers' "$REGISTRY") servers, $(jq '.metadata.total_global' "$REGISTRY") global packages"

# Generate state.json for shared use
jq '{registry: ., last_sync: (now | strftime("%Y-%m-%dT%H:%M:%SZ"))}' "$REGISTRY" > "$STATE"
log "  State  → $STATE"
