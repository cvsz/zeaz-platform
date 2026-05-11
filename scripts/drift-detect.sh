#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
trap 'echo "drift detection failed" >&2' ERR
terraform -chdir=terraform plan -detailed-exitcode || code=$?
if [[ "${code:-0}" -eq 2 ]]; then
  echo "drift-detected"
fi
