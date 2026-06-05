resource "aws_secretsmanager_secret" "payment_api" {
  name                    = "${local.name_prefix}/api"
  kms_key_id              = aws_kms_key.payment.arn
  recovery_window_in_days = 30
  tags                    = local.tags
}

resource "aws_secretsmanager_secret_version" "payment_api" {
  secret_id     = aws_secretsmanager_secret.payment_api.id
  secret_string = jsonencode(var.payment_api_secret_values)
}

resource "aws_secretsmanager_secret_rotation" "payment_api" {
  secret_id           = aws_secretsmanager_secret.payment_api.id
  rotation_lambda_arn = var.payment_service_secret_rotation_lambda_arn

  rotation_rules {
    automatically_after_days = 30
  }
}
