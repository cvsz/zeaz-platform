variable "account_id" { type = string, nullable = false, description = "Cloudflare account ID." }
variable "application_id" { type = string, nullable = false, description = "Access application ID." }
variable "name" { type = string, nullable = false, description = "Policy name." }
variable "precedence" { type = number, nullable = false, default = 1, description = "Policy precedence." }
variable "decision" { type = string, nullable = false, default = "allow", description = "Policy decision." }
variable "include_groups" { type = list(string), nullable = false, default = [], description = "Zero Trust group IDs to include." }
variable "require_mfa" { type = bool, nullable = false, default = true, description = "Require MFA." }
