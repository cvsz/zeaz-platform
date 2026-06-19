#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
load_env
runner_dir="${RUNNER_INSTALL_DIR:-/opt/z-runner}/actions-runner"
cd "$runner_dir"
./config.sh remove --unattended --token "$(removal_token)"
