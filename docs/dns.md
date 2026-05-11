# DNS Model (F4.1)

`dns/records.yaml` is the source of truth for platform hostnames.

## Defaults and Overrides
- Default primary domain is `zeaz.dev`.
- Terraform module input `primary_domain` supports override for multi-zone or alternate domains.
- No hardcoded origin IP addresses are allowed in the DNS model.

## Record Strategy
- All platform application records are CNAME records.
- CNAME targets are derived from tunnel endpoint (`<tunnel_id>.cfargotunnel.com`).
- `proxied: true` is required for edge security controls and WAF enforcement.

## Required Hosts
- auth.zeaz.dev
- zveo.zeaz.dev
- studio.zeaz.dev
- analytics.zeaz.dev
- app.zeaz.dev
- pay.zeaz.dev
- treasury.zeaz.dev
- admin-wallet.zeaz.dev
