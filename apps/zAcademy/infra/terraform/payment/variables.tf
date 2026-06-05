variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "environment" {
  type        = string
  description = "Environment name"
}

variable "cluster_name" {
  type        = string
  description = "EKS cluster name"
}

variable "oidc_provider_arn" {
  type        = string
  description = "EKS OIDC provider ARN"
}

variable "oidc_provider_url" {
  type        = string
  description = "EKS OIDC issuer URL"
}

variable "k8s_namespace" {
  type        = string
  description = "Kubernetes namespace"
  default     = "payment"
}

variable "k8s_service_account" {
  type        = string
  description = "Kubernetes service account name"
  default     = "payment-service"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs"
}

variable "allowed_ingress_cidrs" {
  type        = list(string)
  description = "Allowed ingress CIDRs"
  default     = []
}

variable "alert_topic_arn" {
  type        = string
  description = "SNS topic ARN for alerts"
}

variable "payment_service_secret_rotation_lambda_arn" {
  type        = string
  description = "Lambda ARN used by Secrets Manager rotation"
}

variable "payment_api_secret_values" {
  type        = map(string)
  description = "Initial payment secret values. Expected keys: marqeta_app_token, marqeta_access_token, webhook_secret"
  sensitive   = true
}
