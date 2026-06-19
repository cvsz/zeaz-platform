# Fintech Security Controls

Applies to `app.zeaz.dev`, `pay.zeaz.dev`, `treasury.zeaz.dev`, and `admin-wallet.zeaz.dev`.

## Mandatory Controls
- MFA required
- WebAuthn and hardware security keys required
- Session TTL capped at 4 hours
- Step-up authentication for sensitive operations
- Geo restriction hooks for country allowlisting
- JWT verification for protected APIs
- Audit logging hooks enabled

## Enterprise-Gated Controls
`policies/fintech-access.yaml` marks mTLS client auth and API Shield as enabled only on `Enterprise` plan.

## JWT Policy
`policies/fintech-jwt.yaml` enforces:
- required JWT validation
- strict claim requirements (`sub`, `exp`, `iat`, `iss`, `aud`, `scope`)
- bounded clock skew
- sensitive path coverage for transfer, withdraw, and payout operations
