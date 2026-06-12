#!/usr/bin/env bash
# ZEAZ MCP Phase 3 — Auto-Healer
# Parse real config → Detect issues → Generate report → Auto-fix
set -Eeuo pipefail

ROOT="${HOME}/mcp-phase3"
REPORT_DIR="${ROOT}/reports"
FIX_DIR="${ROOT}/fixes"
mkdir -p "$ROOT" "$REPORT_DIR" "$FIX_DIR"

MCP_CONFIGS=()
for f in "$HOME/.mcp.json" "/home/zeazdev/zeaz-platform/.mcp.json"; do
  [ -f "$f" ] && MCP_CONFIGS+=("$f")
done
AUTH_DIR="${HOME}/.mcp-auth"
GLOBAL_LIST=$(mktemp)

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'

log()    { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()   { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()  { echo -e "${RED}[ERROR]${NC} $*"; }
header() { echo -e "${CYAN}$*${NC}"; }
section() {
  echo
  echo -e "${BLUE}══════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $*${NC}"
  echo -e "${BLUE}══════════════════════════════════════════════${NC}"
}

ISSUES=0
FIXES=0

# ─── Phase 3a: Inventory ────────────────────────────────────────

inventory_global_packages() {
  section "3a: INVENTORY — Global MCP Packages"

  npm ls -g --depth=0 2>/dev/null | grep mcp > "$GLOBAL_LIST" || true

  while IFS= read -r line; do
    local pkg
    pkg=$(echo "$line" | sed -n 's/├── //; s/└── //; s/@[0-9].*//p')
    local ver
    ver=$(echo "$line" | sed -n 's/.*@//p')
    echo "$pkg@$ver"
  done < "$GLOBAL_LIST"

  log "$(wc -l < "$GLOBAL_LIST") global MCP packages found"
}

inventory_env_vars() {
  section "3a: INVENTORY — Auth Files"

  for f in "$AUTH_DIR"/*.env; do
    [ -f "$f" ] || continue
    local name; name=$(basename "$f" .env)
    local count; count=$(grep -c '=' "$f" 2>/dev/null || echo 0)
    log "$name: $count vars"
  done
}

# ─── Phase 3b: Parse & Analyze ──────────────────────────────────

analyze_mcp_configs() {
  section "3b: ANALYSIS — MCP Server Health"

  for config in "${MCP_CONFIGS[@]}"; do
    header "Config: $config"

    if ! jq . "$config" >/dev/null 2>&1; then
      error "Invalid JSON"
      ISSUES=$((ISSUES+1))
      continue
    fi

    jq -c '.mcpServers // .servers // {} | to_entries[]' "$config" 2>/dev/null | while IFS= read -r entry; do
      local name; name=$(echo "$entry" | jq -r '.key')
      local cmd; cmd=$(echo "$entry" | jq -r '.value.command // .value.type // "unknown"')
      local args; args=$(echo "$entry" | jq -r '.value.args // [] | join(" ")' 2>/dev/null || echo "")
      local url; url=$(echo "$entry" | jq -r '.value.url // ""')

      printf "  %-25s " "$name"

      # 1. Check binary
      local binary="${cmd%% *}"
      if ! command -v "$binary" &>/dev/null && [[ "$binary" != "http" ]]; then
        warn "✗ binary '$binary' not found"
        ISSUES=$((ISSUES+1))
        continue
      fi

      # 2. Check npm package exists in registry
      local npx_pkg=""
      if [[ "$args" == *@*/* ]]; then
        npx_pkg=$(echo "$args" | grep -o '@[^ ]*' | head -1)
      fi

      if [ -n "$npx_pkg" ]; then
        if npm view "$npx_pkg" version >/dev/null 2>&1; then
          log "✓ npm package $npx_pkg exists"
        else
          error "✗ npm package $npx_pkg NOT FOUND in registry"
          ISSUES=$((ISSUES+1))
          continue
        fi
      fi

      # 3. Check env var references
      local env_refs
      env_refs=$(echo "$entry" | grep -o '\${[^}]*}' | sed 's/\${//;s/}//' || true)
      if [ -n "$env_refs" ]; then
        for var in $env_refs; do
          local val; val=$(printenv "$var" 2>/dev/null || echo "")
          if [ -z "$val" ]; then
            val=$(grep "^$var=" "$AUTH_DIR"/*.env 2>/dev/null | head -1 | cut -d= -f2- || echo "")
          fi
          if [ -z "$val" ]; then
            warn "✗ env var \${$var} is empty/unset"
            ISSUES=$((ISSUES+1))
          else
            log "✓ env \${$var} is set"
          fi
        done
      fi

      # 4. Check HTTP endpoint for remote servers
      if [ -n "$url" ] && [[ "$cmd" == "http" ]]; then
        local http_code
        http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "timeout")
        if [[ "$http_code" == "000" || "$http_code" == "timeout" ]]; then
          warn "✗ endpoint $url unreachable"
          ISSUES=$((ISSUES+1))
        else
          log "✓ endpoint responds $http_code"
        fi
      fi

      echo ""
    done
  done
}

# ─── Phase 3c: Detect Unused Packages ────────────────────────────

detect_unused_packages() {
  section "3c: ANALYSIS — Dead Weight Detection"

  local all_pkgs
  all_pkgs=$(cat "$GLOBAL_LIST" | sed -n 's/.*├── //; s/.*└── //; s/@[0-9].*//p')

  for config in "${MCP_CONFIGS[@]}"; do
    [ -f "$config" ] || continue
    local configured_pkgs
    configured_pkgs=$(jq '[.mcpServers // .servers // {} | .. | strings | select(startswith("@"))] | unique[]' "$config" 2>/dev/null || echo "")

    while IFS= read -r pkg; do
      [ -z "$pkg" ] && continue
      local pkg_name; pkg_name=$(echo "$pkg" | tr -d ' ')
      if ! echo "$configured_pkgs" | grep -q "$pkg_name"; then
        warn "UNUSED: $pkg_name (installed globally, no config uses it)"
        ISSUES=$((ISSUES+1))
      fi
    done <<< "$all_pkgs"
  done
}

# ─── Phase 3d: Auto-Fix ─────────────────────────────────────────

auto_fix_package_pin() {
  local server="$1"
  local old_ver="$2"
  local new_ver="$3"
  local config="$4"

  if [[ "$old_ver" == "$new_ver" ]]; then
    log "  → $server already at $new_ver"
    return
  fi

  sed -i "s/$old_ver/$new_ver/g" "$config"
  log "  → $server: $old_ver → $new_ver"
  FIXES=$((FIXES+1))
}

auto_fix_mcp_config() {
  section "3d: AUTO-FIX"

  local repo_config="/home/zeazdev/zeaz-platform/.mcp.json"

  if [ ! -f "$repo_config" ]; then
    warn "No repo config found"
    return
  fi

  header "Playwright version pin (0.0.70 → 0.0.76)"
  auto_fix_package_pin "playwright" "@playwright/mcp@0.0.70" "@playwright/mcp@0.0.76" "$repo_config"

  header "Stripe — add note about missing STRIPE_SECRET_KEY"
  warn "Cannot auto-fix: STRIPE_SECRET_KEY must be set manually"

  header "Cloudflare logs — add note about missing CLOUDFLARE_AUDIT_TOKEN"
  warn "Cannot auto-fix: CLOUDFLARE_AUDIT_TOKEN must be set manually or remove server"
}

# ─── Phase 3e: Generate Report ──────────────────────────────────

generate_report() {
  section "3e: REPORT"

  local report
  report="${REPORT_DIR}/mcp-health-$(date +%F-%H%M).md"

  cat > "$report" <<EOF
# ZEAZ MCP Health Report

**Generated:** $(date)
**Config files:** ${MCP_CONFIGS[*]}
**Auth dir:** $AUTH_DIR

---

## Summary

| Metric | Value |
|--------|-------|
| MCP Servers Defined | $(for f in "${MCP_CONFIGS[@]}"; do jq '[.mcpServers // .servers // {} | length]' "$f" 2>/dev/null; done | paste -sd+) |
| Issues Found | $ISSUES |
| Auto-Fixes Applied | $FIXES |
| Global MCP Packages | $(wc -l < "$GLOBAL_LIST") |

## Server Health

EOF

  for config in "${MCP_CONFIGS[@]}"; do
    echo "### $(basename "$config")" >> "$report"
    jq -r '.mcpServers // .servers // {} | to_entries[] | "- **\(.key)** → \(.value.command // .value.type // "unknown") \(.value.args // [] | join(" "))"' "$config" 2>/dev/null >> "$report"
    echo "" >> "$report"
  done

  cat >> "$report" <<EOF
## Issues

$(jq -c '.mcpServers // .servers // {} | to_entries[]' /home/zeazdev/zeaz-platform/.mcp.json 2>/dev/null | while IFS= read -r e; do
  name=$(echo "$e" | jq -r '.key')
  cmd=$(echo "$e" | jq -r '.value.command // .value.type // "?"')
  args=$(echo "$e" | jq -r '.value.args // [] | join(" ")' 2>/dev/null)
  echo "- **$name**: \`$cmd $args\`"
done)

## Recommendations

$(for f in "${MCP_CONFIGS[@]}"; do
  jq -r '.mcpServers // .servers // {} | to_entries[] |
    "1. **\(.key)**: \(
      if .value.command == null or .value.command == "" then "Verify command/type field"
      elif .value.args // [] | length == 0 then "Add args if using npx"
      else "OK"
    end
    )"' "$f" 2>/dev/null
done)
EOF

  log "Report → $report"
}

# ─── Main ───────────────────────────────────────────────────────

main() {
  echo ""
  echo "╔══════════════════════════════════════════╗"
  echo "║   ZEAZ MCP Phase 3 — Auto-Healer        ║"
  echo "╚══════════════════════════════════════════╝"
  echo ""

  inventory_global_packages
  inventory_env_vars
  analyze_mcp_configs
  detect_unused_packages
  auto_fix_mcp_config
  generate_report

  section "FINAL SUMMARY"
  echo "  Issues found:  $ISSUES"
  echo "  Auto-fixes:    $FIXES"
  echo "  Report:        $REPORT_DIR/"

  if [ "$ISSUES" -eq 0 ] && [ "$FIXES" -eq 0 ]; then
    log "Everything healthy!"
  fi
  echo ""
}

main "$@"
