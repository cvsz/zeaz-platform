from datetime import UTC, datetime, timedelta

from packages.queue.render_queue import InMemoryQueue, JobStatus, RenderJobKind, RenderTask, RetryPolicy


def test_lease_heartbeat_and_checkpoint_resume_state() -> None:
    queue = InMemoryQueue(retry_policy=RetryPolicy(max_attempts=2, jitter_ratio=0))
    job_id = queue.enqueue(RenderTask(prompt="scene", kind=RenderJobKind.NANO_BANANA_IMAGE))
    job = queue.lease("worker-a", lease_seconds=1)

    assert job is not None
    assert job.id == job_id
    assert queue.heartbeat(job_id, "worker-a", lease_seconds=30)

    queue.checkpoint(job_id, "worker-a", {"stage": "provider", "cursor": "abc"})
    queue.complete(job_id, "worker-a", {"artifact": "s3://bucket/key"})

    completed = queue._records[job_id]
    assert completed.status == JobStatus.COMPLETED
    assert completed.checkpoint["cursor"] == "abc"
    assert completed.checkpoint["result"]["artifact"] == "s3://bucket/key"


def test_crash_recovery_requeues_expired_lease() -> None:
    queue = InMemoryQueue(retry_policy=RetryPolicy(jitter_ratio=0))
    job_id = queue.enqueue(RenderTask(prompt="scene"))
    job = queue.lease("worker-a", lease_seconds=30)
    assert job is not None
    queue._records[job_id].lease_expires_at = datetime.now(UTC) - timedelta(seconds=1)

    assert queue.recover_expired_leases() == 1
    assert queue._records[job_id].status == JobStatus.QUEUED
    assert queue.lease("worker-b") is not None


def test_retry_engine_moves_exhausted_jobs_to_dlq() -> None:
    queue = InMemoryQueue(retry_policy=RetryPolicy(max_attempts=2, base_delay_seconds=1, jitter_ratio=0))
    job_id = queue.enqueue(RenderTask(prompt="scene"))
    assert queue.lease("worker-a") is not None
    queue.fail(job_id, "transient", "worker-a")
    assert queue._records[job_id].status == JobStatus.QUEUED

    queue._records[job_id].available_at = datetime.now(UTC) - timedelta(seconds=1)
    assert queue.lease("worker-a") is not None
    queue.fail(job_id, "fatal", "worker-a")

    assert queue._records[job_id].status == JobStatus.DEAD_LETTERED
    assert [job.id for job in queue.dead_letters()] == [job_id]


def test_depth_excludes_jobs_waiting_for_retry() -> None:
    queue = InMemoryQueue(retry_policy=RetryPolicy(base_delay_seconds=60, jitter_ratio=0))
    job_id = queue.enqueue(RenderTask(prompt="delayed retry"))
    leased = queue.lease("worker-a")
    assert leased and leased.id == job_id

    queue.fail(job_id, "transient", worker_id="worker-a")

    assert queue.depth() == 0
