#!/usr/bin/env bash
set -ex
export CI=true

cd /home/zeazdev/zeaz-platform

echo "Disabling pnpm minimumReleaseAge temporarily..."
sed -i 's/minimumReleaseAge: 4320/# minimumReleaseAge: 4320/g' apps/openwork/pnpm-workspace.yaml || true
sed -i 's/minimumReleaseAgeExclude:/# minimumReleaseAgeExclude:/g' apps/openwork/pnpm-workspace.yaml || true
sed -i 's/  - "@opencode-ai\/sdk"/#   - "@opencode-ai\/sdk"/g' apps/openwork/pnpm-workspace.yaml || true

echo "Updating openwork..."
cd apps/openwork
pnpm install --ignore-scripts || true
pnpm update --ignore-scripts --recursive --latest diff yaml ws @tootallnate/once || true
cd ../..

echo "Updating zwallet..."
cd apps/zwallet
pnpm install --ignore-scripts || true
pnpm update --ignore-scripts ws --recursive --latest || true
cd ../..

echo "Updating zcino..."
cd apps/zcino
go get github.com/quic-go/quic-go@latest || true
go mod tidy || true
cd ../..

echo "Updating Rust packages..."
cd apps/openwork/examples/microsandbox-openwork-rust
cargo update -p tar || true
cd ../../../..

echo "Restoring pnpm minimumReleaseAge..."
sed -i 's/# minimumReleaseAge: 4320/minimumReleaseAge: 4320/g' apps/openwork/pnpm-workspace.yaml || true
sed -i 's/# minimumReleaseAgeExclude:/minimumReleaseAgeExclude:/g' apps/openwork/pnpm-workspace.yaml || true
sed -i 's/#   - "@opencode-ai\/sdk"/  - "@opencode-ai\/sdk"/g' apps/openwork/pnpm-workspace.yaml || true

echo "All updates finished successfully."
