#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
trap 'echo "update failed" >&2' ERR
terraform -chdir=terraform init -upgrade
terraform -chdir=terraform plan -out=tfplan
terraform -chdir=terraform apply -auto-approve tfplan
