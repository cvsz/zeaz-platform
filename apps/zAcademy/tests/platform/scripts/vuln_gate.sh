#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/artifacts"
REPORT_FILE="${OUT_DIR}/govulncheck.json"

mkdir -p "${OUT_DIR}"

# Source-mode vulnerability analysis for all test platform packages.
GO111MODULE=on go run golang.org/x/vuln/cmd/govulncheck@latest -json ./... | tee "${REPORT_FILE}" >/dev/null

# Dependency-chain policy gate for known disallowed docker SDK line.
if go mod graph | grep -q 'github.com/docker/docker'; then
  echo "dependency vulnerability gate failed: github.com/docker/docker is present"
  exit 1
fi

echo "Vulnerability gates passed"
