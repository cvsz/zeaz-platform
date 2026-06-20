#!/usr/bin/env bash
set -Eeuo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="../"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "ERROR: Target directory does not exist: $TARGET_DIR" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR/scripts" "$TARGET_DIR/.github/workflows"

copy_file() {
  local src="$1"
  local dst="$2"

  if [[ -e "$dst" ]]; then
    cp -r "$dst" "${dst}.bak.$(date +%Y%m%d%H%M%S)"
  fi

  cp -r "$src" "$dst"
}

copy_file "$SOURCE_DIR/scripts/bootstrap-rsa-gpg-key.sh" "$TARGET_DIR/scripts/bootstrap-rsa-gpg-key.sh"
copy_file "$SOURCE_DIR/scripts/export-public-key.sh" "$TARGET_DIR/scripts/export-public-key.sh"
copy_file "$SOURCE_DIR/scripts/import-ci-gpg-key.sh" "$TARGET_DIR/scripts/import-ci-gpg-key.sh"
copy_file "$SOURCE_DIR/scripts/sign-test.sh" "$TARGET_DIR/scripts/sign-test.sh"
copy_file "$SOURCE_DIR/scripts/setup-github-secrets.sh" "$TARGET_DIR/scripts/setup-github-secrets.sh"
copy_file "$SOURCE_DIR/.github/workflows/release-terraform-provider.yml" "$TARGET_DIR/.github/workflows/release-terraform-provider.yml"
copy_file "$SOURCE_DIR/.goreleaser.yml" "$TARGET_DIR/.goreleaser.yml"

chmod +x "$TARGET_DIR"/scripts/*.sh

touch "$TARGET_DIR/.gitignore"

while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  if ! grep -Fxq "$line" "$TARGET_DIR/.gitignore"; then
    printf '%s\n' "$line" >> "$TARGET_DIR/.gitignore"
  fi
done < "$SOURCE_DIR/.gitignore.addon"

echo "Installed Terraform provider signing automation into:"
echo "$TARGET_DIR"
echo
echo "Next:"
echo "GPG_NAME='ZeaZDev Terraform Provider Signing' \\"
echo "GPG_EMAIL='security@zeaz.dev' \\"
echo "GPG_PASSPHRASE='@@@Zz112233' \\"
echo "bash scripts/bootstrap-rsa-gpg-key.sh"
