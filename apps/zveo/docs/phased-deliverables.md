# zVEO Phased Deliverables

This document maps the production scaffold to the mandatory six-phase delivery order. Each phase points to the repository tree, source modules, schemas, API contracts, tests, container assets, Kubernetes manifests, observability hooks, and retry/error-handling boundaries that implement it.

## Phase 1: Foundation & Core Services

### Repository tree

```text
apps/zeaz-api-gateway/         HTTP API, authentication, RBAC, OpenAPI, metrics
apps/render-worker/       BullMQ render worker, heartbeats, provider timeout boundary
packages/core/            Zod schemas, events, RBAC, state machines, logging, metrics, tracing
packages/queue-ts/        BullMQ runtime with priority, leasing, DLQ, adaptive concurrency
db/schema.sql             PostgreSQL workflow/job/asset/event/audit schema
infra/docker/             Local Postgres, Redis, MinIO, Prometheus, Grafana stack
infra/kubernetes/base/    Deployments, services, RBAC, HPA, security policies
```

### Complete source code

- Domain contracts and events: `packages/core/src/schemas.ts`, `packages/core/src/events.ts`.
- Authentication/RBAC: `apps/zeaz-api-gateway/src/auth.ts`, `packages/core/src/rbac.ts`.
- Queue runtime: `packages/queue-ts/src/index.ts`.
- Asset validation: `apps/render-worker/src/asset-validator.ts`, `packages/storage/validator.py`.
- Structured logging, metrics, and trace spans: `packages/core/src/logger.ts`, `packages/core/src/metrics.ts`, `packages/core/src/tracing.ts`.

### Database schema / migrations

- `db/schema.sql` defines tenants, workflows, render jobs, assets, event store, DLQ, audit log, scene graph tables, prompt versions, media pipeline state, and artifact exports.

### API contracts

- TypeScript OpenAPI 3.1 source: `apps/zeaz-api-gateway/src/openapi.ts`.
- Contract mirror for documentation: `docs/openapi/api-gateway.openapi.ts`.

### Unit + integration tests

- Python unit tests: `tests/test_asset_validator.py`, `tests/test_queue.py`, `tests/test_worker_queue_features.py`.
- TypeScript integration tests are colocated per package, for example `packages/scene-graph/tests/scene-graph.test.ts`.

### Docker and Kubernetes

- Dockerfiles: `apps/zeaz-api-gateway/Dockerfile`, `apps/render-worker/Dockerfile`, `apps/zeaz-api-gateway/Dockerfile`, `apps/orchestrator/Dockerfile`.
- Compose: `infra/docker/docker-compose.yml`.
- Kubernetes base: `infra/kubernetes/base/*.yaml`.

### Observability and retry/error handling

- JSON logs carry service, tenant, workflow, job, correlation, and trace fields.
- Prometheus metrics include queue enqueues, completions, failures, retries, DLQ moves, leases, and job latency.
- Trace spans are emitted in W3C `traceparent` format for API and worker execution.
- `packages/core/src/errors.ts` classifies retryable, fatal, timeout, rate-limit, and validation failures.
- `packages/queue-ts/src/index.ts` enforces bounded retries, exponential backoff, active leases, heartbeats, DLQ handoff, and adaptive concurrency.

## Phase 2: Scene Graph Engine

### Repository tree

```text
packages/scene-graph/src/types.ts      Cinematic DAG input/output types
packages/scene-graph/src/graph.ts      DAG validation and traversal
packages/scene-graph/src/compiler.ts   Continuity propagation and timeline stitching
packages/scene-graph/src/cache.ts      Redis-compatible cache abstraction
packages/scene-graph/src/api.ts        Scene graph REST adapter
```

### Implementation

The engine validates acyclic scene dependencies, topologically sorts scenes, resolves inherited camera/lighting/environment state, propagates character memory, persists visual references, compiles continuity prompts, and builds stitched timelines with transition metadata.

### Schema, API, tests, and operations

- PostgreSQL scene tables are in `db/schema.sql`; Drizzle mirrors are in `packages/db/src/schema.ts`.
- Redis caching is abstracted behind `InMemorySceneGraphCache` / `SceneGraphCache`.
- API adapter contracts are in `packages/scene-graph/src/api.ts`.
- Integration tests are in `packages/scene-graph/tests/scene-graph.test.ts`.

## Phase 3: Prompt Compiler

### Repository tree

```text
packages/prompt-compiler/src/index.ts  AST parsing, validation, optimization, provider emitters
packages/ai_prompts/engine.py          Python compatibility prompt helper
storage/prompts/                       Local prompt artifact bucket
```

### Implementation

The compiler parses structured cinematic JSON into a typed AST, injects continuity, camera, lens, lighting, environment, character memory, negative prompts, and visual-reference embedding anchors, deduplicates repeated semantic fragments, applies token budgets, and emits provider-specific prompts for Veo, Google Flow, and Nano Banana.

### Schema, API, tests, and operations

- Prompt versioning and hashes are represented in `db/schema.sql` and prompt compiler output.
- Test coverage is in `tests/test_prompt_engine.py`; TypeScript package checks are run with `pnpm --filter @zveo/prompt-compiler typecheck`.
- Validation errors are surfaced before render jobs are enqueued.

## Phase 4: Distributed Render Workers

### Repository tree

```text
apps/render-worker/src/worker.ts          Node render worker with heartbeat and timeout control
apps/render-worker/src/asset-validator.ts Rendered artifact validation
packages/render/adapters.py              Python provider adapter boundary
packages/ffmpeg/composer.py              FFmpeg composition helper
packages/storage/artifacts.py            Artifact checksum and upload policy helpers
```

### Implementation

Workers consume BullMQ jobs with configurable concurrency, refresh progress heartbeats, enforce provider timeouts with `AbortController`, resume from queue state, emit trace spans, validate artifacts, and rely on the queue runtime to move exhausted jobs to the DLQ.

### Schema, API, tests, and operations

- Render job tables, DLQ records, checksums, and events are in `db/schema.sql`.
- Tests: `tests/test_worker_queue_features.py`, `tests/test_ffmpeg_composer.py`, `tests/test_uploader_policy.py`.
- Dockerfile: `apps/render-worker/Dockerfile`.
- Kubernetes: `infra/kubernetes/base/render-worker.yaml` with GPU resource limits and HPA.

## Phase 5: Media Pipeline & Orchestration

### Repository tree

```text
packages/media-pipeline/src/contracts.ts        Pipeline command/result contracts
packages/media-pipeline/src/planner.ts          Export plan generation
packages/media-pipeline/src/state.ts            Resumable state machine
packages/media-pipeline/src/ffmpeg.ts           FFmpeg filter graph planner
packages/media-pipeline/src/synchronization.ts  Subtitle, voiceover, and beat sync
```

### Implementation

The media pipeline builds resumable workflow plans, models checkpoints and retries, plans downloads/exports, generates FFmpeg filter graphs, synchronizes subtitles, voiceover, and beat markers, and emits multi-platform export manifests for YouTube, TikTok, Instagram Reels, X, LinkedIn, broadcast, and archive targets.

### Schema, API, tests, and operations

- API route: `POST /v1/workflows/{workflowId}/media-pipelines`.
- OpenAPI contract: `apps/zeaz-api-gateway/src/openapi.ts`.
- Tests: `packages/media-pipeline/tests/media-pipeline.test.ts`.
- Docker Compose includes a `media-worker` service for pipeline package execution.

## Phase 6: Infrastructure & Observability

### Repository tree

```text
infra/terraform/main.tf                         Encrypted S3, versioning, replication, DR bucket
infra/kubernetes/base/network-policy.yaml       Default-deny and service egress policies
infra/kubernetes/base/pod-disruption-budget.yaml Availability during voluntary disruptions
infra/kubernetes/base/blue-green.yaml           Argo Rollouts blue/green deployment manifest
infra/monitoring/prometheus.yml                 Scrape configuration
infra/monitoring/grafana-dashboard.json         Dashboard panels
docs/runbooks/failure-recovery.md               Operational recovery procedure
```

### Implementation

Infrastructure defines encrypted object storage, cross-region replication for disaster recovery, Kubernetes autoscaling and PDBs, default-deny network policies, blue/green promotion gates, Prometheus metrics, Grafana dashboards, and runbooks for queue, worker, DLQ, and media-pipeline failures.

### Error handling, retries, and security hardening

- All queue failures are classified and retried using bounded policies before DLQ handoff.
- API responses include correlation IDs and trace IDs for incident stitching.
- Kubernetes manifests add least-privilege RBAC, network policies, PDBs, HPA, and rollout controls.
- Terraform enables KMS encryption, versioning, lifecycle cleanup, blocked public S3 access, and cross-region replication.


## Post-Phase Production Artifacts

After all six phases, the operational architecture is documented in these production artifacts:

- Overall architecture decision records: `docs/adr/README.md` and `docs/adr/0001-clean-queue-first-architecture.md` through `docs/adr/0006-observability-security-and-operational-isolation.md`.
- Performance bottleneck analysis: `docs/performance-bottlenecks.md`.
- Scaling guide: `docs/scaling-guide.md`.
- Failure recovery runbook: `docs/runbooks/failure-recovery.md`.
- Future evolution roadmap: `docs/future-roadmap.md`.
