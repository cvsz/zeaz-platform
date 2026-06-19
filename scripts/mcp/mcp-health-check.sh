#!/usr/bin/env bash
# MCP Health Check — Validate every server's binary, npm package, env vars, endpoint
set -o errexit -o nounset -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/_lib.sh"

HEALTH="${MCP_RUNTIME}/health.json"

main() {
  ensure_dirs
  local inv="${MCP_RUNTIME}/inventory.json"
  if [[ ! -f "$inv" ]]; then
    log "No inventory found — running discovery first"
    "${SCRIPT_DIR}/mcp-discovery.sh"
  fi
  validate_json "$inv"

  printf '{"servers":{},"summary":{"total":0,"healthy":0,"degraded":0,"critical":0,"score":100}}\n' \
    > "$HEALTH"

  log "MCP Health Check — validating all servers"

  local server name cmd args url binary score status issues
  while IFS= read -r server; do
    [[ -z "$server" ]] && continue

    name="$(echo "$server" | jq -r '.name')"
    cmd="$(echo "$server"   | jq -r '.command')"
    args="$(echo "$server"  | jq -r '.args | join(" ")')"
    url="$(echo "$server"   | jq -r '.url')"

    score=100
    issues=""

    # ── Binary / command check (30 pts) ──────────────────────────────────────
    if [[ "$cmd" == "http" ]]; then
      binary="http-endpoint"
      # HTTP servers don't need a local binary; curl is the transport
    else
      binary="${cmd%% *}"
      if [[ -z "$binary" ]] || ! command -v "$binary" &>/dev/null; then
        score=$((score - 30))
        issues="${issues}missing_binary:${binary} "
      fi
    fi

    # ── npm package check (20 pts) ───────────────────────────────────────────
    local npx_pkg=""
    local token
    for token in $args; do
      if [[ "$token" == @*/* ]] || [[ "$token" == @* ]]; then
        npx_pkg="$token"
        break
      fi
    done
    if [[ -n "$npx_pkg" && "${MCP_OFFLINE:-0}" == "0" ]]; then
      if ! npm view "$npx_pkg" version &>/dev/null 2>&1; then
        score=$((score - 20))
        issues="${issues}missing_npm:${npx_pkg} "
      fi
    fi

    # ── Environment variable check (20 pts) ──────────────────────────────────
    local combined="${args} ${url}"
    local env_var var
    env_var="$(extract_env_refs "$combined")"
    while IFS= read -r var; do
      [[ -z "$var" ]] && continue
      if ! resolve_env "$var"; then
        score=$((score - 10))
        issues="${issues}missing_env:${var} "
      fi
    done <<< "$env_var"

    # ── Endpoint check (30 pts) — only for remote URLs ───────────────────────
    if [[ -n "$url" \
          && "$url" != *"local"* \
          && "$url" != *"localhost"* \
          && "$url" != *"0.0.0.0"* \
          && "${MCP_OFFLINE:-0}" == "0" ]]; then
      local http_code
      http_code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$url" 2>/dev/null || echo "timeout")"
      if [[ "$http_code" == "000" || "$http_code" == "timeout" ]]; then
        # Only penalise if we're sure it's not an auth-only failure
        if [[ "$http_code" == "timeout" ]]; then
          score=$((score - 30))
          issues="${issues}endpoint_timeout "
        fi
      fi
    fi

    # ── Status classification ────────────────────────────────────────────────
    if   [[ "$score" -ge 80 ]]; then status="healthy"
    elif [[ "$score" -ge 50 ]]; then status="degraded"
    else                             status="critical"
    fi

    local tmp
    tmp="$(mktemp)"
    jq \
      --arg n "$name" \
      --arg s "$status" \
      --argjson sc "$score" \
      --arg i "${issues%% }" \
      --arg b "$binary" \
      --arg p "${npx_pkg:-}" \
      '.servers[$n] = {"status":$s, "score":$sc, "issues":$i, "binary":$b, "npm_pkg":$p}' \
      "$HEALTH" > "$tmp" && mv "$tmp" "$HEALTH"

  done < <(jq -c '.configs[]' "$inv" 2>/dev/null || true)

  compute_summary
  gen_health_report
}

compute_summary() {
  local total healthy degraded critical avg_score tmp
  total="$(jq '.servers | length' "$HEALTH")"
  healthy="$(jq '[.servers[] | select(.status=="healthy")] | length' "$HEALTH")"
  degraded="$(jq '[.servers[] | select(.status=="degraded")] | length' "$HEALTH")"
  critical="$(jq '[.servers[] | select(.status=="critical")] | length' "$HEALTH")"
  avg_score="$(jq 'if (.servers | length) > 0 then ([.servers[].score] | add / length | floor) else 100 end' "$HEALTH")"

  tmp="$(mktemp)"
  jq \
    --argjson t "$total" \
    --argjson h "$healthy" \
    --argjson d "$degraded" \
    --argjson c "$critical" \
    --argjson s "$avg_score" \
    '.summary = {"total":$t, "healthy":$h, "degraded":$d, "critical":$c, "score":$s}' \
    "$HEALTH" > "$tmp" && mv "$tmp" "$HEALTH"

  log "  Score: ${avg_score}% | ✅ ${healthy} | ⚠️ ${degraded} | ❌ ${critical}"
}

gen_health_report() {
  local report="${MCP_REPORTS}/health.md"
  local total healthy degraded critical score
  total="$(jq '.summary.total' "$HEALTH")"
  healthy="$(jq '.summary.healthy' "$HEALTH")"
  degraded="$(jq '.summary.degraded' "$HEALTH")"
  critical="$(jq '.summary.critical' "$HEALTH")"
  score="$(jq '.summary.score' "$HEALTH")"

  cat > "$report" <<-REPORT
# MCP Health Report

**Generated:** $(date)

---

## Summary

| Metric | Count |
|--------|-------|
| Total Servers | ${total} |
| Healthy (≥80) | ${healthy} |
| Degraded (50-79) | ${degraded} |
| Critical (<50)  | ${critical} |
| **Score**       | **${score}%** |

## Per-Server

$(jq -r '.servers | to_entries[] | "- **\(.key)**: \(.value.status) (score: \(.value.score)%) \(.value.issues)"' "$HEALTH")

---

REPORT
  log "  Report → ${report}"
}

main "$@"
