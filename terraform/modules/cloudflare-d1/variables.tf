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
