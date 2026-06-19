# Performance Bottleneck Analysis

This analysis describes expected production bottlenecks after the six zVEO phases and maps each bottleneck to mitigation, observability, and scaling controls.

## Summary

| Rank | Bottleneck | Primary symptom | Required response |
| --- | --- | --- | --- |
| 1 | Provider render latency and rate limits | Queue wait time rises while worker CPU is low | Isolate provider queues, tune concurrency, apply circuit breakers |
| 2 | FFmpeg encode and mux workloads | Media workers saturate CPU/GPU or scratch disk | Scale media workers independently and enforce disk budgets |
| 3 | Redis queue pressure | Enqueue latency, stalled jobs, or reconnects increase | Enable AOF, shard queues by workload, reduce metric cardinality |
| 4 | PostgreSQL event/audit growth | Slow incident queries and vacuum pressure | Partition events, add covering indexes, archive cold data |
| 5 | Large scene graph compilation | API latency and memory usage spike | Cache compiled fingerprints and enforce graph-size limits |
| 6 | Prompt compilation and embedding lookup | Prompt submission latency rises | Batch vector lookups and persist prompt hashes |
| 7 | Object storage throughput | Artifact validation and export downloads slow | Use multipart transfer, checksum validation, and regional buckets |
| 8 | Observability cardinality | Prometheus memory and query latency increase | Keep labels bounded and move high-cardinality values to logs/traces |

## 1. Provider render latency and rate limits

Provider calls dominate end-to-end wall-clock time. Adding workers without provider-aware limits can worsen throughput by triggering throttling.

**Detection**

- Queue wait time grows faster than active render count.
- Worker CPU and memory remain underutilized.
- Retry counts increase with timeout or rate-limit error classifications.
- Circuit breakers remain half-open or open for a provider.

**Mitigation**

- Split queues by provider, tenant tier, and GPU/runtime requirements.
- Cap concurrency per provider account and region.
- Use priority only for business urgency; do not let low-priority work starve indefinitely.
- Apply exponential backoff with jitter for retryable provider failures.
- Move exhausted jobs to DLQ with provider response metadata and correlation IDs.

## 2. FFmpeg encode and mux workloads

Encoding, thumbnail extraction, subtitle burn-in, and multi-platform export are CPU/GPU and disk intensive. These jobs should never share the same autoscaling target as provider polling workers.

**Detection**

- Media-worker CPU or GPU utilization remains above 80% for sustained windows.
- Scratch disk free space drops below 25%.
- Export checkpoint durations exceed historical p95.
- FFmpeg process failures mention codec, disk, or memory errors.

**Mitigation**

- Run dedicated media-worker pools with node affinity for codec/GPU nodes.
- Reserve ephemeral storage per pod and clean scratch paths after every checkpoint.
- Stream from object storage where codec behavior permits; otherwise prefetch with checksums.
- Generate per-platform renditions from a mezzanine output to avoid duplicate scene downloads.

## 3. Redis queue pressure

BullMQ depends on Redis latency, persistence, and lock stability. Redis contention can create false stalls or slow enqueues.

**Detection**

- Redis command latency p95 exceeds the queue lock renewal interval budget.
- BullMQ stalled job count rises across unrelated providers.
- Enqueue errors increase at the API gateway.
- Redis memory fragmentation or AOF rewrite time spikes.

**Mitigation**

- Use a dedicated Redis deployment for BullMQ; do not mix cache-only workloads.
- Enable AOF persistence and monitor replication lag.
- Keep job payloads compact; store large artifacts in object storage and reference keys.
- Shard render, media, and DLQ queues once single-instance latency becomes the bottleneck.

## 4. PostgreSQL event and audit growth

The event store, audit log, render job history, and media pipeline checkpoints are append-heavy. Without partitioning, incident queries and vacuum can degrade.

**Detection**

- Query p95 for workflow incident reconstruction exceeds the SLO.
- Autovacuum cannot keep up with updated job rows.
- Index bloat grows faster than table data.

**Mitigation**

- Partition event and audit tables by month or tenant/time once retention exceeds operational vacuum windows.
- Add covering indexes for `tenant_id`, `workflow_id`, `job_id`, `correlation_id`, and `created_at` query paths.
- Archive cold DLQ and event rows to object storage after retention requirements are met.
- Keep high-volume progress heartbeats in Redis/metrics and persist durable milestones only.

## 5. Large scene graph compilation

Scene graph compilation validates references, topological order, continuity inheritance, and character memory propagation. Extremely large DAGs can increase API memory and latency.

**Detection**

- `POST /v1/workflows` latency grows with scene count.
- API memory spikes during graph compilation.
- Repeated submissions compile identical graph fingerprints.

**Mitigation**

- Enforce maximum scene, edge, character-memory, and visual-reference sizes at ingress.
- Cache compiled graph fingerprints in Redis and persist prompt/graph hashes.
- Move very large compilations to a dedicated orchestration queue if synchronous API latency exceeds the submission SLO.

## 6. Prompt compilation and embedding lookup

Prompt compilation can become expensive when visual references and semantic memory grow.

**Detection**

- Prompt compiler p95 latency increases independently of scene graph size.
- pgvector or embedding-store queries dominate request traces.
- Prompt token budgets are frequently exceeded.

**Mitigation**

- Batch embedding similarity lookups by workflow.
- Persist prompt hashes and reuse unchanged prompt fragments.
- Deduplicate semantic fragments before provider-specific formatting.
- Use approximate vector indexes and monitor recall on regression suites.

## 7. Object storage throughput

Render and media workers depend on artifact download, validation, upload, and checksum verification.

**Detection**

- Artifact validation latency or multipart upload retries increase.
- Media workers idle while waiting for downloads.
- Object storage throttling appears across tenants.

**Mitigation**

- Keep buckets regional to workers and enable multipart transfer.
- Validate SHA-256 and object version metadata before publishing.
- Use lifecycle rules for scratch artifacts and immutable retention for published exports.
- Separate hot render artifacts from cold archive exports.

## 8. Observability cardinality

Metrics that include job IDs, prompt hashes, object keys, or tenant-generated strings can exhaust Prometheus memory.

**Detection**

- Prometheus series count grows faster than workload volume.
- Grafana queries time out during incident review.
- Remote-write costs spike after deploys.

**Mitigation**

- Use bounded labels: service, route, provider, queue, status, error class, and tenant tier.
- Put job IDs, workflow IDs, object keys, prompt hashes, and correlation IDs in structured logs and traces instead of metric labels.
- Add dashboard panels for p50/p95/p99 latency, queue depth, attempts, DLQ inflow, lease age, worker saturation, and storage throughput.
