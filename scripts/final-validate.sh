#!/usr/bin/env bash
set -Eeuo pipefail
echo "Running final repository integrity check..."
# Run established validation suite
bash scripts/validate.sh
bash scripts/networking-validate.sh
bash scripts/workers-validate.sh
bash scripts/monitoring-validate.sh
bash scripts/gitops-validate.sh
bash scripts/handoff-validate.sh
bash scripts/maintenance-validate.sh
echo "Repository integrity audit complete."
