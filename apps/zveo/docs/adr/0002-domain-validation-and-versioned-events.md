# ADR 0002: Domain Validation and Versioned Events

## Status
Accepted

## Context
zVEO accepts workflow submissions, render jobs, scene graphs, prompt compiler inputs, media pipeline commands, and artifact metadata from multiple services. Invalid payloads can otherwise enter Redis, PostgreSQL, object storage, or provider adapters and become expensive to repair.

## Decision
All external inputs and inter-service payloads are parsed through strict TypeScript schemas before side effects. Workflow and job states transition only through explicit state machines. Domain events use versioned envelopes that carry tenant, workflow, correlation, causation, and timestamp fields.

## Implementation boundaries

- `packages/core` owns workflow, job, asset, retry, event, RBAC, logging, metrics, tracing, and recovery contracts.
- `apps/api-gateway` parses HTTP payloads and authenticates principals before enqueueing render jobs or media pipeline commands.
- `packages/db` mirrors database entities so services do not hand-roll persistence shapes.
- Python compatibility modules keep equivalent validation semantics for legacy workers and tests.

## Consequences

- Invalid data is rejected at ingress instead of becoming queue poison.
- Events can evolve by schema version without changing topic names or breaking consumers.
- Operators can reconstruct incidents by correlation ID and causation ID.
- State transitions are auditable and reject illegal recovery actions.

## Trade-offs

- Schema updates require coordinated TypeScript builds and migrations.
- New event consumers must tolerate unknown future versions and preserve envelope metadata.
