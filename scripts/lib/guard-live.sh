#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# Usage: guard-live.sh <dry_run_command> <delay_seconds>

DRY_RUN_CMD="${1:-true}"
DELAY_SEC="${2:-5}"

echo "=== SAFETY GUARD: PRE-LIVE CHECK ==="
echo "Executing Dry-run: $DRY_RUN_CMD"
eval "$DRY_RUN_CMD"

if [[ $? -ne 0 ]]; then
    echo "ERROR: Dry-run failed. Aborting live operation."
    exit 1
fi

echo ""
echo "Dry-run successful."
echo "Waiting for $DELAY_SEC seconds before proceeding to LIVE..."
for ((i=DELAY_SEC; i>0; i--)); do
    echo -ne "Proceeding in $i seconds... \r"
    sleep 1
done
echo "Proceeding to LIVE now!            "
echo "===================================="
