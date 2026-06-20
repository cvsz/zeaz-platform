#!/usr/bin/env bash
set -Eeuo pipefail
echo "Validating maintenance foundations..."
[ -f docs/maintenance/quarterly-review.md ] || { echo "Missing review docs"; exit 1; }
[ -f scripts/maintenance/run-audit.sh ] || { echo "Missing audit script"; exit 1; }
echo "Maintenance foundations valid."
