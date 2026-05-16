output "module_name" {
  value = "cloudflare-access-app"

output "application_id" {
  description = "Cloudflare Access application ID"
  value       = cloudflare_zero_trust_access_application.this.id
