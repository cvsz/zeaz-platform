# Zero Trust Access Application Model (F3.1)

This phase defines environment-scoped Access applications and RBAC policies for:
`auth`, `zveo`, `studio`, `analytics`, `app`, `pay`, `treasury`, and `admin-wallet`.

## Security Controls
- MFA required for all apps.
- Finance domains enforce session durations at or below 4h.
- Service token support is enabled per application.
- Audit hooks are configured in `zero-trust/policies.yaml` for log pipelines.
- Environment-specific naming uses `zeazdev-${ENVIRONMENT}-*`.
