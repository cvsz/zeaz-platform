# zVEO Scaling Guide

This guide provides production scaling controls for API gateways, render workers, media workers, Redis, PostgreSQL, object storage, and observability.

## Scaling goals

- Keep workflow submission API p95 below the product SLO while validating payloads synchronously.
- Keep render queue wait time bounded per tenant tier and provider.
- Prevent FFmpeg workloads from starving render workers or API pods.
- Preserve idempotency, traceability, and tenant isolation during horizontal scale-out.

## Component scaling matrix

| Component | Scale trigger | Scale action | Guardrail |
| --- | --- | --- | --- |
| API gateway | HTTP p95 latency, CPU, enqueue errors | Add replicas behind load balancer | Keep request body limits and RBAC checks enabled |
| Render workers | Queue wait time, active leases, provider budgets | Add provider-specific workers | Do not exceed provider concurrency/rate limits |
| Media workers | CPU/GPU encode utilization, scratch disk pressure | Add media-worker replicas or larger nodes | Reserve ephemeral storage and isolate node pools |
| Redis/BullMQ | Command latency, memory, stalled jobs | Dedicated Redis, vertical scale, shard queues | Enable AOF and monitor lock renewal latency |
| PostgreSQL | Query p95, WAL volume, vacuum lag | Add indexes, partitions, read replicas | Keep state transitions transactional |
| Object storage | Upload/download p95, throttling | Multipart, regional buckets, transfer tuning | Verify checksums and object versions |
| Prometheus/Grafana | Series count, query latency | Bound labels, federate, remote-write | Do not add high-cardinality labels |

## API gateway

**Horizontal scaling**

- Run at least two replicas in production.
- Autoscale on CPU, memory, HTTP p95 latency, and Redis enqueue error rate.
- Keep `/readyz` strict: fail readiness if required queue or secret dependencies are unavailable.

**Capacity planning**

- Each workflow submission compiles the scene graph and enqueues one render job per compiled scene.
- Use ingress request-size limits aligned with API body validation.
- For large workflows, consider asynchronous compilation behind an orchestration queue when synchronous compile time exceeds the API SLO.

**Safety controls**

- Enforce signed service tokens or ingress identity before domain validation side effects.
- Require tenant match between authenticated principal and submitted workflow.
- Emit correlation IDs on every accepted or rejected request.

## Render workers

**Pool design**

- Create separate worker pools per provider and runtime class.
- Use dedicated queues or queue names when providers have materially different limits.
- Use node selectors for GPU-backed providers and standard nodes for polling-only adapters.

**Autoscaling signals**

- Queue depth by priority and provider.
- Oldest waiting job age.
- Active lease count and stale lease age.
- Retry and DLQ inflow rate.
- Provider rate-limit budget remaining.

**Concurrency tuning**

1. Start with provider-documented concurrency limits per account/region.
2. Set worker concurrency below the hard provider limit to leave retry headroom.
3. Increase only while success rate and provider p95 latency remain stable.
4. Decrease automatically when rate-limit or timeout errors exceed budget.

## Media workers

**Isolation**

- Run media workers separately from render workers.
- Use GPU nodes only for codecs that benefit from hardware acceleration.
- Reserve ephemeral storage for every pod and clean scratch directories after success or failure.

**Autoscaling signals**

- CPU/GPU utilization.
- Encode duration p95 by preset.
- Scratch disk free percentage.
- Number of pending pipeline checkpoints.
- Object storage download/upload p95.

**Throughput strategy**

- Prefer a mezzanine render artifact per scene and derive platform renditions from an intermediate timeline.
- Avoid repeated full-resolution downloads by co-locating workers and buckets.
- Persist checkpoints after each durable artifact write.

## Redis and queues

**Production baseline**

- Use Redis with AOF persistence for BullMQ queues.
- Use private networking and authentication.
- Monitor command latency, memory usage, evictions, connected clients, AOF rewrite duration, and replication lag.

**Scale path**

1. Vertical scale Redis until command latency or memory pressure approaches limits.
2. Split cache traffic from BullMQ traffic.
3. Shard queues by workload class: render, media, DLQ, and optional provider-specific queues.
4. Keep job payloads compact and store large media in object storage.

## PostgreSQL

**Schema growth controls**

- Partition event and audit tables by time once event volume exceeds vacuum windows.
- Keep indexes focused on operational query paths: tenant, workflow, job, pipeline, correlation, and timestamp.
- Archive cold events and DLQ payloads after retention windows.

**High availability**

- Enable point-in-time recovery.
- Use managed backups or WAL archiving.
- Test restore procedures quarterly.
- Use read replicas for analytics queries; keep workflow mutations on the primary.

## Object storage

**Scale controls**

- Enable multipart uploads for large renders and exports.
- Keep buckets regionally close to workers.
- Use versioning, lifecycle rules, encryption, and public-access blocks.
- Validate checksum and object version before publishing or checkpointing.

## Multi-tenant scaling

- Assign tenant tiers to queues or priority bands.
- Enforce per-tenant rate limits before enqueueing.
- Keep tenant IDs out of metric labels when tenant count is high; use tenant tier labels and logs for exact tenant investigation.
- Isolate high-volume enterprise tenants with dedicated worker pools when they exceed shared-pool fairness budgets.

## Release scaling and rollout

- Use blue/green or canary rollouts for API and worker deployments.
- Drain workers before terminating pods so active leases can finish or be retried cleanly.
- Promote new worker versions only after DLQ inflow, retry rate, and latency remain within baseline.
