#!/usr/bin/env bash
# MCP Discovery — Inventory local, npm, and configured MCP servers
set -o errexit -o nounset -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/_lib.sh"

MCP_CONFIGS=("${HOME}/.mcp.json" "${MCP_ROOT}/.mcp.json")
INVENTORY="${MCP_RUNTIME}/inventory.json"

main() {
  ensure_dirs

  local ts
  ts="$(timestamp)"
  printf '{"configs":[],"global":[],"timestamp":"%s"}\n' "$ts" > "$INVENTORY"
  log "MCP Discovery — scanning all sources"

  local cfg tmp sv_tmp entry_count
  for cfg in "${MCP_CONFIGS[@]}"; do
    [[ -f "$cfg" ]] || continue
    validate_json "$cfg" || continue

    # Gather both mcpServers (npx) and servers (HTTP) top-level keys
    sv_tmp="$(mktemp)"
    jq -c '
      (.mcpServers // {}) as $ms
      | (.servers // {}) as $s
      | ($ms + $s) | to_entries[]
      | {name: .key,
         command: (.value.command // .value.type // ""),
         args:   (.value.args // []),
         url:    (.value.url // ""),
         source: "'"$cfg"'"}
    ' "$cfg" 2>/dev/null | jq -s '.' > "$sv_tmp" || true

    entry_count="$(jq 'length' "$sv_tmp")"
    tmp="$(mktemp)"
    jq --slurpfile sv "$sv_tmp" '.configs += $sv[0]' \
      "$INVENTORY" > "$tmp" && mv "$tmp" "$INVENTORY"
    rm -f "$sv_tmp"
    log "  ✓ $(basename "$cfg"): ${entry_count} servers"
  done

  # Scan global npm packages for MCP-related ones
  local global_json pkg name
  global_json="[]"
  while IFS= read -r pkg; do
    [[ -z "$pkg" ]] && continue
    name="${pkg%@*}"
    global_json="$(
      echo "$global_json" \
      | jq --arg n "$name" '. + [{"name": $n, "source": "global"}]'
    )"
  done < <(npm ls -g --depth=0 2>/dev/null \
           | grep -i mcp \
           | sed -n 's/.*[─└][─ ]//p' || true)

  tmp="$(mktemp)"
  jq --argjson gl "$global_json" '.global = $gl' "$INVENTORY" > "$tmp" \
    && mv "$tmp" "$INVENTORY"

  gen_inventory_report
  log "  State  → ${INVENTORY}"
  log "  Servers: $(jq '.configs | length' "$INVENTORY"), Global: $(jq '.global | length' "$INVENTORY")"
}

gen_inventory_report() {
  local report="${MCP_REPORTS}/inventory.md"
  local configs_found server_count global_count
  configs_found="${#MCP_CONFIGS[@]}"
  server_count="$(jq '.configs | length' "$INVENTORY")"
  global_count="$(jq '.global | length' "$INVENTORY")"

  cat > "$report" <<-REPORT
# MCP Inventory Report

**Generated:** $(date)

---

## Configured Servers

$(jq -r '.configs[] | "- **\(.name)** → `\(.command) \(.args | join(" "))`"' "$INVENTORY")

## Global Packages

$(jq -r '.global[] | "- \(.name)"' "$INVENTORY")

---

**Configs scanned:** ${configs_found}
**Servers found:** ${server_count}
**Global MCP packages:** ${global_count}
REPORT
  log "  Report → ${report}"
}

main "$@"
