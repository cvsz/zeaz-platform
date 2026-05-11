variable "zone_id" {
  type        = string
  description = "Zone ID"
  nullable    = false
  default     = ""

  validation {
    condition     = var.zone_id == "" || can(regex("^[a-f0-9]{32}$", var.zone_id))
    error_message = "bad zone id"
  }
}

variable "account_id" {
  type        = string
  description = "Account ID"
  nullable    = true
  default     = null
}

variable "name" {
  type        = string
  description = "Resource name"
  nullable    = true
  default     = null
}

variable "records" {
  type        = map(string)
  description = "records"
  nullable    = true
  default     = {}
}
