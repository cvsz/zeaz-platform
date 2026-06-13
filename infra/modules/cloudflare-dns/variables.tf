variable "zone_id" {
  type        = string
  description = "Cloudflare zone ID"
  nullable    = false

  validation {
    condition     = can(regex("^[a-f0-9]{32}$", var.zone_id))
    error_message = "zone_id must be a 32-char lowercase hex Cloudflare zone ID."
  }
}

variable "primary_domain" {
  type        = string
  description = "Primary DNS domain. Defaults to zeaz.dev but supports override."
  nullable    = false
  default     = "zeaz.dev"

  validation {
    condition     = can(regex("^[a-z0-9.-]+$", var.primary_domain))
    error_message = "primary_domain must be a valid lowercase domain name."
  }
}

variable "records" {
  type = map(object({
    name            = string
    type            = string
    value           = string
    ttl             = number
    proxied         = bool
    target_from     = optional(string)
    origin_host_key = optional(string)
    comment         = optional(string)
    priority        = optional(number)
  }))
  description = "DNS records keyed by unique logical ID."
  nullable    = false

  validation {
    condition = alltrue([
      for record in values(var.records) : contains(["A", "AAAA", "CNAME", "TXT", "MX"], upper(record.type))
    ])
    error_message = "Supported record types are A, AAAA, CNAME, TXT, and MX."
  }
}

variable "origin_hosts" {
  type        = map(string)
  description = "Optional map of origin host key to IP/FQDN. Required when using A/AAAA from ORIGIN_HOSTS."
  nullable    = false
  default     = {}
}
