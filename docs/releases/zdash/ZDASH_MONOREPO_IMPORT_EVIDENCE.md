# zDash Monorepo Import Evidence

| Field | Value |
|-------|-------|
| **Source repo** | `cvsz/zdash` |
| **Target path** | `apps/zdash/` |
| **Imported commit SHA** | `[INSERT SOURCE SHA]` |
| **Method** | `git subtree --squash` |
| **Import date** | 2026-06-02 |
| **Validation status** | PASS (all structural checks) |
| **Safety status** | PASS (all safety invariants preserved) |
| **No-secret status** | PASS (no `.env` tracked, all configs are `.example.json`) |

## Rollback

```bash
git revert HEAD~2..HEAD
```

Keep original `cvsz/zdash` repo available until CI is stable.

## Artifacts

- Architecture doc: `docs/architecture/ZDASH_MONOREPO_INTEGRATION.md`
- Operations runbook: `docs/runbooks/ZDASH_MONOREPO_OPERATIONS.md`
- Import report: `docs/reports/PHASE51_ZDASH_MONOREPO_IMPORT_REPORT.md`
- CI workflow: `.github/workflows/zdash-monorepo.yml`
- Operator configs: `configs/cloudflare/zdash/*.example.json`
- Tunnel ingress: `generated/cloudflare/zdash-tunnel-ingress.yml`
