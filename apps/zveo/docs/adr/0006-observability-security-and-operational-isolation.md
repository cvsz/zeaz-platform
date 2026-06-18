# ADR 0006: Observability, Security, and Operational Isolation

## Status
Accepted

## Context
A media factory spans HTTP ingress, Redis queues, workers, object storage, databases, provider APIs, and FFmpeg execution. Incidents are difficult to resolve unless every component exposes consistent telemetry and prevents tenant or credential leakage.

## Decision
zVEO treats observability, security, and isolation as runtime requirements. Services emit structured logs, Prometheus metrics, and trace context. API access requires signed bearer tokens and RBAC permissions. Infrastructure uses least-privilege service accounts, network policies, disruption budgets, encrypted storage, secret rotation, and isolated worker pools.

## Implementation boundaries

- `packages/core` owns logger, metric, tracing, RBAC, secret, rate-limiter, circuit-breaker, bulkhead, and recovery utilities.
- `apps/zeaz-api-gateway` exposes health, readiness, metrics, OpenAPI, authenticated workflow submission, and media pipeline submission.
- Kubernetes manifests define service isolation, autoscaling, PDBs, and blue/green rollout controls.
- Terraform defines encrypted, versioned, replicated object storage with public access blocked.

## Consequences

- Operators can correlate API requests, queue jobs, worker logs, DLQ records, and export manifests.
- Tenant authorization failures stop before side effects.
- Provider incidents are contained by circuit breakers, bulkheads, and queue isolation.

## Trade-offs

- Production deployments require explicit secret, metric, and rollout configuration.
- More telemetry increases cardinality risk and must be reviewed before adding labels.
