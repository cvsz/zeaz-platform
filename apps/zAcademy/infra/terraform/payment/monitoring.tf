resource "aws_cloudwatch_log_group" "payment" {
  name              = "/zacademy/${var.environment}/payment"
  retention_in_days = 30
  kms_key_id        = aws_kms_key.payment.arn
  tags              = local.tags
}

resource "aws_cloudwatch_metric_alarm" "payment_5xx_high" {
  alarm_name          = "${local.name_prefix}-5xx-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  threshold           = 5
  metric_name         = "HTTP5XX"
  namespace           = "ZAcademy/Payment"
  period              = 60
  statistic           = "Sum"
  alarm_description   = "Payment 5xx errors exceed threshold"
  alarm_actions       = [var.alert_topic_arn]
  ok_actions          = [var.alert_topic_arn]
}

resource "aws_cloudwatch_metric_alarm" "payment_latency_high" {
  alarm_name          = "${local.name_prefix}-latency-p95-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  threshold           = 1500
  metric_name         = "LatencyP95Ms"
  namespace           = "ZAcademy/Payment"
  period              = 60
  statistic           = "Average"
  alarm_description   = "Payment p95 latency is high"
  alarm_actions       = [var.alert_topic_arn]
  ok_actions          = [var.alert_topic_arn]
}
