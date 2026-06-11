# Future Evolution Roadmap

This roadmap preserves the current queue-first, strongly typed architecture while adding provider breadth, higher automation, deeper retrieval, and stronger operational guarantees.

## Near term: 0-3 months

### Provider adapters

- Add official provider adapters as stable APIs become available.
- Keep provider code behind the render-worker adapter boundary.
- Add contract tests for provider timeout, cancellation, retryability, artifact upload, and checksum validation.

### Operational hardening

- Add synthetic workflow canaries for API, render queue, worker, object storage, and media export paths.
- Add alert rules for queue wait time, DLQ inflow, stale leases, provider error budget, API readiness, Redis command latency, and media scratch disk pressure.
- Add automated DLQ sampling reports with error classification and replay readiness.

### Prompt and scene regression tests

- Snapshot compiled scene graphs and provider prompts for representative workflows.
- Track prompt hash changes across compiler releases.
- Add compatibility tests for prompt budgets and provider-specific negative prompt behavior.

## Mid term: 3-6 months

### Retrieval and memory services

- Add pgvector-backed retrieval for character memory, visual references, and prompt fragments.
- Implement batch similarity queries per workflow submission.
- Add recall/precision regression datasets before using retrieval results in production prompts.

### Workflow orchestration adapter

- Add a Temporal-compatible adapter for long-running workflow orchestration.
- Preserve existing domain state machines and queue payload contracts.
- Use the adapter for multi-day workflows, human approvals, and scheduled retries while leaving render execution in worker queues.

### Multi-tenant controls

- Add tenant tier policies for queue priority, rate limits, storage retention, maximum graph size, and export presets.
- Add tenant-isolated worker pools for enterprise workloads.
- Add cost attribution for provider spend, encode minutes, storage, and egress.

## Long term: 6-12 months

### Human approval and publishing governance

- Add signed export approvals with immutable audit events.
- Add per-platform policy linting for captions, duration, aspect ratio, music rights, and brand safety.
- Add rollback/takedown workflows for published assets.

### Advanced media pipeline

- Add shot-level QC: black frames, silence, loudness, aspect-ratio compliance, subtitle overlap, and watermark validation.
- Add adaptive render/export planning based on provider success rate and platform target.
- Add distributed cache for repeated mezzanine and thumbnail generation.

### Disaster recovery and chaos engineering

- Add automated restore drills for PostgreSQL PITR and object-storage version recovery.
- Add chaos tests for Redis failover, S3 throttling, worker death, provider timeout storms, and blue/green rollback.
- Add regional failover plans for queue, worker, database, and object storage tiers.

## Research track

- Evaluate semantic scene-diffing to re-render only impacted scenes after prompt or visual-memory updates.
- Evaluate learned provider routing based on cost, latency, failure class, and output quality score.
- Evaluate local preview generation for cheap continuity validation before expensive provider calls.
- Evaluate automated prompt safety review and provenance metadata in export manifests.

## Non-goals

- Do not move workflow state into browser automation.
- Do not bypass schema validation for performance shortcuts.
- Do not publish artifacts without tenant, checksum, and object-version verification.
- Do not add high-cardinality metrics for workflow, job, prompt, or object identifiers.
