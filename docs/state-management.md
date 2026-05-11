# Terraform/OpenTofu State Management

## Backend Strategy

- `local` backend is supported for zero-cost bootstrap in isolated developer environments.
- `s3` backend is supported for production and CI/CD GitOps workflows.
- Real backend configuration must never be committed; use the `*.example.hcl` templates.

## Runtime Validation Contract

The following environment variables are mandatory when `TERRAFORM_BACKEND_TYPE=s3`:

- `TERRAFORM_STATE_BUCKET` (min length 3, max 63, lowercase letters, numbers, dashes, dots)
- `TERRAFORM_LOCK_TABLE` (min length 3)

For all backend types:

- `TERRAFORM_BACKEND_TYPE` must be exactly `local` or `s3`.

## Bootstrap Flow

1. Initialize locally with `local.example.hcl`.
2. Create production state bucket/table out-of-band.
3. Render non-committed `backend.hcl` from example using CI secrets.
4. Run `terraform init -backend-config=backend.hcl -reconfigure` (or `tofu init ...`).

## Security Controls

- State must be encrypted at rest.
- Backend credentials must come from ephemeral CI tokens.
- Locking is required for shared environments.
- Drift detection runs read-only plans against remote state.
