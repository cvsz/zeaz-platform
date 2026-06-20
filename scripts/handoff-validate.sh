#!/usr/bin/env bash
set -Eeuo pipefail
echo "Validating handoff foundations..."
[ -f docs/setup/cloudflare-manual-setup.md ] || { echo "Missing setup docs"; exit 1; }
[ -f docs/handoff/operator-handoff.md ] || { echo "Missing handoff docs"; exit 1; }
echo "Handoff foundations valid."
