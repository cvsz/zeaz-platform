#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
"${ROOT_DIR}/scripts/validate.sh"
terraform -chdir="${ROOT_DIR}/terraform/envs/${1:-dev}" init -input=false
terraform -chdir="${ROOT_DIR}/terraform/envs/${1:-dev}" apply -auto-approve
