# ADR 0001: Clean, Queue-First Media Factory

## Status
Accepted

## Context
zVEO orchestrates AI video generation, scene continuity, prompt compilation, asset validation, FFmpeg export, and publishing policy across providers such as Google Flow, Veo, Nano Banana, and local media tooling. Provider APIs and browser automation are volatile and can fail independently of business workflow state.

## Decision
zVEO keeps domain, prompt, scene graph, queue, media pipeline, security, and observability logic in framework-independent packages. Browser automation and provider-specific clients are optional execution adapters and never own workflow state, continuity, retries, idempotency, tenant authorization, or artifact integrity.

## Implementation boundaries

- `packages/core` owns schemas, events, RBAC, state machines, recovery/error classification, logging, metrics, tracing, bulkheads, circuit breakers, and security utilities.
- `packages/scene-graph` owns deterministic DAG compilation and continuity propagation.
- `packages/prompt-compiler` owns provider-specific prompt emission from typed scene payloads.
- `packages/queue-ts` owns BullMQ queue semantics, idempotency, retries, leases, heartbeats, and DLQ handoff.
- `apps/api-gateway` owns HTTP ingress, authentication, RBAC enforcement, OpenAPI, readiness, metrics, workflow submission, and media pipeline submission.
- `apps/render-worker` owns provider execution boundaries, timeout control, heartbeat reporting, and artifact validation.
- `packages/media-pipeline` owns resumable export planning, FFmpeg graph generation, synchronization, and checkpointed media state.

## Consequences

- UI selector drift or provider-client churn cannot corrupt authoritative workflow state.
- Render, prompt, and export jobs can be replayed from persisted domain payloads and checkpoints.
- Workers scale horizontally behind Redis leases and database idempotency/audit records.
- Provider-specific adapters remain replaceable without changing core orchestration.
- The same domain model supports API, worker, CLI, and future workflow-engine adapters.

## Trade-offs

- More shared packages must be versioned and built together.
- Adapter authors must conform to domain contracts instead of writing provider-specific workflow shortcuts.
- Operations must monitor both durable database state and queue runtime state.
