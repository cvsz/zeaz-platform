#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="${ROOT_DIR}/docs/reports/generated/zeaz-dev-public-release-evidence.md"
mkdir -p "${ROOT_DIR}/docs/reports/generated"

cat >"$OUT" <<'EOF'
# zeaz.dev public release evidence

## Included items

- zDash Phase 48 evidence
- Phase 51 monorepo validation
- Phase 52 route plan
- DNS intent
- Tunnel ingress
- Access policy
- rollback plan
- no-secret confirmation

EOF

echo "$OUT"

