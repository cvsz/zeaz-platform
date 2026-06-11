# =============================================================================
# backend.s3.example.tf — AWS S3 + DynamoDB state backend (OPTIONAL)
#
# THIS IS AN OPTIONAL UPGRADE that requires paid AWS infrastructure:
#   - S3 bucket for state storage (~$0.023/GB/month)
#   - DynamoDB table for state locking (~$0.25/month for low usage)
#
# Do NOT enable this unless you explicitly choose to use remote state.
# Local development works fine without any backend configuration.
#
# Environment variables used (set before terraform init):
#   TF_STATE_BUCKET  — S3 bucket name
#   TF_LOCK_TABLE    — DynamoDB table name for state locking
#   AWS_REGION       — AWS region (e.g. us-east-1)
#
# IMPORTANT:
#   - This is an EXAMPLE file (.example.tf) — Terraform will NOT load it
#   - Rename to backend.s3.tf and fill in values to activate
#   - NEVER commit real bucket names or credentials to git
# =============================================================================

terraform {
  backend "s3" {
    # Replace with your bucket name or use TF_STATE_BUCKET env var
    bucket = "example-terraform-state-bucket"

    # State file key (path within the bucket)
    key = "zeaz-platform/terraform.tfstate"

    # AWS region
    region = "us-east-1"

    # DynamoDB table for state locking and consistency
    dynamodb_table = "example-terraform-locks"

    # Enable server-side encryption
    encrypt = true

    # Skip validation for local/testing — remove for production use
    skip_region_validation      = true
    skip_credentials_validation = true
  }
}
