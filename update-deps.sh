#!/usr/bin/env bash
set -ex
export CI=true

cd /home/zeazdev/zeaz-platform

echo "Updating openwork..."
cd apps/openwork
pnpm install --ignore-scripts || true
pnpm update --ignore-scripts --recursive --latest xlsx vite next protobufjs @protobufjs/utf8 rollup tar axios samlify react-router tmp seroval fast-uri fast-xml-parser @opentelemetry/sdk-node @opentelemetry/exporter-prometheus defu follow-redirects qs uuid postcss file-type @hono/node-server ip-address esbuild electron || true
cd ../..

echo "Updating ztrader/frontend..."
cd apps/ztrader/frontend
pnpm install --ignore-scripts || true
pnpm update --ignore-scripts postcss --latest || true
cd ../../..

echo "Updating ABTPi18n..."
cd apps/ABTPi18n
pnpm install --ignore-scripts || true
pnpm update --ignore-scripts postcss --latest || true
cd ../..

echo "Updating phpMyAdmin..."
cd apps/zlms-prod/app/phpMyAdmin
composer update twig/twig --no-interaction || true
cd ../../../..

echo "Updating Rust packages..."
cd apps/openwork/examples/microsandbox-openwork-rust
cargo update -p hickory-proto || true
cd ../../../..

echo "Updating Go packages..."
cd apps/zcino-modern
go get github.com/quic-go/quic-go@latest || true
go mod tidy || true
cd ../..

echo "Updating Python packages..."
cd apps/ztrader/backend
sed -i -E 's/^pytest==[0-9\.]+/pytest>=8.3.4/' requirements.txt || true
sed -i -E 's/^pytest[[:space:]]*$/pytest>=8.3.4/' requirements.txt || true
cd ../../..

echo "All updates finished successfully."
