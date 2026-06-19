# Zero Trust Phase F3

Phase F3 provisions Cloudflare Access applications and policy wiring for:
- auth.zeaz.dev
- zveo.zeaz.dev
- studio.zeaz.dev
- analytics.zeaz.dev
- app.zeaz.dev
- pay.zeaz.dev
- treasury.zeaz.dev
- admin-wallet.zeaz.dev

## Terraform Wiring
- `terraform/access.tf` creates both identity providers and all Access applications through modules.
- App resources are generated from a single deterministic local map to keep configuration idempotent.
- Access policies are attached to each app with MFA required.

## Runtime Inputs
- `identity_provider_type` supports `saml` and `oidc`.
- `identity_provider_metadata_url` is required and validated as HTTPS.
- `environment` and `domain` drive deterministic app naming and hostnames.

## Security Baseline
- Every app requires MFA.
- Fintech applications use session durations of 4h or less.
- App definitions and policy requirements are versioned in `zero-trust/apps.yaml` and `zero-trust/policies.yaml`.
