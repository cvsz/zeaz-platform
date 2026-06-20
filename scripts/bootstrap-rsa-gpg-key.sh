#!/usr/bin/env bash
set -Eeuo pipefail

: "${GPG_NAME:?Missing GPG_NAME}"
: "${GPG_EMAIL:?Missing GPG_EMAIL}"
: "${GPG_PASSPHRASE:?Missing GPG_PASSPHRASE}"

export GNUPGHOME="${GNUPGHOME:-$HOME/.gnupg}"
mkdir -p "$GNUPGHOME" .secrets
chmod 700 "$GNUPGHOME"

BATCH_FILE="$(mktemp)"

cleanup() {
  rm -f "$BATCH_FILE"
}
trap cleanup EXIT

{
  echo "%echo Generating Terraform provider signing key"
  echo "Key-Type: RSA"
  echo "Key-Length: 4096"
  echo "Subkey-Type: RSA"
  echo "Subkey-Length: 4096"
  echo "Name-Real: ${GPG_NAME}"
  echo "Name-Email: ${GPG_EMAIL}"
  echo "Expire-Date: 2y"
  echo "Passphrase: ${GPG_PASSPHRASE}"
  echo "%commit"
  echo "%echo Done"
} > "$BATCH_FILE"

gpg --batch --generate-key "$BATCH_FILE"

KEY_ID="$(
  gpg --list-secret-keys --keyid-format LONG "$GPG_EMAIL" \
    | awk '/sec/ {print $2}' \
    | sed 's#.*/##' \
    | head -n 1
)"

if [[ -z "$KEY_ID" ]]; then
  echo "ERROR: Could not detect generated GPG key ID." >&2
  exit 1
fi

gpg --armor --export "$KEY_ID" > .secrets/terraform-provider-public.gpg
gpg --armor --export-secret-keys "$KEY_ID" > .secrets/terraform-provider-private.gpg

chmod 600 .secrets/terraform-provider-private.gpg

printf '%s\n' "$KEY_ID" > .secrets/GPG_KEY_ID.txt

gpg --fingerprint "$KEY_ID" \
  | sed -n '/Key fingerprint/ p' \
  | sed 's/.*= //' \
  > .secrets/GPG_FINGERPRINT.txt

echo
echo "Generated RSA 4096 Terraform provider signing key."
echo
echo "KEY_ID:"
cat .secrets/GPG_KEY_ID.txt
echo
echo "Fingerprint:"
cat .secrets/GPG_FINGERPRINT.txt
echo
echo "Public key:"
echo ".secrets/terraform-provider-public.gpg"
echo
echo "Private key:"
echo ".secrets/terraform-provider-private.gpg"
echo
echo "Upload public key to Terraform Registry -> User Settings -> Signing Keys."
