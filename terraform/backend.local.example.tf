# backend.local.example.tf — Local state backend (default, no-cost)
#
# This is the DEFAULT backend for local development and no-cost operation.
# State is stored locally on disk.
#
# IMPORTANT:
#   - Local state must NEVER be committed to git (it IS in .gitignore)
#   - Share state via team sync, not git
#   - For team environments, see backend.s3.example.tf or backend.r2.example.tf
#
# Usage:
#   terraform init
#
# No configuration needed — local is the Terraform default.
