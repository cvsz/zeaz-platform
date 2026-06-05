#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

APPS_DIR="${APPS_DIR:-apps}"
REPORT="${REPORT:-docs/reports/generated/apps-deep-dive.md}"
JSON_OUT="${JSON_OUT:-generated/integration/apps-inventory.json}"

python3 scripts/apps/deep-dive-local-apps.py \
  --root "$ROOT" \
  --apps-dir "$APPS_DIR" \
  --report "$REPORT" \
  --json "$JSON_OUT"
