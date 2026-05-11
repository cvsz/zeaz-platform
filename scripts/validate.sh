#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
trap 'echo "validation failed" >&2' ERR
terraform -chdir=terraform fmt -check -recursive
terraform -chdir=terraform init -backend=false
terraform -chdir=terraform validate
