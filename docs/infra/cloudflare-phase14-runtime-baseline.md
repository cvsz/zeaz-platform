# Cloudflare Runtime Baseline Freeze (Phase 14)

Date: [DATE]

Phase 14 does not deploy. Phase 14 does not apply Terraform or OpenTofu. Phase 14 does not run Wrangler deploy. Phase 14 does not mutate Cloudflare. Phase 14 freezes repository-visible Cloudflare runtime intent into a reviewable baseline only.

## Baseline Scope
- DNS ownership
- Worker route ownership
- tunnel ingress ownership
- Terraform/OpenTofu intent
- CI/PR gate posture
- release readiness evidence
- manual release governance
- break-glass governance
- secret containment posture

## Known Baseline Facts
- DNS canonical target: terraform/cloudflare-apps
- Worker routes canonical source: workers/*/wrangler.toml
- Tunnel ingress canonical source: live /etc/cloudflared/config.yml, represented only by docs/scans
- www.zeaz.dev is Worker-owned
- zeaz.dev apex remains tunnel-owned
- app.zeaz.dev remains tunnel-owned
- api-* hostnames remain tunnel-owned
- no production mutation is permitted from PR CI

## Baseline Status Table
| Area | Source of truth | Baseline status | Validator | Risk if changed |
|---|---|---|---|---|
| DNS | terraform/cloudflare-apps | Frozen | scan-dns-ownership.sh | Traffic misrouting |
| Worker Routes | workers/*/wrangler.toml | Frozen | scan-workers-routes.sh | Overriding tunnel traffic |
| Tunnel Ingress | docs/scans | Frozen | Compare checks | Tunnel bypass |
| CI/PR Gates | .github/workflows | Frozen | workflow-policy.sh | Unauthorized mutation |
| Release Governance | Phase 11-13 Evidence | Frozen | check-manual-release-approval.sh | Deployment bypass |

## Review Procedure
- baseline changes require PR review
- baseline changes must include evidence diff
- baseline changes must not include deploy/apply actions
- baseline changes must pass Phase 10-14 validators
