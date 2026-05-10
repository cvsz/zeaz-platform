variable "zone_id" {
  type        = string
  description = "Cloudflare zone ID"
  nullable    = false

  validation {
    condition     = can(regex("^[a-f0-9]{32}$", var.zone_id))
    error_message = "zone_id must be a 32-char lowercase hex Cloudflare zone ID."
  }
}

variable "records" {
  type = map(object({
    name     = string
    type     = string
    value    = string
    ttl      = number
    proxied  = bool
    comment  = optional(string)
    priority = optional(number)
  }))
  description = "DNS records keyed by unique logical ID."
  nullable    = false

  validation {
    condition = alltrue([
      for record in values(var.records) : contains(["A", "AAAA", "CNAME", "TXT", "MX"], upper(record.type))
    ])
    error_message = "Supported record types are A, AAAA, CNAME, TXT, and MX."
  }

  validation {
    condition = alltrue([
      for record in values(var.records) : record.ttl == 1 || (record.ttl >= 60 && record.ttl <= 86400)
    ])
    error_message = "TTL must be 1 (automatic) or between 60 and 86400 seconds."
  }
}
