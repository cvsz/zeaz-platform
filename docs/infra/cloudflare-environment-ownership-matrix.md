# Cloudflare Environment Ownership Matrix

Phase 18 defines review ownership for Cloudflare environment intent. This matrix is
policy-only and does not authorize deployment or infrastructure mutation.

| Environment | Resource Type | Owner | Approval Required | Evidence Required |
|---|---|---|---|---|
| dev | Hostname intent | Platform Engineering | Peer review | Validation summary |
| dev | Worker routes | Edge Platform | Peer review | Route scan output |
| dev | Terraform/OpenTofu workspace | Platform Engineering | Peer review | Plan-only validation |
| dev | Access policy intent | Security Engineering | Security peer review | Policy diff summary |
| dev | Tunnel routing intent | Platform Engineering | Peer review | Boundary scan output |
| staging | Hostname intent | Platform Engineering | Platform lead review | Validation summary and sign-off |
| staging | Worker routes | Edge Platform | Platform lead review | Route scan output and promotion note |
| staging | Terraform/OpenTofu workspace | Platform Engineering | Platform lead review | Plan-only validation and state owner note |
| staging | Access policy intent | Security Engineering | Security lead review | Policy diff summary and MFA confirmation |
| staging | Tunnel routing intent | Platform Engineering | Platform lead review | Boundary scan output and rollback note |
| prod | Hostname intent | Platform Engineering | Phase 15 review board for High/Critical | Phase 16 evidence archive entry |
| prod | Worker routes | Edge Platform | Phase 15 review board for High/Critical | CI report, route scan, baseline diff |
| prod | Terraform/OpenTofu workspace | Platform Engineering | Phase 15 review board for High/Critical | Plan-only validation, risk score, approval record |
| prod | Access policy intent | Security Engineering | Security lead plus Phase 15 review board for High/Critical | Policy diff, risk score, approval record |
| prod | Tunnel routing intent | Platform Engineering | Phase 15 review board for High/Critical | Runtime baseline diff, rollback plan, post-release verification |
| prod | Evidence and release records | SRE | Release owner approval | CI report, release approval, post-release verification |

## Ownership Notes

- Dev ownership optimizes fast feedback but still requires peer review.
- Staging ownership requires release-readiness context and sign-off.
- Prod ownership requires stronger gates because prod changes can affect live
  routing, security posture, and rollback complexity.
- Finance hostnames and policies require Security Engineering review even when the
  technical owner is Platform Engineering.
