#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# Upload GPG secrets to GitHub Actions using gh CLI
#
# Required env:
#   GPG_PRIVATE_KEY_PATH
#   GPG_PASSPHRASE
#
# Optional:
#   GITHUB_TOKEN must already be available through gh auth login
#
# Usage:
#   GPG_PRIVATE_KEY_PATH=".secrets/terraform-provider-private.gpg" \
#   GPG_PASSPHRASE="your-passphrase" \
#   bash scripts/tf-github-secrets-setup.sh
# ============================================================

: "${GPG_PRIVATE_KEY_PATH:?Missing GPG_PRIVATE_KEY_PATH}"
: "${GPG_PASSPHRASE:?Missing GPG_PASSPHRASE}"

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: GitHub CLI not found. Install gh first." >&2
  exit 1
fi

if [[ ! -f "$GPG_PRIVATE_KEY_PATH" ]]; then
  echo "ERROR: Private key file not found: $GPG_PRIVATE_KEY_PATH" >&2
  exit 1
fi

KEY_ID="$(gpg --show-keys --keyid-format LONG "$GPG_PRIVATE_KEY_PATH" \
  | awk '/pub/ {print $2}' \
  | sed 's#.*/##' \
  | head -n 1)"

if [[ -z "$KEY_ID" ]]; then
  echo "ERROR: Could not detect GPG key ID from private key." >&2
  exit 1
fi

PRIVATE_KEY_CONTENT="$(cat "$GPG_PRIVATE_KEY_PATH")"

gh secret set GPG_PRIVATE_KEY --body "$PRIVATE_KEY_CONTENT"
gh secret set PASSPHRASE --body "$GPG_PASSPHRASE"
gh secret set GPG_KEY_ID --body "$KEY_ID"

echo
echo "GitHub Actions secrets uploaded:"
echo "GPG_PRIVATE_KEY"
echo "PASSPHRASE"
echo "GPG_KEY_ID=$KEY_ID"
