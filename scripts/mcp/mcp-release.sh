#!/usr/bin/env bash
# ZEAZ MCP FINAL RELEASE — Full pipeline orchestrator
set -o errexit -o nounset -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/_lib.sh"

STEPS=(
  "Inventory|mcp-discovery.sh"
  "Health Check|mcp-health-check.sh"
  "Auth Manager|mcp-auth-manager.sh"
  "Repair|mcp-repair.sh"
  "Health Retest|mcp-health-check.sh"
  "Generate Report|mcp-report.sh"
)

main() {
  ensure_dirs

  echo ""
  echo "╔══════════════════════════════════════════╗"
  echo "║     ZEAZ MCP FINAL RELEASE PIPELINE     ║"
  echo "╚══════════════════════════════════════════╝"
  echo ""

  local total="${#STEPS[@]}" idx=1 failures=0 name script

  for entry in "${STEPS[@]}"; do
    name="${entry%%|*}"
    script="${entry##*|}"
    echo ""
    echo "──────────────────────────────────────────"
    echo "  Step ${idx}/${total}: ${name}"
    echo "──────────────────────────────────────────"

    if bash "${SCRIPT_DIR}/${script}"; then
      echo "  ✅ ${name} — PASSED"
    else
      echo "  ❌ ${name} — FAILED"
      failures=$((failures + 1))
    fi
    idx=$((idx + 1))
  done

  print_results "$failures"
}

print_results() {
  local failures="$1"
  local health="${MCP_RUNTIME}/health.json"
  local score critical
  score="$(jq '.summary.score // 0' "$health" 2>/dev/null || echo 0)"
  critical="$(jq '.summary.critical // 0' "$health" 2>/dev/null || echo 0)"

  echo ""
  echo "╔══════════════════════════════════════════╗"
  echo "║     RELEASE RESULTS                      ║"
  echo "╚══════════════════════════════════════════╝"
  echo ""
  echo "  Health Score:  ${score}%"
  echo "  Critical:      ${critical}"
  echo "  Step failures: ${failures}"
  echo ""

  if [[ "$critical" -eq 0 && "$score" -ge 90 && "$failures" -eq 0 ]]; then
    echo "  ✅ RELEASE READY — All gates passed"
  elif [[ "$critical" -eq 0 && "$failures" -eq 0 ]]; then
    echo "  ⚠️  RELEASE CANDIDATE — Fix remaining issues for 90%+ score"
  else
    echo "  ❌ BLOCKED — Critical failures remain"
  fi

  echo ""
  echo "  Reports: ${MCP_REPORTS}/"
  echo "  Runtime: ${MCP_RUNTIME}/"
  echo ""
}

main "$@"
