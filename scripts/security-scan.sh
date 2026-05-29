#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

STRICT_SECURITY_SCAN="${STRICT_SECURITY_SCAN:-false}"
ARTIFACT_DIR="${ARTIFACT_DIR:-.}"
SBOM_FILE="${SBOM_FILE:-${ARTIFACT_DIR}/artifacts.sbom.spdx.json}"

log() { printf '{"ts":"%s","level":"info","script":"security-scan","msg":"%s"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1"; }
warn() { printf '{"ts":"%s","level":"warn","script":"security-scan","msg":"%s"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" >&2; }
err() { printf '{"ts":"%s","level":"error","script":"security-scan","line":%s,"cmd":"%s"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" "$2" >&2; }
trap 'err "$LINENO" "$BASH_COMMAND"' ERR

has_cmd() { command -v "$1" >/dev/null 2>&1; }

run_with_retry() {
  local attempts=0 max_attempts=3
  until "$@"; do
    attempts=$((attempts + 1))
    if (( attempts >= max_attempts )); then
      return 1
    fi
    sleep $((attempts * 2))
  done
}

run_optional() {
  local tool="$1"
  shift

  if ! has_cmd "$tool"; then
    if [[ "$STRICT_SECURITY_SCAN" == "true" ]]; then
      echo "missing required tool: $tool" >&2
      return 1
    fi
    warn "missing optional tool: ${tool}; skipped. Set STRICT_SECURITY_SCAN=true to require it."
    return 0
  fi

  log "running ${tool}"
  if run_with_retry "$tool" "$@"; then
    return 0
  fi

  if [[ "$STRICT_SECURITY_SCAN" == "true" ]]; then
    warn "${tool} reported findings or failed in strict mode"
    return 1
  fi

  warn "${tool} reported findings or failed; continuing because STRICT_SECURITY_SCAN=false"
  return 0
}

mkdir -p "$ARTIFACT_DIR"
log "starting security scans"

if [[ -f security/trivy.yml ]]; then
  run_optional trivy fs --config security/trivy.yml .
else
  run_optional trivy fs .
fi

if [[ -f security/semgrep.yml ]]; then
  run_optional semgrep --config security/semgrep.yml .
else
  warn "security/semgrep.yml not found; skipped semgrep"
fi

if [[ -f security/gitleaks.toml ]]; then
  run_optional gitleaks detect --config security/gitleaks.toml --source . --redact
else
  run_optional gitleaks detect --source . --redact
fi

if has_cmd syft; then
  log "running syft"
  if run_with_retry syft . -o spdx-json > "$SBOM_FILE"; then
    log "wrote SBOM: ${SBOM_FILE}"
  elif [[ "$STRICT_SECURITY_SCAN" == "true" ]]; then
    warn "syft failed in strict mode"
    exit 1
  else
    warn "syft failed; continuing because STRICT_SECURITY_SCAN=false"
  fi
else
  if [[ "$STRICT_SECURITY_SCAN" == "true" ]]; then
    echo "missing required tool: syft" >&2
    exit 1
  fi
  warn "missing optional tool: syft; skipped SBOM generation."
fi

if [[ -f "$SBOM_FILE" ]]; then
  run_optional grype "sbom:${SBOM_FILE}" --fail-on "${GRYPE_FAIL_ON:-critical}"
else
  warn "SBOM file missing; skipped grype"
fi

log "security scans completed"
