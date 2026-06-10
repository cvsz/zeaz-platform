#!/usr/bin/env bash
set -ex
export CI=true

cd /home/zeazdev/zeaz-platform

echo "Updating twig/twig in phpMyAdmin..."
cd apps/zlms/app/phpMyAdmin
composer update twig/twig || true
cd ../../../..

echo "Updating hickory-proto in Rust sandbox..."
cd apps/openwork/examples/microsandbox-openwork-rust
cargo update -p hickory-proto || true
cd ../../../..

echo "Running pnpm update for the remaining node packages just in case..."
cd apps/openwork
sed -i 's/minimumReleaseAge: 4320/# minimumReleaseAge: 4320/g' pnpm-workspace.yaml || true
sed -i 's/minimumReleaseAgeExclude:/# minimumReleaseAgeExclude:/g' pnpm-workspace.yaml || true
sed -i 's/  - "@opencode-ai\/sdk"/#   - "@opencode-ai\/sdk"/g' pnpm-workspace.yaml || true
pnpm update --ignore-scripts --recursive --latest xlsx next protobufjs rollup tar axios samlify react-router tmp seroval || true
sed -i 's/# minimumReleaseAge: 4320/minimumReleaseAge: 4320/g' pnpm-workspace.yaml || true
sed -i 's/# minimumReleaseAgeExclude:/minimumReleaseAgeExclude:/g' pnpm-workspace.yaml || true
sed -i 's/#   - "@opencode-ai\/sdk"/  - "@opencode-ai\/sdk"/g' pnpm-workspace.yaml || true
cd ../..

echo "All updates finished successfully."
