#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
WEB="$ROOT/apps/zeaz-web"

cd "$WEB"

node -v
npm -v

rm -rf node_modules .next

if [ -f package-lock.json ]; then
  npm ci --include=optional --no-audit --fund=false
else
  npm install --include=optional --no-audit --fund=false
fi

TAILWIND_POSTCSS_VERSION="$(
  node - <<'NODE'
const fs = require("node:fs");
const path = require("node:path");

const pkgPath = path.join(process.cwd(), "node_modules", "@tailwindcss", "postcss", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
console.log(pkg.version);
NODE
)"

if ! node -e "require('@tailwindcss/oxide-linux-x64-gnu')" >/dev/null 2>&1; then
  npm install -D "@tailwindcss/oxide-linux-x64-gnu@${TAILWIND_POSTCSS_VERSION}" --include=optional --no-audit --fund=false
fi

if ! node -e "require('tailwindcss-animate')" >/dev/null 2>&1; then
  npm install tailwindcss-animate --save --include=optional --no-audit --fund=false
fi

node -e "require('@tailwindcss/oxide'); console.log('tailwind oxide ok')"
