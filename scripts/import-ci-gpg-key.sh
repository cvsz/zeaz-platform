#!/usr/bin/env bash
set -Eeuo pipefail

: "${GPG_PRIVATE_KEY:?Missing GPG_PRIVATE_KEY}"

echo "$GPG_PRIVATE_KEY" | gpg --batch --import
gpg --list-secret-keys --keyid-format LONG
