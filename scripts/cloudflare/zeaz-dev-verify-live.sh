#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REPORT="${ROOT_DIR}/docs/reports/generated/zeaz-dev-live-verification.md"
mkdir -p "${ROOT_DIR}/docs/reports/generated"

urls=(
  "https://zeaz.dev"
  "https://www.zeaz.dev"
  "https://zdash.zeaz.dev"
  "https://zdash-api.zeaz.dev"
  "https://release.zeaz.dev"
)

{
  echo "# zeaz.dev live verification"
  echo
  echo "Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo
  for url in "${urls[@]}"; do
    code="$(curl -k -sS -o /dev/null -w '%{http_code}' --max-time 15 "$url" || echo "000")"
    echo "- $url -> $code"
  done
} >"$REPORT"

cat "$REPORT"

