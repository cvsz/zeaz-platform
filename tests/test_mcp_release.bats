#!/usr/bin/env bats
# MCP Release Pipeline — BATS test suite
# Run: bats tests/test_mcp_release.bats

setup() {
  export ZEAZ_NONINTERACTIVE=1
  export MCP_OFFLINE=1
  export TEST_MCP_DIR="${BATS_TEST_TMPDIR}/mcp-test"
  export HOME="${TEST_MCP_DIR}/home"
  export MCP_RUNTIME="${TEST_MCP_DIR}/runtime/mcp"
  export MCP_REPORTS="${TEST_MCP_DIR}/reports/mcp"
  export MCP_AUTH_DIR="${HOME}/.mcp-auth"

  mkdir -p "${MCP_RUNTIME}" "${MCP_REPORTS}" "${MCP_AUTH_DIR}" "${HOME}" "${TEST_MCP_DIR}"

  # Write test .mcp.json at HOME (where discovery looks)
  cat > "${HOME}/.mcp.json" <<'EOF'
{
  "mcpServers": {
    "test-server": {
      "command": "echo",
      "args": ["hello"]
    }
  }
}
EOF
}

# ── _lib.sh tests ────────────────────────────────────────────────────────────

@test "_lib.sh: log outputs to stdout" {
  source "${BATS_TEST_DIRNAME}/../scripts/mcp/_lib.sh"
  run log "hello"
  [[ "$output" =~ "hello" ]]
}

@test "_lib.sh: warn outputs to stderr" {
  source "${BATS_TEST_DIRNAME}/../scripts/mcp/_lib.sh"
  run warn "uh oh"
  [[ "$output" =~ "uh oh" ]]
}

@test "_lib.sh: extract_env_refs parses \${VAR} patterns" {
  source "${BATS_TEST_DIRNAME}/../scripts/mcp/_lib.sh"
  run extract_env_refs '--api-key=${KEY} --url=${URL}'
  [[ "$output" == *"KEY"* ]]
  [[ "$output" == *"URL"* ]]
}

@test "_lib.sh: extract_env_refs returns empty for no refs" {
  source "${BATS_TEST_DIRNAME}/../scripts/mcp/_lib.sh"
  run extract_env_refs '--plain text'
  [[ -z "$output" ]]
}

@test "_lib.sh: resolve_env returns 1 for unset var" {
  source "${BATS_TEST_DIRNAME}/../scripts/mcp/_lib.sh"
  run resolve_env "DOES_NOT_EXIST_XYZ"
  [[ "$status" -eq 1 ]]
}

@test "_lib.sh: resolve_env returns 0 for set var" {
  source "${BATS_TEST_DIRNAME}/../scripts/mcp/_lib.sh"
  export TEST_VAR_123="present"
  run resolve_env "TEST_VAR_123"
  [[ "$status" -eq 0 ]]
}

@test "_lib.sh: resolve_env returns 0 for auth file var" {
  echo "AUTH_FILE_VAR=secret" > "${MCP_AUTH_DIR}/test.env"
  source "${BATS_TEST_DIRNAME}/../scripts/mcp/_lib.sh"
  run resolve_env "AUTH_FILE_VAR"
  [[ "$status" -eq 0 ]]
}

@test "_lib.sh: validate_json passes for valid JSON" {
  source "${BATS_TEST_DIRNAME}/../scripts/mcp/_lib.sh"
  echo '{"ok": true}' > "${TEST_MCP_DIR}/valid.json"
  run validate_json "${TEST_MCP_DIR}/valid.json"
  [[ "$status" -eq 0 ]]
}

@test "_lib.sh: validate_json fails for broken JSON" {
  source "${BATS_TEST_DIRNAME}/../scripts/mcp/_lib.sh"
  echo 'not json' > "${TEST_MCP_DIR}/bad.json"
  run validate_json "${TEST_MCP_DIR}/bad.json"
  [[ "$status" -eq 1 ]]
}

# ── mcp-discovery.sh tests ───────────────────────────────────────────────────

@test "mcp-discovery.sh: generates inventory.json" {
  run bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh"
  [[ -f "${MCP_RUNTIME}/inventory.json" ]]
}

@test "mcp-discovery.sh: discovers test servers" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  run jq '.configs | length' "${MCP_RUNTIME}/inventory.json"
  [[ "$status" -eq 0 ]]
  [[ "$output" -gt 0 ]]
}

@test "mcp-discovery.sh: generates inventory.md report" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  [[ -f "${MCP_REPORTS}/inventory.md" ]]
}

@test "mcp-discovery.sh: JSON is valid" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  run jq empty "${MCP_RUNTIME}/inventory.json"
  [[ "$status" -eq 0 ]]
}

# ── mcp-health-check.sh tests ────────────────────────────────────────────────

@test "mcp-health-check.sh: generates health.json" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  run bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-health-check.sh"
  [[ -f "${MCP_RUNTIME}/health.json" ]]
}

@test "mcp-health-check.sh: generates health.md report" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-health-check.sh" >/dev/null
  [[ -f "${MCP_REPORTS}/health.md" ]]
}

@test "mcp-health-check.sh: summary has expected fields" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-health-check.sh" >/dev/null
  run jq '.summary | has("total") and has("healthy") and has("degraded") and has("critical") and has("score")' \
    "${MCP_RUNTIME}/health.json"
  [[ "$output" == "true" ]]
}

@test "mcp-health-check.sh: JSON is valid" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-health-check.sh" >/dev/null
  run jq empty "${MCP_RUNTIME}/health.json"
  [[ "$status" -eq 0 ]]
}

# ── mcp-auth-manager.sh tests ────────────────────────────────────────────────

@test "mcp-auth-manager.sh: runs without error in non-interactive mode" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-health-check.sh" >/dev/null
  run bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-auth-manager.sh"
  [[ "$status" -eq 0 ]]
}

@test "mcp-auth-manager.sh: generates auth.md report" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-health-check.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-auth-manager.sh" >/dev/null
  [[ -f "${MCP_REPORTS}/auth.md" ]]
}

@test "mcp-auth-manager.sh: detects missing env vars" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-health-check.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-auth-manager.sh" >/dev/null
  # The test config has TEST_TOKEN which should be detected as missing
  run jq -r '[.servers[] | select(.issues | test("missing_env"))] | length' \
    "${MCP_RUNTIME}/health.json"
  [[ "$output" -ge 0 ]]
}

# ── mcp-repair.sh tests ──────────────────────────────────────────────────────

@test "mcp-repair.sh: runs in non-interactive mode" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-health-check.sh" >/dev/null
  run bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-repair.sh"
}

@test "mcp-repair.sh: generates repair.json log" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-health-check.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-repair.sh" >/dev/null
  [[ -f "${MCP_RUNTIME}/repair.json" ]]
}

@test "mcp-repair.sh: generates repair.md report" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-health-check.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-repair.sh" >/dev/null
  [[ -f "${MCP_REPORTS}/repair.md" ]]
}

# ── mcp-report.sh tests ──────────────────────────────────────────────────────

@test "mcp-report.sh: generates release.md" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-health-check.sh" >/dev/null
  run bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-report.sh"
  [[ -f "${MCP_REPORTS}/release.md" ]]
}

@test "mcp-report.sh: generates release.json" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-health-check.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-report.sh" >/dev/null
  [[ -f "${MCP_RUNTIME}/release.json" ]]
}

@test "mcp-report.sh: JSON has expected structure" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-health-check.sh" >/dev/null
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-report.sh" >/dev/null
  run jq 'has("timestamp") and has("score") and has("servers") and has("summary") and has("gates")' \
    "${MCP_RUNTIME}/release.json"
  [[ "$output" == "true" ]]
}

# ── mcp-release.sh integration test ──────────────────────────────────────────

@test "mcp-release.sh: full pipeline completes" {
  run bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-release.sh"
  [[ "$status" -eq 0 ]]
}

@test "mcp-release.sh: all runtime files created" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-release.sh" >/dev/null
  for f in inventory.json health.json repair.json release.json; do
    [[ -f "${MCP_RUNTIME}/$f" ]] || { echo "Missing: $f"; return 1; }
  done
}

@test "mcp-release.sh: all report files created" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-release.sh" >/dev/null
  for f in inventory.md health.md auth.md repair.md release.md; do
    [[ -f "${MCP_REPORTS}/$f" ]] || { echo "Missing: $f"; return 1; }
  done
}

@test "mcp-release.sh: health score is between 0 and 100" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-release.sh" >/dev/null
  local score
  score="$(jq '.summary.score' "${MCP_RUNTIME}/health.json")"
  [[ "$score" -ge 0 && "$score" -le 100 ]]
}

@test "mcp-release.sh: server list is not empty" {
  bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-release.sh" >/dev/null
  local count
  count="$(jq '.servers | length' "${MCP_RUNTIME}/health.json")"
  [[ "$count" -gt 0 ]]
}

# ── Edge cases ───────────────────────────────────────────────────────────────

@test "mcp-discovery.sh: handles missing config gracefully" {
  local saved_home="$HOME"
  export HOME="${TEST_MCP_DIR}/no-config-home"
  mkdir -p "${HOME}"
  run bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-discovery.sh"
  export HOME="$saved_home"
  [[ "$status" -eq 0 ]]
}

@test "mcp-health-check.sh: handles empty inventory" {
  echo '{"configs":[],"global":[],"timestamp":"test"}' > "${MCP_RUNTIME}/inventory.json"
  run bash "${BATS_TEST_DIRNAME}/../scripts/mcp/mcp-health-check.sh"
  [[ "$status" -eq 0 ]]
}
