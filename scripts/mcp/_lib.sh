#!/usr/bin/env bash
# Shared MCP Release library — logging, validation, helpers
# Source: scripts/mcp/_lib.sh
set -o errexit -o nounset -o pipefail

MCP_ROOT="${MCP_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
readonly MCP_ROOT
MCP_RUNTIME="${MCP_RUNTIME:-${MCP_ROOT}/runtime/mcp}"
MCP_REPORTS="${MCP_REPORTS:-${MCP_ROOT}/reports/mcp}"
MCP_AUTH_DIR="${MCP_AUTH_DIR:-${HOME}/.mcp-auth}"

# ── Logging ──────────────────────────────────────────────────────────────────
log()  { echo "  [INFO]  $*"; }
warn() { echo "  [WARN]  $*" >&2; }
error(){ echo "  [ERROR] $*" >&2; }

# ── Bootstrap directories ────────────────────────────────────────────────────
ensure_dirs() {
  mkdir -p "${MCP_RUNTIME}" "${MCP_REPORTS}" "${MCP_AUTH_DIR}"
}

# ── jq validation — fail early if JSON is malformed ──────────────────────────
validate_json() {
  local file="$1"
  if ! jq empty "${file}" 2>/dev/null; then
    error "Malformed JSON: ${file}"
    return 1
  fi
}

# ── Interactive prompt with non-interactive guard ────────────────────────────
prompt_value() {
  local var_name="$1" prompt_text="${2:-Enter value for \$${1}}"
  if [[ "${ZEAZ_NONINTERACTIVE:-0}" != "0" ]]; then
    warn "Non-interactive mode; cannot set \$${var_name}"
    return 1
  fi
  local val
  read -rp "  ${prompt_text}: " val
  if [[ -n "$val" ]]; then
    echo "${var_name}=${val}" >> "${MCP_AUTH_DIR}/_manual.env"
    log "Saved \$${var_name} to ~/.mcp-auth/_manual.env"
    return 0
  fi
  return 1
}

# ── Check environment variable across env / auth files ───────────────────────
resolve_env() {
  local var="$1"
  if printenv "${var}" &>/dev/null; then
    return 0
  fi
  local f
  for f in "${MCP_AUTH_DIR}"/*.env; do
    [[ -f "$f" ]] || continue
    if grep -q "^${var}=" "$f" 2>/dev/null; then
      return 0
    fi
  done
  return 1
}

# ── Extract env var refs from a string like "foo ${BAR} baz" ─────────────────
extract_env_refs() {
  local input="$1"
  # shellcheck disable=SC2016  # We intentionally keep ${...} as literal for sed
  echo "$input" \
    | grep -o '\${[^}]*}' \
    | sed 's/\${//;s/}//' \
    || true
}

# ── Generate timestamp ───────────────────────────────────────────────────────
timestamp() {
  date -u '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -u '+%Y-%m-%dT%H:%M:%SZ'
}
