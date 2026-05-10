#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
terraform -chdir="${ROOT_DIR}/terraform/envs/${1:-dev}" init -input=false -reconfigure
terraform -chdir="${ROOT_DIR}/terraform/envs/${1:-dev}" apply -refresh-only -auto-approve
