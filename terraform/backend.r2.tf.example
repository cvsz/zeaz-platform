# =============================================================================
# backend.r2.example.tf — Cloudflare R2 state backend (OPTIONAL)
#
# THIS IS AN OPTIONAL UPGRADE that uses Cloudflare R2's S3-compatible API.
# R2 has no egress fees and a generous free tier.
#
# Do NOT enable this unless you explicitly choose to use remote state.
# Local development works fine without any backend configuration.
#
# Environment variables used (set before terraform init):
#   R2_ACCESS_KEY_ID      — R2 S3-compatible access key
#   R2_SECRET_ACCESS_KEY  — R2 S3-compatible secret key
#   R2_STATE_BUCKET       — R2 bucket name for state storage
#
# IMPORTANT:
#   - This is an EXAMPLE file (.example.tf) — Terraform will NOT load it
#   - Rename to backend.r2.tf and fill in values to activate
#   - NEVER commit real access keys or bucket names to git
#   - Requires an R2 API token with S3-compatible credentials
#   - DynamoDB-style locking is NOT available — use local locking or
#     Terraform Cloud for team environments
# =============================================================================

terraform {
  backend "s3" {
    # R2 S3-compatible endpoint
    endpoint = "https://ACCOUNT_ID.r2.cloudflarestorage.com"

    # Region must be "auto" for R2
    region = "auto"

    # Bucket name — set via R2_STATE_BUCKET env var or replace here
    bucket = "zeaz-platform-terraform-state"

    # State file key (path within the bucket)
    key = "terraform/terraform.tfstate"

    # Skip AWS-specific validation (R2 is not AWS)
    skip_region_validation      = true
    skip_credentials_validation = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true

    # Use path-style addressing (required for R2)
    force_path_style = true
  }
}
