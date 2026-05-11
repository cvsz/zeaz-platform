variable "cf_api_token" {
  type      = string
  sensitive = true
  nullable  = false
}

variable "cf_account_id" {
  type = string
  validation {
    condition     = can(regex("^[a-f0-9]{32}$", var.cf_account_id))
    error_message = "cf_account_id must be 32 hex chars"
  }
}

variable "cf_zone_id" {
  type = string
  validation {
    condition     = can(regex("^[a-f0-9]{32}$", var.cf_zone_id))
    error_message = "cf_zone_id must be 32 hex chars"
  }
}

variable "domain" {
  type    = string
  default = "zeaz.dev"
  validation {
    condition     = var.domain == "zeaz.dev"
    error_message = "domain must be zeaz.dev"
  }
}

variable "plan_tier" {
  type = string
  validation {
    condition     = contains(["Free", "Pro", "Business", "Enterprise"], var.plan_tier)
    error_message = "invalid plan"
  }
}
