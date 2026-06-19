# zeaz.dev Public Release Evidence Index

This index lists the evidence bundle for the Phase 52 zeaz.dev production routing update.

## Included evidence

- zDash Phase 48 evidence
- Phase 51 monorepo validation
- Phase 52 route plan
- DNS intent
- Tunnel ingress
- Access policy
- rollback plan
- no-secret confirmation

## Source files

- `docs/reports/PHASE48_P0_P2_COMPLETION_REPORT.md`
- `docs/reports/PHASE51_ZDASH_MONOREPO_IMPORT_REPORT.md`
- `configs/cloudflare/zeaz-dev/zeaz-dev-route-intent.example.json`
- `configs/cloudflare/zdash/zdash.production.routes.example.json`
- `generated/cloudflare/zdash-production-tunnel-ingress.yml`
- `configs/cloudflare/access/zeaz-dev-zdash-access-policy.example.json`
- `docs/runbooks/ZEAZ_DEV_ROLLBACK.md`

## Safety statement

This evidence index is generated in dry-run mode unless `APPLY=true` and the required confirmation flags are provided.

