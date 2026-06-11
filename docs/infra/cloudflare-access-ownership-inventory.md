# Cloudflare Access Ownership Inventory

Generated: 2026-06-11T20:31:37Z
Commands: `infra/cloudflare/scripts/scan-cloudflare-access-ownership.sh --markdown`

## Purpose
Offline scanner for Access / Zero Trust ownership evidence.

## Inventory
| File | Resource Type | Resource Name | Domain/Name | Risk | Recommendation |
|---|---|---|---|---|---|
| ./.backup/terraform-broken-20260516T094429Z/modules/cloudflare-tunnel/main.tf | cloudflare_zero_trust_tunnel_cloudflared_config | this | <not visible> | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/modules/cloudflare-saml-provider/main.tf | cloudflare_zero_trust_access_identity_provider | saml | <not visible> | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/modules/cloudflare-saml-provider/main.tf | cloudflare_zero_trust_access_identity_provider | oidc | <not visible> | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/modules/cloudflare-access-policy/main.tf | cloudflare_zero_trust_access_policy | this | <not visible> | ok | none |
| ./opentofu/modules/cloudflare-tunnel/main.tf | cloudflare_zero_trust_tunnel_cloudflared | this | <not visible> | ok | none |
| ./opentofu/modules/cloudflare-saml-provider/main.tf | cloudflare_access_identity_provider | saml | <not visible> | ok | none |
| ./opentofu/modules/cloudflare-saml-provider/main.tf | cloudflare_access_identity_provider | oidc | <not visible> | ok | none |
| ./opentofu/modules/cloudflare-access-app/main.tf | cloudflare_access_application | this | <not visible> | ok | none |
| ./opentofu/modules/cloudflare-access-policy/main.tf | cloudflare_access_policy | this | <not visible> | ok | none |

## Risks and Manual Review
- Check for orphaned Access apps, domain overlaps, missing owners, and stale syntax.
