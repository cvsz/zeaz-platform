#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
trap 'echo "secret rotation failed" >&2' ERR
./scripts/cloudflare/rotate-tokens.sh
