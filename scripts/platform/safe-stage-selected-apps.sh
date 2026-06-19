#!/usr/bin/env bash
set -Eeuo pipefail

APPS=(
  "apps/ABTPi18n"
  "apps/zkbtrader"
  "apps/zoffice"
  "apps/zsticker"
)

for app in "${APPS[@]}"; do
  [ -d "$app" ] || continue
  echo "=== staging safe source: $app ==="

  find "$app" \
    \( \
      -path '*/.git/*' \
      -o -path '*/node_modules/*' \
      -o -path '*/.pnpm-store/*' \
      -o -path '*/.venv/*' \
      -o -path '*/venv/*' \
      -o -path '*/env/*' \
      -o -path '*/.pytest_cache/*' \
      -o -path '*/.ruff_cache/*' \
      -o -path '*/.mypy_cache/*' \
      -o -path '*/__pycache__/*' \
      -o -path '*/.next/*' \
      -o -path '*/dist/*' \
      -o -path '*/build/*' \
      -o -path '*/coverage/*' \
      -o -path '*/.runtime/*' \
      -o -path '*/logs/*' \
      -o -path '*/.wrangler/*' \
      -o -path '*/.terraform/*' \
      -o -path '*/.agent/*' \
      -o -path '*/.agents/*' \
      -o -path '*/.claude/*' \
      -o -path '*/.codex/*' \
      -o -path '*/.gemini/*' \
      -o -path '*/.vendor/*' \
      -o -path '*/bin/Release/*' \
      -o -path '*/obj/Release/*' \
    \) -prune -o \
    -type f \
    ! -name '.env' \
    ! -name '.env.*' \
    ! -name '*.log' \
    ! -name '*.sqlite' \
    ! -name '*.db' \
    ! -name '*.pyc' \
    ! -name '*.pyo' \
    ! -name '*.so' \
    ! -name '*.dll' \
    ! -name '*.exe' \
    ! -name '*.tfstate' \
    ! -name '*.tfvars' \
    ! -name '*.tfplan' \
    ! -name 'Thumbs.db' \
    -print0 | xargs -0 -r git add -f
done

# zDash env example is template, safe to stage
git add -f apps/zdash/.env.example 2>/dev/null || true

echo "PASS: safe staging complete"
