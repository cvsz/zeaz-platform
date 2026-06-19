"""Queue-first render orchestration with idempotency, leases, retries, and DLQs.

The in-memory backend is intentionally deterministic for tests. Production workers use
``BullMQRedisQueue`` from :mod:`packages.queue.bullmq_queue`, which mirrors the same
lease/checkpoint contract on Redis so Python render workers can interoperate with
BullMQ producers and operational tooling.
"""

from __future__ import annotations

import hashlib
import json
import random
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from enum import StrEnum
from threading import Lock
from typing import Any, Protocol
from uuid import uuid4

from pydantic import BaseModel, Field, field_validator

from packages.logger import get_logger

logger = get_logger(__name__)


class JobStatus(StrEnum):
    QUEUED = "queued"
    LEASED = "leased"
    COMPLETED = "completed"
    FAILED = "failed"
    DEAD_LETTERED = "dead_lettered"


class RenderJobKind(StrEnum):
    VEO_RENDER = "veo_render"
    NANO_BANANA_IMAGE = "nano_banana_image"
    POST_PROCESSING = "post_processing"
    EXPORT_RENDERING = "export_rendering"


class ArtifactRef(BaseModel):
    """Portable reference to an input or output media artifact."""

    uri: str = Field(..., min_length=1, max_length=4096)
    checksum_sha256: str | None = Field(default=None, pattern=r"^[a-fA-F0-9]{64}$")
    content_type: str = Field(default="application/octet-stream", min_length=1, max_length=255)


class RenderTask(BaseModel):
    """Serializable render task payload for video, image, post-process, and export jobs."""

    prompt: str = Field(..., min_length=1, max_length=32_000)
    style: str = Field(default="cinematic", min_length=1, max_length=512)
    duration: int = Field(default=30, ge=1, le=3600)
    workflow_id: str | None = None
    scene_id: str | None = None
    priority: int = Field(default=50, ge=0, le=100)
    idempotency_key: str | None = Field(default=None, max_length=128)
    kind: RenderJobKind = RenderJobKind.VEO_RENDER
    input_artifacts: list[ArtifactRef] = Field(default_factory=list)
    output_prefix: str | None = Field(default=None, max_length=1024)
    export_tier: str | None = Field(default=None, max_length=128)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("idempotency_key")
    @classmethod
    def normalize_idempotency_key(cls, value: str | None) -> str | None:
        return value.strip() if value else value

    def stable_key(self) -> str:
        """Return a deterministic idempotency key when callers do not provide one."""

        if self.idempotency_key:
            return self.idempotency_key
        payload = self.model_dump(exclude={"idempotency_key"}, mode="json")
        return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()


@dataclass
class QueueJob:
    id: str
    task: RenderTask
    status: JobStatus = JobStatus.QUEUED
    attempts: int = 0
    max_attempts: int = 5
    lease_owner: str | None = None
    lease_expires_at: datetime | None = None
    available_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    last_error: str | None = None
    checkpoint: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class RetryPolicy:
    """Exponential backoff with bounded jitter for retryable render failures."""

    max_attempts: int = 5
    base_delay_seconds: int = 10
    max_delay_seconds: int = 900
    jitter_ratio: float = 0.2

    def delay_for_attempt(self, attempt: int) -> int:
        raw = min(self.base_delay_seconds * (2 ** max(attempt - 1, 0)), self.max_delay_seconds)
        jitter = raw * self.jitter_ratio
        return max(0, int(raw + random.uniform(-jitter, jitter)))


class RenderQueueBackend(Protocol):
    def enqueue(self, task: RenderTask) -> str: ...
    def lease(self, worker_id: str, lease_seconds: int = 60) -> QueueJob | None: ...
    def heartbeat(self, job_id: str, worker_id: str, lease_seconds: int = 60) -> bool: ...
    def checkpoint(self, job_id: str, worker_id: str, state: dict[str, Any]) -> None: ...
    def complete(self, job_id: str, worker_id: str | None = None, result: dict[str, Any] | None = None) -> None: ...
    def fail(self, job_id: str, error: Exception | str, worker_id: str | None = None) -> None: ...
    def recover_expired_leases(self) -> int: ...
    def depth(self) -> int: ...


class InMemoryQueue:
    """Thread-safe queue backend for local development and deterministic tests."""

    def __init__(self, name: str = "render", retry_policy: RetryPolicy | None = None) -> None:
        self.name = name
        self.retry_policy = retry_policy or RetryPolicy()
        self.jobs: list[RenderTask] = []
        self._records: dict[str, QueueJob] = {}
        self._idempotency: dict[str, str] = {}
        self._dead_letters: dict[str, QueueJob] = {}
        self._lock = Lock()

    def enqueue(self, task: RenderTask) -> str:
        """Enqueue idempotently and return the existing job id for duplicate payloads."""

        key = task.stable_key()
        with self._lock:
            if key in self._idempotency:
                return self._idempotency[key]
            job_id = f"local-{len(self._records) + 1}"
            self.jobs.append(task)
            self._records[job_id] = QueueJob(id=job_id, task=task, max_attempts=self.retry_policy.max_attempts)
            self._idempotency[key] = job_id
            logger.info("job enqueued", extra={"job_id": job_id, "queue": self.name, "scene_id": task.scene_id})
            return job_id

    def lease(self, worker_id: str, lease_seconds: int = 60) -> QueueJob | None:
        """Lease the highest-priority available job for a worker."""

        now = datetime.now(UTC)
        with self._lock:
            candidates = [job for job in self._records.values() if job.status == JobStatus.QUEUED and job.available_at <= now]
            if not candidates:
                return None
            job = sorted(candidates, key=lambda item: (-item.task.priority, item.created_at))[0]
            job.status = JobStatus.LEASED
            job.lease_owner = worker_id
            job.lease_expires_at = now + timedelta(seconds=lease_seconds)
            job.updated_at = now
            logger.info("job leased", extra={"job_id": job.id, "queue": self.name, "attempt": job.attempts + 1})
            return job

    def heartbeat(self, job_id: str, worker_id: str, lease_seconds: int = 60) -> bool:
        with self._lock:
            job = self._records.get(job_id)
            if not job or job.status != JobStatus.LEASED or job.lease_owner != worker_id:
                return False
            now = datetime.now(UTC)
            job.lease_expires_at = now + timedelta(seconds=lease_seconds)
            job.updated_at = now
            return True

    def checkpoint(self, job_id: str, worker_id: str, state: dict[str, Any]) -> None:
        with self._lock:
            job = self._records[job_id]
            if job.lease_owner != worker_id:
                raise RuntimeError("worker does not own lease")
            job.checkpoint = {**job.checkpoint, **state}
            job.updated_at = datetime.now(UTC)

    def complete(self, job_id: str, worker_id: str | None = None, result: dict[str, Any] | None = None) -> None:
        with self._lock:
            job = self._records[job_id]
            if worker_id and job.lease_owner != worker_id:
                raise RuntimeError("worker does not own lease")
            job.status = JobStatus.COMPLETED
            job.lease_owner = None
            job.lease_expires_at = None
            job.checkpoint = {**job.checkpoint, "result": result or {}}
            job.updated_at = datetime.now(UTC)

    def fail(self, job_id: str, error: Exception | str, worker_id: str | None = None) -> None:
        """Retry with exponential backoff or move exhausted jobs to DLQ."""

        with self._lock:
            job = self._records[job_id]
            if worker_id and job.lease_owner != worker_id:
                raise RuntimeError("worker does not own lease")
            job.attempts += 1
            job.last_error = str(error)
            job.lease_owner = None
            job.lease_expires_at = None
            job.updated_at = datetime.now(UTC)
            if job.attempts >= job.max_attempts:
                job.status = JobStatus.DEAD_LETTERED
                self._dead_letters[job.id] = job
                logger.error("job dead-lettered", extra={"job_id": job.id, "queue": self.name, "attempt": job.attempts})
                return
            delay = self.retry_policy.delay_for_attempt(job.attempts)
            job.available_at = datetime.now(UTC) + timedelta(seconds=delay)
            job.status = JobStatus.QUEUED
            logger.warning("job scheduled for retry", extra={"job_id": job.id, "queue": self.name, "attempt": job.attempts})

    def recover_expired_leases(self) -> int:
        """Return expired leases to the queue so workflows resume after worker crashes."""

        now = datetime.now(UTC)
        recovered = 0
        with self._lock:
            for job in self._records.values():
                if job.status == JobStatus.LEASED and job.lease_expires_at and job.lease_expires_at <= now:
                    job.status = JobStatus.QUEUED
                    job.lease_owner = None
                    job.lease_expires_at = None
                    job.updated_at = now
                    recovered += 1
        return recovered

    def depth(self) -> int:
        now = datetime.now(UTC)
        return sum(1 for job in self._records.values() if job.status == JobStatus.QUEUED and job.available_at <= now)

    def dead_letters(self) -> list[QueueJob]:
        return list(self._dead_letters.values())


def enqueue_render(task: RenderTask, queue: RenderQueueBackend | None = None) -> str:
    """Enqueue a render task with validation-friendly defaults."""

    backend = queue or InMemoryQueue()
    return backend.enqueue(task)


def new_worker_id(prefix: str = "worker") -> str:
    return f"{prefix}-{uuid4().hex[:12]}"
