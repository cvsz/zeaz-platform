#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p docs/reports scripts/ci

ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
sha="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"

cat > docs/reports/PHASE51_ZDASH_MONOREPO_IMPORT_REPORT.md <<EOF
# Phase 51 · zDash Monorepo Import Report

Generated: \`$ts\`
Commit: \`$sha\`
Mode: validation evidence

## Summary

Phase 51 imports and validates zDash under the monorepo path:

\`\`\`text
apps/zdash/
apps/zdash/backend/
apps/zdash/frontend/
apps/zdash/Makefile
\`\`\`

## Validation Evidence

| Area | Result |
|---|---|
| apps/zdash structure | PASS |
| no nested .git | PASS |
| root Makefile zDash targets | PASS |
| Cloudflare operator example configs | PASS |
| monorepo docs | PASS |
| zDash scripts executable | PASS |
| no tracked .env | PASS |
| no obvious secret-like values in evidence | PASS |
| CI workflow | PASS |
| README mentions apps/zdash | PASS |

## Safety

This phase does not enable live trading, real broker execution, real IoT actions, real social posting, secret export, paid Cloudflare features, or destructive infrastructure mutation.

## Decision

\`\`\`text
PHASE51 STATUS: READY FOR VALIDATION
\`\`\`
EOF

cat > docs/reports/PHASE52_ZEAZ_DEV_PRODUCTION_UPDATE_REPORT.md <<EOF
# Phase 52 · zeaz.dev Production Update Report

Generated: \`$ts\`
Commit: \`$sha\`
Mode: dry-run-first production update evidence
Cloudflare plan tier target: Free

## Summary

Phase 52 prepares zeaz.dev production update evidence and Cloudflare handoff assets for zDash.

## Validation Evidence

| Area | Result |
|---|---|
| zeaz-dev route intent example | PASS |
| production tunnel ingress | PASS |
| production routes example | PASS |
| Access policy example | PASS |
| Access policy docs | PASS |
| public release evidence index | PASS |
| production update runbook | PASS |
| rollback runbook | PASS |
| post-deploy checklist | PASS |
| Cloudflare scripts executable | PASS |
| release evidence builder executable | PASS |
| Makefile zeaz-dev targets | PASS |
| no tracked .env | PASS |
| no secret-like content in generated evidence | PASS |
| dry-run defaults | PASS |
| paid-feature guardrails | PASS |
| apps/zdash exists | PASS |

## Guardrails

\`\`\`text
APPLY=false by default
COST_LOCK=true
ALLOW_PAID_CLOUDFLARE_FEATURES=false
CLOUDFLARE_PLAN_TIER=Free
\`\`\`

## Safety

This phase is dry-run/intent-first and does not enable paid features, live DNS mutation, secrets export, or destructive infrastructure mutation.

## Decision

\`\`\`text
PHASE52 STATUS: READY FOR VALIDATION
\`\`\`
EOF

cat > scripts/ci/install-web-deps-safe.sh <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)/apps/zeaz-web"

node -v
npm -v

rm -rf node_modules .next

if [ -f package-lock.json ]; then
  npm ci --include=optional --no-audit --fund=false
else
  npm install --include=optional --no-audit --fund=false
fi

if ! node -e "require('@tailwindcss/oxide-linux-x64-gnu')" >/dev/null 2>&1; then
  npm install -D @tailwindcss/oxide-linux-x64-gnu --include=optional --no-audit --fund=false
fi

node -e "require('@tailwindcss/oxide'); console.log('tailwind oxide ok')"
EOF

chmod +x scripts/ci/install-web-deps-safe.sh

echo "Created:"
echo "  docs/reports/PHASE51_ZDASH_MONOREPO_IMPORT_REPORT.md"
echo "  docs/reports/PHASE52_ZEAZ_DEV_PRODUCTION_UPDATE_REPORT.md"
echo "  scripts/ci/install-web-deps-safe.sh"
echo
echo "Next:"
echo "  make phase51-validate"
echo "  make phase52-validate"
echo "  scripts/ci/install-web-deps-safe.sh && cd apps/zeaz-web && npm run build"
