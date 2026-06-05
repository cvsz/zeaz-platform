resource "aws_security_group" "payment" {
  name        = "${local.name_prefix}-sg"
  description = "Security group for payment service"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.tags
}

resource "aws_security_group_rule" "payment_ingress" {
  for_each = toset(var.allowed_ingress_cidrs)

  type              = "ingress"
  from_port         = 8443
  to_port           = 8443
  protocol          = "tcp"
  cidr_blocks       = [each.value]
  security_group_id = aws_security_group.payment.id
  description       = "Restricted ingress for payment API"
}

resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${var.aws_region}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = [aws_security_group.payment.id]
  subnet_ids          = var.private_subnet_ids

  tags = local.tags
}

resource "aws_vpc_endpoint" "kms" {
  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${var.aws_region}.kms"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = [aws_security_group.payment.id]
  subnet_ids          = var.private_subnet_ids

  tags = local.tags
}
