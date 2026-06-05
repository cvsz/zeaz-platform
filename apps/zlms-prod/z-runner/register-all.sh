#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
load_env
# Register one ephemeral runner for the configured scope. Multiple repos/orgs should be supplied by invoking this script with isolated env files.
"$(dirname "${BASH_SOURCE[0]}")/bootstrap.sh"
