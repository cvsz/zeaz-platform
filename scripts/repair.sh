#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
trap 'echo "repair failed" >&2' ERR
./scripts/drift-detect.sh
terraform -chdir=terraform apply -auto-approve
