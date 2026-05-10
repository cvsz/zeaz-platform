#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="${ROOT_DIR}/backups"
mkdir -p "${OUT_DIR}"
terraform -chdir="${ROOT_DIR}/terraform" init -input=false -backend=false >/dev/null
terraform -chdir="${ROOT_DIR}/terraform" state pull >"${OUT_DIR}/tfstate-${TS}.json"
sha256sum "${OUT_DIR}/tfstate-${TS}.json" >"${OUT_DIR}/tfstate-${TS}.sha256"
echo "Backup created at ${OUT_DIR}/tfstate-${TS}.json"
