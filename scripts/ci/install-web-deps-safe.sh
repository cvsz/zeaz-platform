#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)/apps/web"

node -v
npm -v

rm -rf node_modules .next

if [ -f package-lock.json ]; then
  npm ci --include=optional --no-audit --fund=false
else
  npm install --include=optional --no-audit --fund=false
fi

if ! node -e "require('@tailwindcss/oxide-linux-x64-gnu')" >/dev/null 2>&1; then
  npm install -D @tailwindcss/oxide-linux-x64-gnu --include=optional --no-audit --fund=false
fi

node -e "require('@tailwindcss/oxide'); console.log('tailwind oxide ok')"
