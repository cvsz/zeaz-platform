#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'
	'

log() { printf '{"ts":"%s","level":"info","script":"security-scan","msg":"%s"}
' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1"; }
err() { printf '{"ts":"%s","level":"error","script":"security-scan","line":%s,"cmd":"%s"}
' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" "$2" >&2; }
trap 'err "$LINENO" "$BASH_COMMAND"' ERR

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

require_cmd() { command -v "$1" >/dev/null 2>&1 || { echo "missing required tool: $1" >&2; exit 1; }; }
for t in trivy semgrep gitleaks syft grype; do require_cmd "$t"; done

log "starting security scans"
run_with_retry trivy fs --config security/trivy.yml .
run_with_retry semgrep --config security/semgrep.yml .
run_with_retry gitleaks detect --config security/gitleaks.toml --source . --redact
run_with_retry syft . -o spdx-json > artifacts.sbom.spdx.json
run_with_retry grype sbom:artifacts.sbom.spdx.json --fail-on "${GRYPE_FAIL_ON:-critical}"
log "security scans completed"
