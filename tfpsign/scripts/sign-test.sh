#!/usr/bin/env bash
set -Eeuo pipefail

: "${GPG_KEY_ID:?Missing GPG_KEY_ID}"
: "${GPG_PASSPHRASE:?Missing GPG_PASSPHRASE}"

mkdir -p dist

CHECKSUM_FILE="dist/terraform-provider-test_SHA256SUMS"
SIGNATURE_FILE="${CHECKSUM_FILE}.sig"

printf '%s\n' "terraform-provider-test-checksum" > "$CHECKSUM_FILE"

gpg --batch --yes \
  --pinentry-mode loopback \
  --passphrase "$GPG_PASSPHRASE" \
  --local-user "$GPG_KEY_ID" \
  --detach-sign \
  --armor \
  --output "$SIGNATURE_FILE" \
  "$CHECKSUM_FILE"

gpg --verify "$SIGNATURE_FILE" "$CHECKSUM_FILE"

echo
echo "GPG signing test passed."
echo
ls -lah "$CHECKSUM_FILE" "$SIGNATURE_FILE"
