data "aws_iam_policy_document" "payment_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Federated"
      identifiers = [var.oidc_provider_arn]
    }

    actions = ["sts:AssumeRoleWithWebIdentity"]

    condition {
      test     = "StringEquals"
      variable = "${replace(var.oidc_provider_url, "https://", "")}:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "${replace(var.oidc_provider_url, "https://", "")}:sub"
      values   = ["system:serviceaccount:${var.k8s_namespace}:${var.k8s_service_account}"]
    }
  }
}

resource "aws_iam_role" "payment_workload" {
  name               = "${local.name_prefix}-workload"
  assume_role_policy = data.aws_iam_policy_document.payment_assume_role.json
  tags               = local.tags
}

data "aws_iam_policy_document" "payment_workload" {
  statement {
    sid    = "SecretsReadOnly"
    effect = "Allow"
    actions = [
      "secretsmanager:DescribeSecret",
      "secretsmanager:GetSecretValue"
    ]
    resources = [aws_secretsmanager_secret.payment_api.arn]
  }

  statement {
    sid    = "KMSUseOnly"
    effect = "Allow"
    actions = [
      "kms:Decrypt",
      "kms:DescribeKey"
    ]
    resources = [aws_kms_key.payment.arn]
  }

  statement {
    sid    = "CloudWatchMetricsWrite"
    effect = "Allow"
    actions = [
      "cloudwatch:PutMetricData"
    ]
    resources = ["*"]
  }

  statement {
    sid    = "XRayWrite"
    effect = "Allow"
    actions = [
      "xray:PutTraceSegments",
      "xray:PutTelemetryRecords"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "payment_workload" {
  name   = "${local.name_prefix}-workload"
  policy = data.aws_iam_policy_document.payment_workload.json
}

resource "aws_iam_role_policy_attachment" "payment_workload" {
  role       = aws_iam_role.payment_workload.name
  policy_arn = aws_iam_policy.payment_workload.arn
}
