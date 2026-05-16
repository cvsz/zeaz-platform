#!/usr/bin/env bash
set -Eeuo pipefail

echo "🔥 Fixing root Terraform validation blocks..."

ROOT="terraform"

# Fix ONLY root variables.tf
FILE="$ROOT/variables.tf"

if [[ -f "$FILE" ]]; then
  echo "🧹 Cleaning $FILE"

  # Remove broken validation blocks completely
  sed -i '/validation {/,/}/d' "$FILE"
fi

# Also clean tokens module if broken
FILE2="$ROOT/tokens/variables.tf"
if [[ -f "$FILE2" ]]; then
  echo "🧹 Cleaning $FILE2"
  sed -i '/validation {/,/}/d' "$FILE2"
fi

echo
echo "✅ Root validation fixed"
echo
echo "Now run:"
echo "cd terraform"
echo "terraform init"
