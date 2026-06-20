#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# Local GPG signing test for Terraform provider release files
#
# Required env:
#   GPG_KEY_ID
#   GPG_PASSPHRASE
#
# Usage:
#   GPG_KEY_ID="ABC123..." \
#   GPG_PASSPHRASE="..." \
#   bash scripts/tf-provider-sign-test.sh
# ============================================================

: "${GPG_KEY_ID:?Missing GPG_KEY_ID}"
: "${GPG_PASSPHRASE:?Missing GPG_PASSPHRASE}"

mkdir -p dist

echo "terraform-provider-test-checksum" > dist/terraform-provider-test_SHA256SUMS

gpg --batch --yes \
  --pinentry-mode loopback \
  --passphrase "$GPG_PASSPHRASE" \
  --local-user "$GPG_KEY_ID" \
  --detach-sign \
  --armor \
  --output dist/terraform-provider-test_SHA256SUMS.sig \
  dist/terraform-provider-test_SHA256SUMS

gpg --verify \
  dist/terraform-provider-test_SHA256SUMS.sig \
  dist/terraform-provider-test_SHA256SUMS

echo
echo "GPG signing test passed."
echo "Files:"
ls -lah dist/terraform-provider-test_SHA256SUMS*
