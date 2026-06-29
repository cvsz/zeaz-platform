#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# Terraform Provider GPG Signing Automation Installer
# Creates scripts + GitHub Actions + GoReleaser config
# Uses RSA 4096 GPG keys, NOT ECC.
# ============================================================

ROOT_DIR="$(pwd)"

mkdir -p scripts .github/workflows dist

cat > scripts/tf-gpg-rsa-bootstrap.sh <<'SCRIPT'
#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# Generate RSA 4096 GPG key for Terraform provider signing
#
# Required env:
#   GPG_NAME
#   GPG_EMAIL
#   GPG_PASSPHRASE
#
# Example:
#   GPG_NAME="ZeaZDev Terraform Provider Signing" \
#   GPG_EMAIL="security@zeaz.dev" \
#   GPG_PASSPHRASE="change-this-strong-passphrase" \
#   bash scripts/tf-gpg-rsa-bootstrap.sh
# ============================================================

: "${GPG_NAME:?Missing GPG_NAME}"
: "${GPG_EMAIL:?Missing GPG_EMAIL}"
: "${GPG_PASSPHRASE:?Missing GPG_PASSPHRASE}"

export GNUPGHOME="${GNUPGHOME:-$HOME/.gnupg}"
mkdir -p "$GNUPGHOME"
chmod 700 "$GNUPGHOME"

cat > /tmp/tf-gpg-keygen.batch <<EOF
%echo Generating Terraform provider signing key
Key-Type: RSA
Key-Length: 4096
Subkey-Type: RSA
Subkey-Length: 4096
Name-Real: ${GPG_NAME}
Name-Email: ${GPG_EMAIL}
Expire-Date: 2y
Passphrase: ${GPG_PASSPHRASE}
%commit
%echo Done
