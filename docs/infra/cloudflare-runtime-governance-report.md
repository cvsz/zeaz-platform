# Cloudflare Runtime Governance Report

*Phase: 7*
*Branch: fix/cloudflare-runtime-governance-phase7*
*Generated: 2026-06-11T20:07:08Z*

## Scanner Summary

| Scanner | Exit Code |
|---|---|
| scan-worker-bindings | 0 |
| check-no-mutation | 1 |
| check-secret-leaks | 1 |
| scan-dns-ownership | 1 |
| scan-workers-routes | 1 |
| check-wrangler-examples | 1 |
| scan-runtime-governance | 1 |

## Runtime Governance Summary



## No-Mutation Guard Summary

Exit Code: 1
See validation log for details if failed.

## Worker Bindings Summary

See [cloudflare-worker-bindings-inventory.md](cloudflare-worker-bindings-inventory.md) for full inventory.

## Ownership Risks Summary

Any failures in DNS or Route scanners highlight ownership risks.
See validation log.

## Blockers

If any strict scanner exited non-zero, this phase cannot proceed to deploy.

## Manual Actions

Review binding inventories and ensure no placeholder IDs exist before deploy.

## Validation Commands

Run `infra/cloudflare/scripts/generate-runtime-governance-report.sh` to regenerate this report.
