#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_FILE="${1:-}"
[[ -f "${STATE_FILE}" ]] || { echo "state file required"; exit 1; }
terraform -chdir="${ROOT_DIR}/terraform" init -input=false
terraform -chdir="${ROOT_DIR}/terraform" state push "${STATE_FILE}"
