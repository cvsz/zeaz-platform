# Production Capability Implementation Guide

This guide maps the production implementation to the requested phase output format. Source is intentionally organized so browser automation is only an execution adapter: scene continuity, prompt compilation, queues, recovery, security, observability, and provider protection live in reusable packages and service boundaries.

## Phase 1: Core Continuity, Validation, and Recovery Contracts

### Repository tree

```text
packages/core/src/schemas.ts          Domain schemas, render job contracts, continuity memory, visual references
packages/core/src/state-machine.ts    Idempotent workflow and job state transitions
packages/core/src/recovery.ts         Workflow checkpoint and partial-failure recovery planner
packages/core/src/errors.ts           Error classification and retryability
packages/core/src/tests/resilience.test.ts Recovery and resilience unit tests
```

### Source files

- `packages/core/src/schemas.ts`
- `packages/core/src/state-machine.ts`
- `packages/core/src/recovery.ts`
- `packages/core/src/errors.ts`
- `packages/core/src/tests/resilience.test.ts`

### Configuration files

- `packages/core/package.json`
- `packages/core/tsconfig.json`

### API usage, environment variables, deployment notes

- Import `planWorkflowRecovery(checkpoint, jobs, staleHeartbeatBefore)` to compute which scenes can be skipped, inspected, or safely requeued using idempotency keys.
- Recovery inputs must pass Zod validation at the boundary before mutating a queue or database row.
- No environment variables are required for the core package.

### Production hardening checklist

- Validate every workflow, scene, asset, retry policy, and job payload before persistence or queue enqueue.
- Store checkpoints after each durable workflow step.
- Requeue only by deterministic idempotency key so duplicate recovery attempts converge.
- Classify errors before retry, DLQ handoff, or incident escalation.

## Phase 2: Scene Continuity and Asset Memory

### Repository tree

```text
packages/scene-graph/src/graph.ts       DAG validation, cycle rejection, inherited continuity resolution
packages/scene-graph/src/compiler.ts    Character memory, visual references, timeline, transitions, continuity prompts
packages/scene-graph/src/api.ts         Package API wrapper
packages/prompt-compiler/src/index.ts   Provider prompts with continuity fingerprints and visual anchors
```

### Source files

- `packages/scene-graph/src/graph.ts`
- `packages/scene-graph/src/compiler.ts`
- `packages/scene-graph/src/types.ts`
- `packages/prompt-compiler/src/index.ts`

### Configuration files

- `packages/scene-graph/package.json`
- `packages/prompt-compiler/package.json`

### API usage, environment variables, deployment notes

- Use `compileSceneGraph(sceneGraph)` before enqueueing render jobs.
- Each compiled scene includes resolved camera, lighting, environment, character memory, visual references, negative prompts, and transition plans.
- Prompt compilers target `veo`, `google_flow`, and `nano_banana` without coupling to Google Flow UI selectors.

### Production hardening checklist

- Reject scene graph cycles and missing references before jobs are created.
- Keep character and visual-reference identifiers stable across scenes.
- Persist prompt hashes and continuity fingerprints for replay and audit.
- Treat browser automation as a replaceable provider adapter only.

## Phase 3: Prompt Queue, Intelligent Retries, Leasing, and Adaptive Concurrency

### Repository tree

```text
packages/queue-ts/src/index.ts       BullMQ runtime, leases, retries, DLQ, events, adaptive concurrency
packages/core/src/errors.ts          Retry classification
apps/render-worker/src/worker.ts     Worker lifecycle, heartbeats, timeouts, provider protection
```

### Source files

- `packages/queue-ts/src/index.ts`
- `apps/render-worker/src/worker.ts`
- `packages/core/src/errors.ts`

### Configuration files

- `packages/queue-ts/package.json`
- `apps/render-worker/Dockerfile`
- `infra/docker/docker-compose.yml`
- `infra/kubernetes/base/render-worker.yaml`

### API usage, environment variables, deployment notes

- `RenderQueueRuntime.enqueueRender(payload, { retryPolicy })` uses the payload idempotency key as the BullMQ job ID.
- `RenderQueueRuntime.createWorker(processor, { concurrency })` leases distributed jobs and refreshes progress heartbeats.
- `RenderQueueRuntime.attachAdaptiveConcurrency(worker)` adjusts worker concurrency from queue backlog and throughput.
- Worker environment variables: `REDIS_URL`, `WORKER_ID`, `CONCURRENCY`, `HEARTBEAT_MS`, `PROVIDER_TIMEOUT_MS`, `PROVIDER_BULKHEAD_CONCURRENCY`, `PROVIDER_BULKHEAD_QUEUE`, `CIRCUIT_FAILURE_THRESHOLD`, `CIRCUIT_HALF_OPEN_AFTER_MS`.

### Production hardening checklist

- Keep retries bounded with exponential backoff and jitter-aware policy fields.
- Move exhausted jobs to DLQ with classified errors and event-stream metadata.
- Size leases and heartbeat intervals longer than provider request jitter.
- Use adaptive concurrency caps per cluster capacity and provider quota.

## Phase 4: Security Controls and API Boundary

### Repository tree

```text
apps/api-gateway/src/server.ts       HTTP/HTTPS server, validation, audit events, rate limiting, trace IDs
apps/api-gateway/src/auth.ts         Signed service bearer tokens and RBAC principals
apps/api-gateway/src/config.ts       Environment and file-backed secret loading, TLS settings
packages/core/src/security.ts        Secret loading, audit logger, token-bucket rate limiter
packages/core/src/rbac.ts            Permission model
```

### Source files

- `apps/api-gateway/src/server.ts`
- `apps/api-gateway/src/auth.ts`
- `apps/api-gateway/src/config.ts`
- `packages/core/src/security.ts`
- `packages/core/src/rbac.ts`

### Configuration files

- `apps/api-gateway/package.json`
- `apps/api-gateway/Dockerfile`
- `infra/kubernetes/base/api-gateway.yaml`
- `infra/kubernetes/base/network-policy.yaml`

### API usage, environment variables, deployment notes

- `GET /healthz`, `GET /readyz`, `GET /metrics`, `GET /openapi.json`, `POST /v1/workflows`, and `POST /v1/workflows/{workflowId}/media-pipelines` are exposed by the API gateway.
- Authentication uses signed bearer service tokens generated by `signServiceToken(payload, secret)`.
- API environment variables: `PORT`, `REDIS_URL`, `AUTH_SHARED_SECRET` or `AUTH_SHARED_SECRET_FILE`, `S3_BUCKET`, `MEDIA_EXPORT_BUCKET`, `TLS_CERT_FILE`, `TLS_KEY_FILE`, `RATE_LIMIT_CAPACITY`, `RATE_LIMIT_REFILL_TOKENS`, `RATE_LIMIT_REFILL_INTERVAL_MS`.
- Set both `TLS_CERT_FILE` and `TLS_KEY_FILE` to run the gateway with native TLS. In Kubernetes, mount these paths from a TLS secret or terminate at an ingress and keep network policy restricted.

### Production hardening checklist

- Use file-backed secrets in production rather than literal environment values.
- Rotate bearer signing secrets through a secret manager and restart workloads safely.
- Capture allow and deny audit events for authorization and rate-limit decisions.
- Enforce rate limits before expensive parsing, graph compilation, or queue writes.
- Enable TLS at the service or ingress boundary and restrict east-west traffic with network policies.

## Phase 5: Circuit Breakers, Bulkheads, and Graceful Degradation

### Repository tree

```text
packages/core/src/circuit-breaker.ts    Reusable circuit breaker state machine
packages/core/src/bulkhead.ts           Per-provider concurrent execution isolation
apps/render-worker/src/worker.ts        Provider circuit and bulkhead usage
packages/storage/s3.py                  Storage adapter boundary for degradation strategies
packages/queue-ts/src/index.ts          DLQ and event publication boundary
```

### Source files

- `packages/core/src/circuit-breaker.ts`
- `packages/core/src/bulkhead.ts`
- `apps/render-worker/src/worker.ts`
- `packages/storage/s3.py`
- `packages/queue-ts/src/index.ts`

### Configuration files

- `apps/render-worker/package.json`
- `infra/kubernetes/base/render-worker.yaml`

### API usage, environment variables, deployment notes

- Wrap provider adapters with `bulkhead.execute(() => circuit.execute(providerCall))` so one provider or tenant cannot consume all worker capacity.
- Configure conservative default bulkhead queue sizes in production, then increase only after observing provider latency and quotas.
- Circuit breakers open after repeated provider failures, transition to half-open probes, and close after sustained successes.

### Production hardening checklist

- Keep provider calls abortable with `AbortController`.
- Put browser automation behind the provider adapter boundary only.
- Emit structured provider errors so retry classification can distinguish transient, storage, provider, and validation failures.
- Maintain a DLQ replay runbook and never mutate completed output keys during replay.

## Phase 6: Observability, Infrastructure, and Operations

### Repository tree

```text
packages/core/src/logger.ts              Structured JSON logging
packages/core/src/metrics.ts             Prometheus counters, gauges, histograms
packages/core/src/tracing.ts             Trace/span context propagation
infra/monitoring/prometheus.yml          Scrape config
infra/monitoring/grafana-dashboard.json  Operations dashboard
infra/kubernetes/base/*.yaml             RBAC, network policy, rollout, HPA, PDB
infra/terraform/main.tf                  Encrypted object storage baseline
docs/runbooks/failure-recovery.md        Operational recovery runbook
```

### Source files

- `packages/core/src/logger.ts`
- `packages/core/src/metrics.ts`
- `packages/core/src/tracing.ts`
- `infra/monitoring/prometheus.yml`
- `infra/monitoring/grafana-dashboard.json`

### Configuration files

- `infra/docker/docker-compose.yml`
- `infra/kubernetes/base/kustomization.yaml`
- `infra/terraform/main.tf`

### API usage, environment variables, deployment notes

- Scrape `/metrics` from the API and worker services.
- Propagate `traceparent` and `x-correlation-id` headers through clients and provider adapters.
- Store logs centrally and index by `tenantId`, `workflowId`, `jobId`, `correlationId`, and `traceId`.
- Deploy with least-privilege RBAC, default-deny network policy, PDBs, autoscaling, and blue/green promotion checks.

### Production hardening checklist

- Alert on DLQ growth, heartbeat loss, provider circuit-open rates, active lease saturation, and p95 job latency.
- Exercise recovery from queue outage, Redis failover, provider outage, and partial object-storage failure.
- Keep storage encrypted, versioned, lifecycle-managed, and blocked from public access.
- Document rollback, DLQ replay, and object restoration procedures before production launch.
