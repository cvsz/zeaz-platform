# ADR 0004: BullMQ Workers and Dead-Letter Recovery

## Status
Accepted

## Context
Render jobs are long-running, provider-limited, and frequently impacted by timeouts, rate limits, worker crashes, and transient provider failures. Synchronous orchestration would amplify provider latency and make recovery fragile.

## Decision
Render execution runs through BullMQ queues with deterministic job IDs, bounded retry policies, priority mapping, heartbeat hooks, active lease metrics, provider timeouts, and DLQ handoff after exhausted attempts.

## Implementation boundaries

- `packages/queue-ts` owns queue creation, idempotent enqueueing, retry/backoff mapping, worker lifecycle hooks, heartbeat updates, DLQ movement, metrics, and structured logs.
- `apps/render-worker` owns provider execution boundaries, timeout control, artifact validation, and render lifecycle traces.
- Redis is the operational queue source; PostgreSQL is the long-lived workflow, job, event, and DLQ audit source.

## Consequences

- Client retries reuse the same job ID and do not duplicate renders.
- Stalled locks and worker crashes recover through BullMQ stalled-job handling.
- Exhausted jobs preserve payload and error classification for operator replay.
- Worker pools can be isolated by provider, GPU class, tenant tier, or queue priority.

## Trade-offs

- Redis durability and monitoring become production-critical.
- Provider adapters must be idempotent around upload and status callbacks.
