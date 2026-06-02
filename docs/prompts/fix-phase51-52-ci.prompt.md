# Codex Prompt · Fix Phase 51/52 Validation + apps/web Tailwind Oxide Build

Generated: `2026-06-02T14:05:51+00:00`

```text
Repo: cvsz/zeaz-platform
Branch: fix/phase51-52-validation

Problems:
1. make phase51-validate fails because docs/reports/PHASE51_ZDASH_MONOREPO_IMPORT_REPORT.md is missing.
2. make phase52-validate fails because docs/reports/PHASE52_ZEAZ_DEV_PRODUCTION_UPDATE_REPORT.md is missing.
3. apps/web Next.js build fails because Tailwind oxide native optional dependency @tailwindcss/oxide-linux-x64-gnu is missing.

Tasks:
1. Add docs/reports/PHASE51_ZDASH_MONOREPO_IMPORT_REPORT.md.
2. Add docs/reports/PHASE52_ZEAZ_DEV_PRODUCTION_UPDATE_REPORT.md.
3. Add scripts/ci/install-web-deps-safe.sh.
4. Update apps/web CI build step to run scripts/ci/install-web-deps-safe.sh before npm run build.
5. Preserve APPLY=false, COST_LOCK=true, ALLOW_PAID_CLOUDFLARE_FEATURES=false, CLOUDFLARE_PLAN_TIER=Free.
6. Do not commit secrets.
7. Run make phase51-validate, make phase52-validate, and apps/web build.

Final response:
- changed files
- validation results
- release decision READY/HOLD
```
