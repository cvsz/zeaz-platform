#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/artifacts"
SBOM_FILE="${OUT_DIR}/sbom.cdx.json"
SBOM_SHA_FILE="${OUT_DIR}/sbom.cdx.json.sha256"

# Verify module download integrity and checksum database validation.
go mod verify

# Verify SBOM artifact integrity.
if [[ ! -f "${SBOM_FILE}" ]] || [[ ! -f "${SBOM_SHA_FILE}" ]]; then
  echo "artifact verification failed: missing SBOM artifacts"
  exit 1
fi

sha256sum -c "${SBOM_SHA_FILE}"

echo "Artifact verification passed"
