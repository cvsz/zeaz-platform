# Cloudflare Terraform Reconciliation Plan

## Canonical Ownership Model

- **DNS CNAME records for tunnel-backed apps** belong to canonical Terraform DNS module.
- **Worker routes** belong to Wrangler Worker config unless explicitly migrated.
- **Tunnel ingress** belongs to runtime tunnel config until IaC migration is approved.
- **Access/Zero Trust** belongs to Access governance module/docs.
- **AI Gateway / Edge Gateway** resources must have explicit owner before production use.

**Rule**: Do not mix ownership for same hostname.

## Reconciliation phases after Phase 8:

- **Phase 9**: Access + Zero Trust security governance.
- **Phase 10**: CI enforcement.
- **Phase 11**: controlled Terraform cleanup proposal.

## Manual Action Queue
- Confirm canonical Terraform DNS module.
- Decide whether www.zeaz.dev DNS CNAME should be removed in a later PR.
- Decide whether Worker routes remain Wrangler-owned or migrate to Terraform.
- Decide whether stale tunnel Terraform modules should be retired.
- Confirm Access/Zero Trust owner model.
- Confirm AI Gateway / Edge Gateway ownership model.
