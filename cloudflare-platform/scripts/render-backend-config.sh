#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

: "${TERRAFORM_BACKEND_TYPE:?required}"
: "${TERRAFORM_STATE_BUCKET:?required}"
: "${ENVIRONMENT:?required}"

mkdir -p terraform/backend
out="terraform/backend/${ENVIRONMENT}.backend.hcl"
case "$TERRAFORM_BACKEND_TYPE" in
  s3)
    : "${TERRAFORM_LOCK_TABLE:?required for s3 backend}"
    cat > "$out" <<EOT
bucket         = "${TERRAFORM_STATE_BUCKET}"
key            = "cloudflare-platform/${ENVIRONMENT}/terraform.tfstate"
region         = "${REGION}"
dynamodb_table = "${TERRAFORM_LOCK_TABLE}"
encrypt        = true
EOT
    ;;
  local)
    cat > "$out" <<EOT
path = "terraform/state/${ENVIRONMENT}.tfstate"
EOT
    ;;
  *)
    echo "Unsupported TERRAFORM_BACKEND_TYPE: ${TERRAFORM_BACKEND_TYPE}" >&2
    exit 1
    ;;
esac

echo "$out"
