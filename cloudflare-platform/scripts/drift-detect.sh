#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENVIRONMENT="${1:-dev}"
terraform -chdir="${ROOT_DIR}/terraform/envs/${ENVIRONMENT}" init -input=false
terraform -chdir="${ROOT_DIR}/terraform/envs/${ENVIRONMENT}" plan -detailed-exitcode -out=tfplan || code=$?
code="${code:-0}"
if [[ "$code" -eq 2 ]]; then echo "Drift detected"; exit 2; fi
if [[ "$code" -eq 1 ]]; then echo "Plan failed"; exit 1; fi
echo "No drift"
