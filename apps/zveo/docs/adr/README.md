# zVEO Architecture Decision Records

These ADRs capture the production architecture that exists after the six delivery phases. They are intentionally operational: each decision identifies the owning runtime boundary, observability surface, validation boundary, and recovery trade-off.

| ADR | Status | Decision area |
| --- | --- | --- |
| [0001](0001-clean-queue-first-architecture.md) | Accepted | Clean, queue-first orchestration |
| [0002](0002-domain-validation-and-versioned-events.md) | Accepted | Strict contracts, state machines, and event envelopes |
| [0003](0003-deterministic-scene-graph-and-prompt-compilation.md) | Accepted | Replayable scene graph and prompt compilation |
| [0004](0004-bullmq-workers-and-dead-letter-recovery.md) | Accepted | Distributed worker leasing, retries, and DLQ recovery |
| [0005](0005-media-pipeline-checkpoints-and-artifact-integrity.md) | Accepted | Resumable FFmpeg/media exports and artifact validation |
| [0006](0006-observability-security-and-operational-isolation.md) | Accepted | Metrics, tracing, RBAC, secrets, and isolation controls |

## Decision principles

1. **Domain state is authoritative outside adapters.** Provider-specific code receives validated commands and returns validated artifacts; it never owns workflow progression.
2. **Every asynchronous boundary is idempotent.** Client-submitted idempotency keys, deterministic scene compilation, and checkpointed media steps allow safe replay.
3. **Failures must be classifiable.** Retryable, timeout, rate-limit, validation, and fatal errors drive queue behavior and operator runbooks.
4. **Observability is part of the contract.** Logs, metrics, correlation IDs, and trace context are required on API, queue, worker, and media-pipeline paths.
5. **Security is enforced before side effects.** Authentication, RBAC, tenant checks, payload validation, and artifact checksums run before queue, storage, or publish operations.
