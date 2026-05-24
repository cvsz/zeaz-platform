# Phase F1 Configuration and Runtime Validation

Phase F1 provides strict runtime context validation before Terraform/OpenTofu or Cloudflare provisioning runs.

## Required Runtime Variables

All variables are required at runtime:

- `CF_ACCOUNT_ID`
- `CF_ZONE_ID`
- `CLOUDFLARE_API_TOKEN`
- `CF_DNS_TOKEN`
- `CF_WORKERS_TOKEN`
- `CF_ZT_TOKEN`
- `CF_WAF_TOKEN`
- `CF_TUNNEL_TOKEN`
- `CF_R2_TOKEN`
- `IDENTITY_PROVIDER_TYPE`
- `IDENTITY_PROVIDER_VENDOR`
- `IDENTITY_PROVIDER_METADATA_URL`
- `ENVIRONMENT`
- `REGION`
- `PRIMARY_DOMAIN`
- `ORIGIN_INFRA_TYPE`
- `ORIGIN_HOSTS`
- `TERRAFORM_BACKEND_TYPE`
- `TERRAFORM_STATE_BUCKET`
- `TERRAFORM_LOCK_TABLE`
- `SOPS_AGE_KEY`
- `SECRET_ROTATION_INTERVAL`
- `CLOUDFLARE_PLAN_TIER`

## Validation Rules

- `CF_ACCOUNT_ID` and `CF_ZONE_ID` must be 32-character hexadecimal strings.
- Token variables must be present; values are never printed in logs.
- `ENVIRONMENT` must be `dev`, `staging`, or `prod`.
- `CLOUDFLARE_PLAN_TIER` must be `Free`, `Pro`, `Business`, or `Enterprise`.
- `IDENTITY_PROVIDER_TYPE` must be `saml` or `oidc`.
- `IDENTITY_PROVIDER_METADATA_URL` must be a valid `https://` URL.
- `ORIGIN_HOSTS` must be a comma-separated hostname list or JSON string array.
- `SECRET_ROTATION_INTERVAL` must be a positive duration (`30d`, `12h`, `45m`, or numeric days).

## Validation Modes

- `--offline`: local variable and format checks only; skips all Cloudflare API calls.
- `--api-check`: performs Cloudflare token verification after local checks pass.
- `--json`: machine-readable output suitable for CI/GitOps pipelines.
- `--strict`: warnings become failures (non-zero exit).

> Cloudflare APIs are never called unless `--api-check` is explicitly provided.

## Usage

```bash
bash scripts/validate.sh --offline --strict
bash scripts/validate.sh --offline --json
bash scripts/validate.sh --api-check --strict
```
