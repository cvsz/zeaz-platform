#!/usr/bin/env bash
set -euo pipefail

echo "== Fix /opt/zveo ownership =="

sudo chown -R zeazdev:zeazdev /opt/zveo

cd /opt/zveo

echo
echo "== Stop ZVEO services if present =="

sudo systemctl stop zveo-web 2>/dev/null || true
sudo systemctl stop zveo-api 2>/dev/null || true
sudo systemctl stop zveo-render-worker 2>/dev/null || true

echo
echo "== Remove stale node_modules safely =="

find . -name node_modules -type d -prune -exec rm -rf {} +

echo
echo "== Remove stale build caches =="

rm -rf apps/dashboard/.next
find . -name 'tsconfig.tsbuildinfo' -delete

echo
echo "== Install dependencies =="

pnpm install --frozen-lockfile=false

echo
echo "== Build core packages =="

pnpm --filter @zveo/contracts build || true
pnpm --filter @zveo/core build || true
pnpm --filter @zveo/queue build || true
pnpm --filter @zveo/scene-graph build || true
pnpm --filter @zveo/media-pipeline build || true
pnpm --filter @zveo/ai-script-generator build || true
pnpm --filter @zveo/publisher-meta build || true

echo
echo "== Build apps =="

pnpm --filter @zveo/api-gateway build
pnpm --filter @zveo/dashboard build
pnpm --filter @zveo/render-worker build

echo
echo "== COMPLETE =="
