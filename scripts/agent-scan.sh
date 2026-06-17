#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

MODE="${AGENT_SCAN_MODE:-repo-skills}"
OUTPUT_JSON=false
ARTIFACT_DIR="${ARTIFACT_DIR:-artifacts/agent-scan}"
STORAGE_FILE="${AGENT_SCAN_STORAGE_FILE:-${HOME}/.mcp-scan}"
DANGEROUS_MCP=false
PRINT_ERRORS=false
VERBOSE=false
EXTRA_ARGS=()

log() { printf '{"ts":"%s","level":"info","script":"agent-scan","msg":"%s"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1"; }
warn() { printf '{"ts":"%s","level":"warn","script":"agent-scan","msg":"%s"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" >&2; }
err() { printf '{"ts":"%s","level":"error","script":"agent-scan","line":%s,"cmd":"%s"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" "$2" >&2; }
trap 'err "$LINENO" "$BASH_COMMAND"' ERR

load_snyk_token_from_env_file() {
  local env_file="$1"
  local line value

  [[ -f "$env_file" ]] || return 1
  line="$(grep -m1 '^SNYK_TOKEN=' "$env_file" || true)"
  [[ -n "$line" ]] || return 1

  value="${line#SNYK_TOKEN=}"
  value="${value%$'\r'}"

  if [[ "${value:0:1}" == '"' && "${value: -1}" == '"' ]]; then
    value="${value:1:${#value}-2}"
  elif [[ "${value:0:1}" == "'" && "${value: -1}" == "'" ]]; then
    value="${value:1:${#value}-2}"
  fi

  [[ -n "$value" ]] || return 1
  export SNYK_TOKEN="$value"
  return 0
}

usage() {
  cat <<'USAGE'
Usage: scripts/agent-scan.sh [options] [-- extra snyk-agent-scan args]

Run Snyk Agent Scan against repo-local or user-level agent surfaces.

Modes:
  repo-skills   Scan repo-local skills only (default, no MCP execution risk)
  repo          Scan repo-local skills plus .codex/config.toml when present
  home          Scan ~/.codex and ~/.agents skill/config surfaces
  auto          Let snyk-agent-scan auto-discover everything on this machine

Options:
  --mode MODE                   One of: repo-skills, repo, home, auto
  --json                        Write JSON output to artifacts/agent-scan/report.json
  --artifact-dir DIR            Directory for generated output artifacts
  --storage-file FILE           Override agent-scan state storage file
  --dangerously-run-mcp-servers Pass through the upstream non-interactive MCP flag
  --print-errors                Show detailed upstream scanner errors
  --verbose                     Enable verbose upstream logging
  -h, --help                    Show this help

Environment:
  SNYK_TOKEN                    Required by the upstream scanner
  AGENT_SCAN_MODE               Default mode when --mode is omitted
  ARTIFACT_DIR                  Default artifact directory
  AGENT_SCAN_STORAGE_FILE       Default storage file

Notes:
  - Upstream recommends `uvx snyk-agent-scan@latest` and requires `SNYK_TOKEN`.
  - Scanning MCP configuration can execute configured MCP server commands.
  - Use repo-skills mode first; move to repo/home/auto only after reviewing MCP commands.
USAGE
}

while (($#)); do
  case "$1" in
    --mode)
      MODE="${2:?missing value for --mode}"
      shift 2
      ;;
    --json)
      OUTPUT_JSON=true
      shift
      ;;
    --artifact-dir)
      ARTIFACT_DIR="${2:?missing value for --artifact-dir}"
      shift 2
      ;;
    --storage-file)
      STORAGE_FILE="${2:?missing value for --storage-file}"
      shift 2
      ;;
    --dangerously-run-mcp-servers)
      DANGEROUS_MCP=true
      shift
      ;;
    --print-errors)
      PRINT_ERRORS=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      EXTRA_ARGS+=("$@")
      break
      ;;
    *)
      EXTRA_ARGS+=("$1")
      shift
      ;;
  esac
done

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -z "${SNYK_TOKEN:-}" ]] && load_snyk_token_from_env_file "${PROJECT_ROOT}/.env"; then
  log "loaded SNYK_TOKEN from .env"
fi

if [[ -z "${SNYK_TOKEN:-}" ]]; then
  warn "SNYK_TOKEN is not set; Agent Scan cannot authenticate. Export SNYK_TOKEN or add it to .env first."
  exit 2
fi

case "$MODE" in
  repo-skills|repo|home|auto) ;;
  *)
    warn "unsupported mode: ${MODE}"
    usage >&2
    exit 1
    ;;
esac

if command -v snyk-agent-scan >/dev/null 2>&1; then
  RUNNER=(snyk-agent-scan)
else
  RUNNER=(uvx snyk-agent-scan@latest)
fi

TARGETS=()

case "$MODE" in
  repo-skills)
    [[ -d "${PROJECT_ROOT}/.agents/skills" ]] && TARGETS+=("${PROJECT_ROOT}/.agents/skills")
    ;;
  repo)
    [[ -d "${PROJECT_ROOT}/.agents/skills" ]] && TARGETS+=("${PROJECT_ROOT}/.agents/skills")
    [[ -f "${PROJECT_ROOT}/.codex/config.toml" ]] && TARGETS+=("${PROJECT_ROOT}/.codex/config.toml")
    ;;
  home)
    [[ -d "${HOME}/.agents/skills" ]] && TARGETS+=("${HOME}/.agents/skills")
    [[ -d "${HOME}/.codex/skills" ]] && TARGETS+=("${HOME}/.codex/skills")
    [[ -f "${HOME}/.codex/config.toml" ]] && TARGETS+=("${HOME}/.codex/config.toml")
    ;;
  auto)
    ;;
esac

mkdir -p "${ARTIFACT_DIR}"

CMD=("${RUNNER[@]}" "--storage-file" "${STORAGE_FILE}")
[[ "${PRINT_ERRORS}" == "true" ]] && CMD+=("--print-errors")
[[ "${VERBOSE}" == "true" ]] && CMD+=("--verbose")
[[ "${DANGEROUS_MCP}" == "true" ]] && CMD+=("--dangerously-run-mcp-servers")
CMD+=("${EXTRA_ARGS[@]}")
[[ "${MODE}" != "auto" ]] && CMD+=("${TARGETS[@]}")

if [[ "${OUTPUT_JSON}" == "true" ]]; then
  REPORT_FILE="${ARTIFACT_DIR}/report.json"
  log "running agent scan with JSON output -> ${REPORT_FILE}"
  "${CMD[@]}" --json > "${REPORT_FILE}"
  log "agent scan report written: ${REPORT_FILE}"
else
  log "running agent scan mode=${MODE}"
  "${CMD[@]}"
fi
