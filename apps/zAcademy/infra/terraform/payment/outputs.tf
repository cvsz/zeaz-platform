output "payment_workload_role_arn" {
  value       = aws_iam_role.payment_workload.arn
  description = "IAM role ARN for payment workload service account"
}

output "payment_kms_key_arn" {
  value       = aws_kms_key.payment.arn
  description = "KMS key for payment encryption"
}

output "payment_secret_arn" {
  value       = aws_secretsmanager_secret.payment_api.arn
  description = "Secrets Manager secret ARN for payment service"
}

output "payment_security_group_id" {
  value       = aws_security_group.payment.id
  description = "Payment service security group"
}
