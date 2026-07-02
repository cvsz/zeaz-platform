# Clean baseline Terraform root.
# Keep CI validation offline and repo-local. Add modules here only after they
# are available without private registry credentials or are guarded by a
# documented, opt-in operator workflow.

output "cloudflare_account_id" {
  value = var.cloudflare_account_id
}

output "cloudflare_zone_id" {
  value = var.cloudflare_zone_id
}

output "primary_domain" {
  value = var.primary_domain
}
