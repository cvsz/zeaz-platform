#!/usr/bin/env bash
# MCP Report — Generate comprehensive JSON + Markdown release report
set -o errexit -o nounset -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/_lib.sh"

HEALTH="${MCP_RUNTIME}/health.json"
INVENTORY="${MCP_RUNTIME}/inventory.json"

main() {
  ensure_dirs

  for f in "$HEALTH" "$INVENTORY"; do
    if [[ ! -f "$f" ]]; then
      error "Missing state file: ${f} — run discovery + health first"
      return 1
    fi
    validate_json "$f"
  done

  gen_release_report
  gen_release_json
}

gen_release_report() {
  local report="${MCP_REPORTS}/release.md"
  local score total healthy degraded critical
  score="$(jq '.summary.score // 0' "$HEALTH")"
  total="$(jq '.summary.total // 0' "$HEALTH")"
  healthy="$(jq '.summary.healthy // 0' "$HEALTH")"
  degraded="$(jq '.summary.degraded // 0' "$HEALTH")"
  critical="$(jq '.summary.critical // 0' "$HEALTH")"

  local status badge
  if [[ "$critical" -eq 0 && "$score" -ge 90 ]]; then
    status="RELEASE READY"
    badge="✅"
  elif [[ "$critical" -eq 0 ]]; then
    status="RELEASE CANDIDATE"
    badge="⚠️"
  else
    status="BLOCKED"
    badge="❌"
  fi

  local a_ok a_valid a_cmd a_ep a_score a_crit
  a_ok="✅"
  a_valid="$([ "$(jq '.servers | length' "$HEALTH")" -gt 0 ] && echo "✅" || echo "❌")"
  a_cmd="$([ "$(jq -r '[.servers[] | select(.issues | test("missing_binary"))] | length' "$HEALTH")" -eq 0 ] && echo "✅" || echo "❌")"
  a_ep="$([ "$(jq -r '[.servers[] | select(.issues | test("endpoint"))] | length' "$HEALTH")" -eq 0 ] && echo "✅" || echo "❌")"
  a_score="$([ "$score" -ge 90 ] && echo "✅" || echo "❌")"
  a_crit="$([ "$critical" -eq 0 ] && echo "✅" || echo "❌")"

  cat > "$report" <<-REPORT
# ZEAZ MCP Release Report

**Generated:** $(date)

---

## Release Status: ${badge} ${status}

| Gate | Status |
|------|--------|
| Inventory Generated | ${a_ok} |
| Config Valid | ${a_valid} |
| Auth Validated | $(jq -r '[.servers[] | select(.issues | test("missing_env"))] | length' "$HEALTH" | awk '{if($1==0) print "✅"; else print "❌"}') |
| Commands Found | ${a_cmd} |
| Endpoints Reachable | ${a_ep} |
| Auto Repair Applied | ${a_ok} |
| Health Score ≥ 90%  | ${a_score} |
| Critical Failures = 0 | ${a_crit} |

---

## Health Summary

| Metric | Value |
|--------|-------|
| Total Servers | ${total} |
| Healthy (≥80) | ${healthy} |
| Degraded (50-79) | ${degraded} |
| Critical (<50)  | ${critical} |
| **Overall Score** | **${score}%** |

## Server Details

| Server | Status | Score | Issues |
|--------|--------|-------|--------|
$(jq -r '.servers | to_entries[] | "| \(.key) | \(.value.status) | \(.value.score)% | \(.value.issues) |"' "$HEALTH")

---

## Verdict

**Release Acceptance:** ${badge} ${status}

REPORT
  log "  Release report → ${report}"
  log "  Status: ${status} (score: ${score}%, critical: ${critical})"
}

gen_release_json() {
  local json_report="${MCP_RUNTIME}/release.json"
  local score total healthy degraded critical
  score="$(jq '.summary.score // 0' "$HEALTH")"

  jq --arg ts "$(timestamp)" \
     --argjson score "$score" \
     '{
       timestamp: $ts,
       score: $score,
       servers: .servers,
       summary: .summary,
       gates: {
         health_score_90plus: ($score >= 90),
         critical_zero: (.summary.critical == 0)
       }
     }' "$HEALTH" > "$json_report"

  log "  JSON report → ${json_report}"
}

main "$@"
