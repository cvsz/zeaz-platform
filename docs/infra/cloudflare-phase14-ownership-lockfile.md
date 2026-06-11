# Cloudflare Runtime Ownership Lockfile

This lockfile is documentation evidence only. It is not an executable deployment file.

| Hostname | Runtime owner | Source file / evidence | Expected route behavior | Conflict policy | Change approval required |
|---|---|---|---|---|---|
| www.zeaz.dev | Worker | workers/zeaz-loading/wrangler.toml | Worker route www.zeaz.dev/* | Worker wins for HTTP(S); DNS CNAME conflict must be reviewed | Phase 10-14 gates required |
| zeaz.dev | Tunnel | docs/infra/cloudflare-dns-ownership-matrix.md and tunnel docs | apex tunnel ingress | no Worker route unless baseline updated | Phase 10-14 gates required |
| app.zeaz.dev | Tunnel | tunnel docs/scans | tunnel ingress | no Worker route unless baseline updated | Phase 10-14 gates required |
| api-*.zeaz.dev | Tunnel | tunnel docs/scans | tunnel ingress | no Worker route unless baseline updated | Phase 10-14 gates required |

## How to update this lockfile safely
- Updates require a Pull Request.
- Validate using `infra/cloudflare/scripts/compare-runtime-baseline.sh`.
- Ensure corresponding infrastructure code (Terraform or Wrangler) is updated.
- No direct deployments are allowed during lockfile updates.

## Forbidden lockfile changes
- Do not assign `api-*.zeaz.dev` to a Worker without explicit architectural review.
- Do not reassign `zeaz.dev` apex from Tunnel without reviewing apex proxying rules.

## Required evidence for ownership change
- A generated baseline diff report (`docs/infra/cloudflare-phase14-baseline-diff-report.md`).
- Passed Phase 10-14 validation scripts.
