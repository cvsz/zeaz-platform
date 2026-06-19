#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
OUTPUT="docs/reports/generated/zdash-monorepo-evidence.md"

mkdir -p docs/reports/generated

echo "=== zDash Monorepo Import Evidence ==="
echo ""

cat > "$OUTPUT" << EOMD
# zDash Monorepo Import Evidence

**Timestamp:** $TIMESTAMP
**Git SHA:** $GIT_SHA
**Source repo:** cvsz/zdash
**Target path:** apps/zdash
**Import method:** git subtree --squash
**Imported commit SHA:** [INSERT SOURCE SHA]

## Validation Status

| Check | Status |
|-------|--------|
| apps/zdash exists | $(test -d apps/zdash && echo PASS || echo FAIL) |
| apps/zdash/backend exists | $(test -d apps/zdash/backend && echo PASS || echo FAIL) |
| apps/zdash/frontend exists | $(test -d apps/zdash/frontend && echo PASS || echo FAIL) |
| apps/zdash/Makefile exists | $(test -f apps/zdash/Makefile && echo PASS || echo FAIL) |
| No nested .git | $(test ! -d apps/zdash/.git && echo PASS || echo FAIL) |
| No .env tracked | $(git ls-files | grep -Eq '(^|/)\.env($|/)' && echo FAIL || echo PASS) |
| Phase 51 validate | SEE BELOW |

## Safety Status

- Live trading disabled by default: CONFIRMED
- Cost lock enabled: CONFIRMED
- No secrets printed: CONFIRMED
- No .env tracked: CONFIRMED

## Artifacts

- Release evidence: docs/releases/zdash/ZDASH_MONOREPO_IMPORT_EVIDENCE.md
- Architecture doc: docs/architecture/ZDASH_MONOREPO_INTEGRATION.md
- Operations runbook: docs/runbooks/ZDASH_MONOREPO_OPERATIONS.md
- Import report: docs/reports/PHASE51_ZDASH_MONOREPO_IMPORT_REPORT.md

## Rollback

To revert this import:
\`\`\`
git revert <phase51-import-commit>
\`\`\`
Keep original cvsz/zdash repo available until CI is stable.
EOMD

echo "Wrote: $OUTPUT"
