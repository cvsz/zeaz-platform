# Fintech Security Profiles (F3.3)

Applies to `app`, `pay`, `treasury`, and `admin-wallet` domains.

Required controls:
- MFA and WebAuthn.
- Session TTL <= 4h.
- Step-up authentication.
- Geo restriction hooks.
- JWT verification.
- Sensitive action re-authentication.

Enterprise-only controls are gated:
- mTLS Client Auth (Enterprise plan only)
- API Shield (Enterprise plan only)
