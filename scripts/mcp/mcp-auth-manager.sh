#!/usr/bin/env bash
# MCP Auth Manager — Validate and provision credentials for MCP servers
set -o errexit -o nounset -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/_lib.sh"

HEALTH="${MCP_RUNTIME}/health.json"

main() {
  ensure_dirs

  if [[ ! -f "$HEALTH" ]]; then
    log "No health data — running health check first"
    "${SCRIPT_DIR}/mcp-health-check.sh"
  fi
  validate_json "$HEALTH"

  log "MCP Auth Manager — validating credentials"

  local name issues var_list var
  while IFS=' ' read -r name issues; do
    [[ -z "$name" ]] && continue

    # Extract missing_env:XXX tokens from the issues string
    var_list="$(echo "$issues" \
      | tr ' ' '\n' \
      | sed -n 's/^missing_env://p' \
      || true)"

    while IFS= read -r var; do
      [[ -z "$var" ]] && continue
      if resolve_env "$var"; then
        log "  ✓ ${name}: \${var} resolved"
      else
        warn "  ✗ ${name}: \${var} not set"
        prompt_value "$var" "Enter value for \${var}" || true
      fi
    done <<< "$var_list"

  done < <(jq -r '.servers | to_entries[] |
    select(.value.issues | test("missing_env")) |
    "\(.key) \(.value.issues)"
  ' "$HEALTH" 2>/dev/null || true)

  gen_auth_report
}

gen_auth_report() {
  local report="${MCP_REPORTS}/auth.md"
  local file_list file_count

  file_list="$(find "${MCP_AUTH_DIR}" -name '*.env' -type f 2>/dev/null | sort || true)"
  file_count="$(echo "$file_list" | wc -l)"

  cat > "$report" <<-REPORT
# MCP Auth Report

**Generated:** $(date)

---

## Auth Files

${file_list}

**Files found:** ${file_count}

---

## Quick Start

To set environment variables:

1. Create a file in ~/.mcp-auth/ (e.g., stripe.env)
2. Add lines like: STRIPE_SECRET_KEY=sk_live_...
3. Source it: set -a; source ~/.mcp-auth/stripe.env; set +a

Or run this script interactively:
  bash scripts/mcp/mcp-auth-manager.sh
REPORT
  log "  Report → ${report}"
}

main "$@"
