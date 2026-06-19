# Failure Recovery Runbook

This runbook covers production recovery for API, Redis/BullMQ, render workers, DLQ replay, media pipeline checkpoints, PostgreSQL, object storage, and observability failures.

## Incident principles

1. Preserve evidence before replaying: logs, traces, DLQ payloads, object versions, checksums, and event rows.
2. Replay with the original domain payload and idempotency key unless the payload itself is invalid.
3. Fix the classified root cause before draining DLQ entries.
4. Never publish artifacts whose tenant, checksum, or object version cannot be verified.
5. Prefer pausing specific queues or tenant tiers over taking down the whole platform.

## Triage checklist

| Step | Action | Expected evidence |
| --- | --- | --- |
| 1 | Identify correlation ID, workflow ID, job ID, tenant ID, and provider | API response, logs, event store |
| 2 | Check `/healthz`, `/readyz`, and `/metrics` for API and workers | Service health and dependency status |
| 3 | Inspect queue depth, oldest waiting job, active leases, retries, and DLQ inflow | BullMQ metrics and Redis inspection |
| 4 | Inspect latest domain events and job state transitions | PostgreSQL event/job records |
| 5 | Validate artifact object version and SHA-256 | Object storage metadata and asset rows |
| 6 | Decide recovery path: retry, replay, checkpoint resume, rollback, or hold | Incident commander decision |

## API gateway rejects submissions

**Symptoms**

- Clients receive 401, 403, 413, 422, or 500 responses.
- Workflow queue depth does not increase.
- API readiness may fail if Redis or required secrets are unavailable.

**Recovery**

1. Verify token signature, expiry, role permissions, and tenant claim.
2. Confirm request body is below the configured maximum and passes the workflow schema.
3. Check Redis connectivity from API pods.
4. If Redis is unavailable, keep API readiness failing so traffic drains from unhealthy pods.
5. Once dependency health recovers, ask clients to retry with the same idempotency keys.

## Redis/BullMQ outage or latency spike

**Symptoms**

- Enqueue errors at API gateway.
- Worker lock renewals fail or stalled jobs increase.
- Queue wait time rises across all providers.

**Recovery**

1. Stop deploys and pause autoscaling changes that add Redis pressure.
2. Check Redis CPU, memory, evictions, connected clients, AOF rewrite status, replication lag, and command latency.
3. If Redis is failing over, wait for a stable primary before replaying DLQ entries.
4. Temporarily reduce worker concurrency if lock renewal latency approaches stalled-job thresholds.
5. After Redis stabilizes, verify queue counts and resume paused queues.
6. Reconcile PostgreSQL job states against BullMQ job states for workflows active during the outage.

## Render job fails near completion

**Symptoms**

- Job progress is high, but no validated render artifact exists.
- Worker logs show provider timeout, upload failure, or checksum failure.
- Job retries or moves to DLQ.

**Recovery**

1. Inspect render lifecycle logs using `correlationId` and `jobId`.
2. Verify whether the provider completed and whether an artifact object was uploaded.
3. If an object exists, validate tenant, object version, byte size, MIME type, and SHA-256 before marking it usable.
4. If the worker lease is stale and attempts remain, allow BullMQ stalled-job recovery to retry.
5. If attempts are exhausted, fix the root cause and replay from DLQ with the original payload and idempotency key.
6. If the provider created an external artifact but upload failed, import it only through the normal asset validator.

## DLQ replay procedure

**Preconditions**

- Root cause is fixed or mitigated.
- Replay payload still passes current schemas, or a documented migration is available.
- Provider limits can absorb replay traffic.

**Procedure**

1. Export DLQ entries matching the incident window, tenant, provider, and error classification.
2. Sample payloads and verify they are not validation or tenant-authorization failures.
3. Replay in small batches by priority and age.
4. Monitor retry rate, DLQ re-entry rate, provider error rate, and successful artifact validation.
5. Stop replay if re-entry exceeds the incident threshold.
6. Mark replayed DLQ rows with operator, timestamp, reason, and replacement job IDs.

## Media export partially completes

**Symptoms**

- Some platform export artifacts exist while the pipeline state is failed or paused.
- FFmpeg logs show codec, disk, memory, subtitle, or object storage errors.

**Recovery**

1. Query pipeline checkpoints for the affected pipeline ID.
2. Verify every completed checkpoint artifact exists with expected object version and SHA-256.
3. Free or expand scratch disk if the failure was storage pressure.
4. Fix FFmpeg preset, subtitle timing, audio duration, or object storage issue.
5. Re-submit the original `PipelineCommand` with the same idempotency key.
6. Confirm the planner skips verified completed checkpoints and resumes subsequent stages.
7. Validate all `media_export_manifests` before publish approval.

## Asset drift or wrong tenant asset

**Symptoms**

- Artifact tenant ID does not match workflow tenant.
- Object checksum differs from stored metadata.
- Published output references an unexpected render artifact.

**Recovery**

1. Immediately pause publish/export workflows for the affected tenant.
2. Mark the suspect pipeline failed or quarantined.
3. Verify object version, SHA-256, object key, tenant ID, and originating job ID.
4. Rebuild the render manifest from trusted event/job records.
5. Re-run the media pipeline with a new idempotency key only after all inputs are validated.
6. If publication occurred, follow customer notification and takedown policy.

## Provider outage or rate-limit storm

**Symptoms**

- Error class shifts to provider timeout or rate-limit.
- Circuit breaker opens for a provider.
- DLQ inflow increases for provider-specific queues.

**Recovery**

1. Pause or reduce concurrency for the affected provider queue.
2. Keep unrelated provider queues running.
3. Confirm provider status and account quota.
4. Move urgent work to an alternate provider only if prompt/output compatibility is approved.
5. Resume gradually: 10%, 25%, 50%, 100% concurrency while watching error budgets.

## PostgreSQL primary failure

**Symptoms**

- API readiness fails or job state writes fail.
- Event insertion errors appear in service logs.
- Database connection pools exhaust.

**Recovery**

1. Fail traffic away from API pods that cannot reach the database.
2. Promote managed replica or restore according to the database provider runbook.
3. Verify PITR target and schema migration level.
4. Reconcile workflows active during the failure window by comparing event rows, job rows, queue state, and artifact state.
5. Requeue only jobs whose persisted state and idempotency key prove they are safe to replay.

## Object storage outage or corruption

**Symptoms**

- Upload/download errors increase.
- Artifact validation fails with missing object, wrong version, or checksum mismatch.
- Media workers idle while waiting for artifacts.

**Recovery**

1. Pause media pipelines and publish flows that need affected buckets.
2. Verify bucket health, IAM policy, KMS status, lifecycle rules, and regional endpoint status.
3. Restore missing versions from replication or backup if available.
4. Re-run artifact validation for impacted objects.
5. Resume pipeline checkpoints only after checksums and object versions match persisted metadata.

## Bad deployment or worker regression

**Symptoms**

- Retry/DLQ rate increases immediately after deployment.
- New error classes appear in logs.
- Readiness remains healthy but business metrics degrade.

**Recovery**

1. Halt rollout and prevent further promotion.
2. Roll back API or worker deployment using blue/green controls.
3. Drain old worker pods gracefully where possible.
4. Replay only jobs that failed under the bad version after confirming root cause.
5. Add regression coverage for the failing payload or provider response.

## Post-incident closure

- Record incident timeline, impacted tenants, failed workflows, replays, and published artifacts.
- Attach metrics screenshots or dashboard links for queue depth, retries, DLQ inflow, latency, and worker saturation.
- Add or update alerts for the earliest reliable symptom.
- Update this runbook if the recovery procedure changed.
