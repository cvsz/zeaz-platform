output "module_name" {
  value = "cloudflare-saml-provider"

output "identity_provider_id" {
  description = "Cloudflare Access identity provider ID"
  value       = var.provider_type == "saml" ? cloudflare_zero_trust_access_identity_provider.saml[0].id : cloudflare_zero_trust_access_identity_provider.oidc[0].id
