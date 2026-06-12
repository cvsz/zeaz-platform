#!/usr/bin/env bash
# MCP Repair — Auto-fix common MCP issues based on health report
set -o errexit -o nounset -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/_lib.sh"

HEALTH="${MCP_RUNTIME}/health.json"
REPAIR_LOG="${MCP_RUNTIME}/repair.json"

main() {
  ensure_dirs

  if [[ ! -f "$HEALTH" ]]; then
    log "No health data — running health check first"
    "${SCRIPT_DIR}/mcp-health-check.sh"
  fi
  validate_json "$HEALTH"

  local ts fixes=0
  ts="$(timestamp)"
  printf '{"repairs":[],"timestamp":"%s"}\n' "$ts" > "$REPAIR_LOG"

  log "MCP Repair — applying auto-fixes"

  # ── Fix 1: Missing npm packages ────────────────────────────────────────────
  local name pkg
  while IFS=' ' read -r name pkg; do
    [[ -z "$name" || -z "$pkg" ]] && continue
    log "  Repair: ${name} → installing ${pkg}"
    if npm install -g "${pkg}" 2>&1 | tail -1; then
      fixes=$((fixes + 1))
      log "  ✓ ${name}: installed ${pkg}"
    else
      warn "  ✗ ${name}: failed to install ${pkg}"
    fi
  done < <(jq -r '.servers | to_entries[] |
    select(.value.status == "degraded" or .value.status == "critical") |
    "\(.key) \(.value.npm_pkg // "")"
  ' "$HEALTH" 2>/dev/null | grep -v ' $' || true)

  # ── Fix 2: Version pin updates ────────────────────────────────────────────
  local config="$MCP_ROOT/.mcp.json"
  if grep -qF '"@playwright/mcp@0.0.70"' "$config" 2>/dev/null; then
    sed -i 's/"@playwright\/mcp@0\.0\.70"/"@playwright\/mcp@0.0.76"/g' "$config"
    fixes=$((fixes + 1))
    log "  ✓ playwright: pinned @0.0.76"
  fi
  if grep -qF '"@upstash/context7-mcp@2.1.8"' "$config" 2>/dev/null; then
    sed -i 's/"@upstash\/context7-mcp@2\.1\.8"/"@upstash\/context7-mcp@3.2.0"/g' "$config"
    fixes=$((fixes + 1))
    log "  ✓ context7: pinned @3.2.0"
  fi

  # ── Fix 3: Package renames (idempotent — only if old name exists) ──────────
  local home_cfg="${HOME}/.mcp.json"
  if [[ -f "$home_cfg" ]]; then
    if grep -qF '"@supabase/mcp-server"' "$home_cfg" 2>/dev/null \
       && ! grep -qF '"@supabase/mcp-server-postgrest"' "$home_cfg" 2>/dev/null; then
      sed -i 's/"@supabase\/mcp-server"/"@supabase\/mcp-server-postgrest"/g' "$home_cfg"
      fixes=$((fixes + 1))
      log "  ✓ ~/.mcp.json: supabase → postgrest"
    fi
  fi

  tmp="$(mktemp)"
  jq --argjson f "$fixes" '.repairs += [{"count":$f, "type":"auto_fix"}]' \
    "$REPAIR_LOG" > "$tmp" && mv "$tmp" "$REPAIR_LOG"

  gen_repair_report "$fixes"
  log "  Total fixes: ${fixes}"
}

gen_repair_report() {
  local fixes="$1" report="${MCP_REPORTS}/repair.md"
  cat > "$report" <<-REPORT
# MCP Repair Report

**Generated:** $(date)

---

## Auto-Repairs Applied

$(jq -r '.repairs[] | "- \(.count) × \(.type)"' "$REPAIR_LOG")

**Total fixes:** ${fixes}

---

## Manual Actions Required

$(jq -r '.servers | to_entries[] | select(.value.issues | test("missing_env")) |
  "- **\(.key)**: issues — \(.value.issues)"' "$HEALTH" 2>/dev/null)

---

REPORT
  log "  Report → ${report}"
}

main "$@"
