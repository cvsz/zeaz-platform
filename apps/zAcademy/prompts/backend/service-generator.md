Generate enterprise backend service.

Requirements:

Bounded Context:

{{DOMAIN}}

Service:

{{SERVICE_NAME}}

Language:

{{LANGUAGE}}

Must Generate:

- cmd/server
- internal/domain
- internal/application
- internal/infrastructure
- internal/transport
- config
- migration
- tests

Requirements:

- Health endpoint
- Metrics endpoint
- OpenTelemetry
- Structured Logging
- Graceful Shutdown
- Retry Strategy
- Configuration Validation
- RBAC
- Audit Trail

Security:

- OWASP ASVS
- Least Privilege
- Secret Isolation

Output full implementation.
No TODO.
No placeholder.
