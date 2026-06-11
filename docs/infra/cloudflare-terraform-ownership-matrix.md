# Cloudflare Terraform Ownership Matrix (Phase 8)

This document inventories all Terraform/OpenTofu Cloudflare resources across the repository.

## DNS Records

| Resource Type | Resource Name | Terraform File | Owner App | Environment | Live Overlap Risk | Recommendation |
|---------------|---------------|----------------|-----------|-------------|-------------------|----------------|
| `cloudflare_dns_record` | `app_routes` | `terraform/cloudflare-apps/main.tf` | Multiple | Prod | High (Tunnel routing) | Retain and make canonical. Import live records. |
| `cloudflare_record` | `ingress_records` | `terraform/cloudflare/main.tf` | Legacy | Prod | High (Conflict with apps) | Archive/Destroy module. Migrate to `cloudflare-apps`. |
| `cloudflare_dns_record` | `zdash` | `terraform/zdash/main.tf` | Legacy ZDash | Prod | High (Conflict with apps) | Archive/Destroy module. Migrate to `cloudflare-apps`. |
| `cloudflare_record` | `records` | `opentofu/modules/cloudflare-dns/main.tf` | OpenTofu Generic | Any | Low | Retain module for specific domain setups. |

## Tunnels & Zero Trust

| Resource Type | Resource Name | Terraform File | Owner App | Environment | Live Overlap Risk | Recommendation |
|---------------|---------------|----------------|-----------|-------------|-------------------|----------------|
| `cloudflare_zero_trust_tunnel_cloudflared` | `this` | `opentofu/modules/cloudflare-tunnel/main.tf` | OpenTofu Tunnel | Any | Low | Review and decide whether to manage existing manual tunnel via IaC. |
| `cloudflare_access_application` | `this` | `opentofu/modules/cloudflare-access-app/main.tf` | OpenTofu Access | Any | Low | Enforce IaC-based Zero Trust policies. |
| `cloudflare_access_policy` | `this` | `opentofu/modules/cloudflare-access-policy/main.tf` | OpenTofu Access | Any | Low | Enforce IaC-based Zero Trust policies. |
| `cloudflare_access_identity_provider` | `saml` / `oidc` | `opentofu/modules/cloudflare-saml-provider/main.tf` | IdP | Any | Low | Provision IdP connections through IaC. |

## Workers & Developer Platform

| Resource Type | Resource Name | Terraform File | Owner App | Environment | Live Overlap Risk | Recommendation |
|---------------|---------------|----------------|-----------|-------------|-------------------|----------------|
| `cloudflare_worker_script` | `this` | `opentofu/modules/cloudflare-workers/main.tf` | Workers | Any | Medium | Ensure worker routing uses explicit IaC rules, watch out for conflicts with `cloudflare-apps`. |
| `cloudflare_r2_bucket` | `this` | `opentofu/modules/cloudflare-r2/main.tf` | R2 Storage | Any | Low | Retain module. |
| `cloudflare_d1_database` | `this` | `opentofu/modules/cloudflare-d1/main.tf` | D1 Storage | Any | Low | Retain module. |

## WAF & Security

| Resource Type | Resource Name | Terraform File | Owner App | Environment | Live Overlap Risk | Recommendation |
|---------------|---------------|----------------|-----------|-------------|-------------------|----------------|
| `cloudflare_ruleset` | `api_shield_schema_validation` | `opentofu/modules/cloudflare-api-shield/main.tf` | Security | Any | Low | Ensure API Gateway is guarded by this. |
| `cloudflare_ruleset` | `waf_managed` / `firewall_custom` | `opentofu/modules/cloudflare-waf/main.tf` | Security | Any | Low | Standardize WAF across zones. |
| `cloudflare_zone_settings_override` | `tls_hardening` | `opentofu/modules/cloudflare-waf/main.tf` | Security | Any | Low | Ensure TLS 1.2+ is enforced. |
