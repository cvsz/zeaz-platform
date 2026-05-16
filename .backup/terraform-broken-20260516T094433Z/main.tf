# Clean baseline Terraform root.
# Re-add modules only after CI is green.

output "cloudflare_account_id" {
  value = var.cloudflare_account_id
}

output "cloudflare_zone_id" {
  value = var.cloudflare_zone_id
}

output "primary_domain" {
  value = var.primary_domain
}
