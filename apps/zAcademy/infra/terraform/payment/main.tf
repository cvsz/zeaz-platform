locals {
  name_prefix = "zacademy-${var.environment}-payment"

  tags = {
    Service     = "payment"
    Environment = var.environment
    ManagedBy   = "terraform"
    System      = "zacademy"
  }
}
