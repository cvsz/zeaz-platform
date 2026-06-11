# Cloudflare Terraform Ownership Inventory

Generated: 2026-06-11T20:31:18Z
Commands: `infra/cloudflare/scripts/scan-terraform-cloudflare-ownership.sh --markdown`

## Purpose
This document maps all Cloudflare-related Terraform/OpenTofu resources against existing DNS, Tunnel, Worker, Access, AI Gateway, Edge Gateway, and runtime ownership evidence. No-mutation policy applies.

## Inventory
| File | Resource Type | Resource Name | Hostname/Name | Owner Category | Risk | Recommendation |
|---|---|---|---|---|---|---|
| ./.backup/terraform-broken-20260516T094429Z/waf.tf | cloudflare_ruleset | waf_entrypoint | <not visible> | ruleset | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/modules/cloudflare-api-shield/main.tf | cloudflare_ruleset | api_shield_schema_validation | <not visible> | ruleset | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/modules/cloudflare-tunnel/main.tf | cloudflare_zero_trust_tunnel_cloudflared_config | this | <not visible> | access | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/modules/cloudflare-saml-provider/main.tf | cloudflare_zero_trust_access_identity_provider | saml | <not visible> | access | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/modules/cloudflare-saml-provider/main.tf | cloudflare_zero_trust_access_identity_provider | oidc | <not visible> | access | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/modules/cloudflare-dns/main.tf | cloudflare_record | records | <not visible> | dns | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/modules/cloudflare-access-policy/main.tf | cloudflare_zero_trust_access_policy | this | <not visible> | access | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/modules/cloudflare-waf/main.tf | cloudflare_zone_settings_override | tls_hardening | <not visible> | unknown | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/modules/cloudflare-waf/main.tf | cloudflare_ruleset | waf_managed | <not visible> | ruleset | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/modules/cloudflare-waf/main.tf | cloudflare_ruleset | firewall_custom | <not visible> | ruleset | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/modules/cloudflare-waf/main.tf | cloudflare_ruleset | cache | <not visible> | ruleset | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/modules/cloudflare-waf/main.tf | cloudflare_ruleset | redirects | <not visible> | ruleset | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/tokens/main.tf | cloudflare_account_token | dns | <not visible> | unknown | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/tokens/main.tf | cloudflare_account_token | workers | <not visible> | unknown | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/tokens/main.tf | cloudflare_account_token | pages | <not visible> | unknown | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/tokens/main.tf | cloudflare_account_token | r2 | <not visible> | unknown | ok | none |
| ./.backup/terraform-broken-20260516T094429Z/tokens/main.tf | cloudflare_account_token | d1 | <not visible> | unknown | ok | none |
| ./opentofu/modules/cloudflare-r2/main.tf | cloudflare_r2_bucket | this | <not visible> | storage | ok | none |
| ./opentofu/modules/cloudflare-api-shield/main.tf | cloudflare_ruleset | api_shield_schema_validation | api-shield-schema-validation | ruleset | ok | none |
| ./opentofu/modules/cloudflare-tunnel/main.tf | cloudflare_zero_trust_tunnel_cloudflared | this | <not visible> | access | ok | none |
| ./opentofu/modules/cloudflare-saml-provider/main.tf | cloudflare_access_identity_provider | saml | <not visible> | access | ok | none |
| ./opentofu/modules/cloudflare-saml-provider/main.tf | cloudflare_access_identity_provider | oidc | <not visible> | access | ok | none |
| ./opentofu/modules/cloudflare-access-app/main.tf | cloudflare_access_application | this | <not visible> | access | ok | none |
| ./opentofu/modules/cloudflare-d1/main.tf | cloudflare_d1_database | this | <not visible> | storage | ok | none |
| ./opentofu/modules/cloudflare-dns/main.tf | cloudflare_record | records | <not visible> | dns | ok | none |
| ./opentofu/modules/cloudflare-access-policy/main.tf | cloudflare_access_policy | this | <not visible> | access | ok | none |
| ./opentofu/modules/cloudflare-workers/main.tf | cloudflare_worker_script | this | <not visible> | worker | ok | none |
| ./opentofu/modules/cloudflare-waf/main.tf | cloudflare_zone_settings_override | tls_hardening | <not visible> | unknown | ok | none |
| ./opentofu/modules/cloudflare-waf/main.tf | cloudflare_ruleset | waf_managed | managed-waf | ruleset | ok | none |
| ./opentofu/modules/cloudflare-waf/main.tf | cloudflare_ruleset | firewall_custom | firewall-custom | ruleset | ok | none |
| ./opentofu/modules/cloudflare-waf/main.tf | cloudflare_ruleset | cache | cache-rules | ruleset | ok | none |
| ./opentofu/modules/cloudflare-waf/main.tf | cloudflare_ruleset | redirects | redirect-rules | ruleset | ok | none |
| ./terraform/cloudflare/main.tf | cloudflare_record | ingress_records | <not visible> | dns | ok | none |
| ./terraform/cloudflare-apps/main.tf | cloudflare_dns_record | app_routes | <not visible> | dns | ok | none |
| ./terraform/zdash/main.tf | cloudflare_dns_record | zdash | <not visible> | dns | ok | none |

## Manual Decisions
- Confirm canonical Terraform DNS module.
- Decide whether www.zeaz.dev DNS CNAME should be removed in a later PR.
- Decide whether Worker routes remain Wrangler-owned or migrate to Terraform.
- Decide whether stale tunnel Terraform modules should be retired.
- Confirm Access/Zero Trust owner model.
- Confirm AI Gateway / Edge Gateway ownership model.
