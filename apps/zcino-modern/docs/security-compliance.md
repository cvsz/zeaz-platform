# Security and Compliance

## Security posture

Zcino includes defensive controls appropriate for a catalog and analytics service, including JWT-based admin access, conservative global policy blocking, tenant header support, request rate limiting, input validation, structured logging, and production secret checks. These controls should be integrated with enterprise identity, network policy, centralized logging, and data governance before public production exposure.

## Authentication and authorization

| Area | Current behavior | Enterprise recommendation |
| --- | --- | --- |
| Token issuance | `/auth/token` issues demo JWTs from configured `user_id`/password values. | Replace with OIDC/Auth.js/Okta/internal identity gateway. |
| Admin authorization | `/admin/whoami` requires bearer token claims with the `admin` role. | Enforce least privilege roles and audit admin endpoint access. |
| JWT signing | `JWT_SECRET` signs tokens; default is rejected outside development. | Store in secret manager, rotate regularly, and use asymmetric signing if multiple services validate tokens. |
| Token TTL | Default is 24 hours. | Shorten production TTLs and rely on managed refresh/session policy. |

## Tenant isolation

The tenant middleware supports strict tenant requirements through `TENANT_REQUIRED` and reads `X-Tenant-ID`. When disabled, tracking uses a default public tenant. Before offering hard multi-tenant guarantees, implement and verify:

- authenticated tenant-to-user authorization;
- tenant propagation into all read/write repository queries;
- tenant-aware cache keys;
- tenant-scoped metrics and logs;
- retention, export, and deletion workflows per tenant;
- cross-tenant negative tests.

## Policy guardrails

The global policy guard inspects request paths, raw queries, headers, and write-method bodies for prohibited terms in these categories:

- wallet endpoints;
- betting endpoints;
- payment handling.

Blocked requests return `403` with a `policy_blocked` error and category. Inspection failures also return `403` with `policy_inspection_failed`.

### Intended use

The guard is a conservative safety layer that helps keep the service focused on catalog, discovery, analytics, and protocol experimentation. It is not a replacement for legal review, product compliance, identity verification, payment compliance, or gaming regulatory controls.

### Operational cautions

- Headers from upstream gateways can trigger false positives if they include prohibited terms.
- Free-form client metadata can trigger false positives.
- The policy is global, so adding new write endpoints requires careful request vocabulary review.
- Allowlist or exemption changes must include tests and documented risk acceptance.

## Input validation

| Surface | Validation controls |
| --- | --- |
| Catalog filters | Positive page/per-page parsing, numeric RTP parsing, domain validation. |
| Game domain model | Required IDs and strings, RTP bounds, volatility enum, thumbnail URL validation. |
| Tracking body | Unknown JSON fields are rejected, multiple JSON objects are rejected, body size is bounded. |
| Tracking event | Required tenant/game/session/time, field length limits, metadata limits, non-negative duration, click-target rules. |
| Database | Check constraints, foreign keys, enum values, and indexes reinforce application validation. |

## Rate limiting and abuse resistance

The backend uses an in-process token bucket keyed by client IP. This provides basic abuse protection but has limitations:

- limits are per replica, not global;
- IP extraction trusts `X-Forwarded-For` and `X-Real-IP`, so production must sanitize these headers at the edge;
- bot mitigation, WAF rules, and partner-specific quotas should be handled by an ingress or API gateway.

## Secrets management

Secrets and sensitive configuration include:

- `POSTGRES_DSN`;
- `REDIS_PASSWORD`;
- `JWT_SECRET`;
- `DEMO_ADMIN_PASS` while demo auth remains enabled;
- `NATS_URL` if it embeds credentials;
- frontend environment variables that point to internal APIs or streaming infrastructure.

Do not commit secrets to the repository. Use platform secret managers, inject runtime environment variables, and prefer short-lived credentials when available.

## Logging and audit

The service logs HTTP method, path, status, duration, and remote address. Policy blocks include category and match in warning logs. Enterprise deployments should:

- centralize logs with retention and access controls;
- avoid logging full request bodies or sensitive metadata;
- add request IDs/correlation IDs at the edge;
- alert on policy blocks, auth failures, repeated 5xx responses, and tracking flush failures;
- preserve admin access logs for audit review.

## Data handling

Tracking events may contain user identifiers, session identifiers, countries, referrer URLs, affiliate identifiers, campaign identifiers, and metadata. Treat this as personal or partner-sensitive data until classified otherwise.

Minimum controls before production:

- classify tracking fields by sensitivity;
- redact or normalize referrer query strings if they can include tokens or personal data;
- document retention periods;
- implement tenant/user deletion and export workflows where legally required;
- prohibit payment, wallet, betting, secrets, and identity-document data in metadata.

## Compliance checklist for production launch

- [ ] Demo auth replaced or isolated behind enterprise identity.
- [ ] Production `JWT_SECRET` stored in a managed secret system and rotated.
- [ ] TLS enforced at ingress and for managed datastore connections where supported.
- [ ] Edge gateway sanitizes forwarded IP headers.
- [ ] Rate limits reviewed against partner traffic profiles.
- [ ] Tenant isolation tested end-to-end if `TENANT_REQUIRED=true`.
- [ ] Policy false-positive and exemption process documented.
- [ ] Database backups and restore drills completed.
- [ ] Centralized logging, metrics, and alerting configured.
- [ ] Tracking data retention and privacy controls approved.
