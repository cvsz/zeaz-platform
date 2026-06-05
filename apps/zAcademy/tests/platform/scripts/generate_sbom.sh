#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/artifacts"
SBOM_FILE="${OUT_DIR}/sbom.cdx.json"
SBOM_SHA_FILE="${OUT_DIR}/sbom.cdx.json.sha256"

mkdir -p "${OUT_DIR}"

# CycloneDX SBOM from go.mod/go.sum
GO111MODULE=on go run github.com/CycloneDX/cyclonedx-gomod/cmd/cyclonedx-gomod@v1.9.0 mod \
  -licenses \
  -json \
  -output "${SBOM_FILE}"

sha256sum "${SBOM_FILE}" > "${SBOM_SHA_FILE}"

echo "SBOM generated: ${SBOM_FILE}"
echo "Checksum generated: ${SBOM_SHA_FILE}"
