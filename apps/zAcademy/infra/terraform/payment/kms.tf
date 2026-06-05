data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "kms_key_policy" {
  statement {
    sid    = "EnableRootPermissions"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }

    actions   = ["kms:*"]
    resources = ["*"]
  }

  statement {
    sid    = "AllowPaymentRoleUsage"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = [aws_iam_role.payment_workload.arn]
    }

    actions = [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:GenerateDataKey",
      "kms:GenerateDataKeyWithoutPlaintext",
      "kms:ReEncryptFrom",
      "kms:ReEncryptTo"
    ]

    resources = ["*"]
  }
}

resource "aws_kms_key" "payment" {
  description             = "${local.name_prefix} encryption key"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  policy                  = data.aws_iam_policy_document.kms_key_policy.json
  tags                    = local.tags
}

resource "aws_kms_alias" "payment" {
  name          = "alias/${local.name_prefix}"
  target_key_id = aws_kms_key.payment.key_id
}
