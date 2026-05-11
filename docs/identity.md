# Identity Providers (F3.2)

`zero-trust/identity-providers.yaml` provides SAML and OIDC-capable templates.

## SAML Providers
- `zeazdev-ai-saml`
- `zeazdev-finance-saml`

Metadata URLs are validated as HTTPS in Terraform module inputs.
SAML private keys are never stored in this repository and must be supplied from external secret stores.

## OIDC Alternative
When `IDENTITY_PROVIDER_TYPE=oidc`, the module provisions OIDC IdPs with runtime values from secure environment variables.
