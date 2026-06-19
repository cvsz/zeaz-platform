# Identity Configuration

## SAML Providers
`zero-trust/identity-providers.yaml` defines two SAML providers:
- `zeazdev-ai-saml` with attributes: `email`, `name`, `username`, `groups`, `role`, `ai_access`, `publishing_access`.
- `zeazdev-finance-saml` with attributes: `email`, `name`, `username`, `groups`, `role`, `wallet_access`, `crypto_access`.

Header contracts:
- AI: `CF-ZVEO-User`, `CF-ZVEO-Role`, `CF-ZVEO-Groups`
- Finance: `CF-ZPAY-User`, `CF-ZPAY-Role`, `CF-ZPAY-Groups`

## OIDC Fallback
OIDC is supported by setting `identity_provider_type=oidc` and passing issuer/client values securely at runtime.

## RBAC Model
Defined in `zero-trust/policies.yaml`:
- AI groups: `zveo-admin`, `zveo-creator`, `zveo-publisher`, `zveo-analytics`
- Finance groups: `wallet-admin`, `wallet-operator`, `treasury`, `compliance`, `wallet-auditor`
