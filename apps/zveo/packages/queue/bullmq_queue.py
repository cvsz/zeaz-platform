"""Redis-backed BullMQ-compatible queue with distributed leases and DLQs.

BullMQ itself is a Node.js library. zVEO producers can enqueue to the same Redis
namespace while Python GPU workers use this backend for durable leasing,
heartbeats, retry scheduling, resumable checkpoints, and crash recovery.
"""

from __future__ import annotations

import json
import time
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from redis import Redis

from packages.logger import get_logger
from packages.queue.render_queue import JobStatus, QueueJob, RenderTask, RetryPolicy
from packages.telemetry.metrics import DEAD_LETTER_JOBS, QUEUE_DEPTH, WORKER_LEASE_RECOVERIES

logger = get_logger(__name__)


class BullMQRedisQueue:
    """Durable Redis queue using BullMQ key naming and zVEO lease metadata."""

    def __init__(self, redis_url: str, name: str = "render", retry_policy: RetryPolicy | None = None) -> None:
        self.redis = Redis.from_url(redis_url, decode_responses=True)
        self.name = name
        self.retry_policy = retry_policy or RetryPolicy()
        self.prefix = f"bull:{name}"

    def _key(self, suffix: str) -> str:
        return f"{self.prefix}:{suffix}"

    @staticmethod
    def _now_ms() -> int:
        return int(time.time() * 1000)

    @staticmethod
    def _dt(ms: int | str | None) -> datetime | None:
        if ms in (None, ""):
            return None
        return datetime.fromtimestamp(int(ms) / 1000, tz=UTC)

    def _job_key(self, job_id: str) -> str:
        return self._key(job_id)

    def enqueue(self, task: RenderTask) -> str:
        stable_key = task.stable_key()
        existing = self.redis.hget(self._key("idempotency"), stable_key)
        if existing:
            return str(existing)

        job_id = str(self.redis.incr(self._key("id")))
        now = self._now_ms()
        payload = task.model_dump(mode="json")
        pipe = self.redis.pipeline(transaction=True)
        pipe.hset(self._job_key(job_id), mapping={
            "id": job_id,
            "name": task.kind.value,
            "data": json.dumps(payload, sort_keys=True),
            "opts": json.dumps({"attempts": self.retry_policy.max_attempts, "priority": task.priority}),
            "timestamp": now,
            "processedOn": "",
            "finishedOn": "",
            "attemptsMade": 0,
            "status": JobStatus.QUEUED.value,
            "leaseOwner": "",
            "leaseExpiresAt": "",
            "checkpoint": "{}",
            "returnvalue": "{}",
            "failedReason": "",
        })
        pipe.zadd(self._key("prioritized"), {job_id: -task.priority})
        pipe.lpush(self._key("wait"), job_id)
        pipe.hset(self._key("idempotency"), stable_key, job_id)
        pipe.sadd(self._key("jobs"), job_id)
        pipe.execute()
        QUEUE_DEPTH.labels(self.name).set(self.depth())
        logger.info("bullmq job enqueued", extra={"job_id": job_id, "queue": self.name, "scene_id": task.scene_id})
        return job_id

    def _hydrate(self, raw: dict[str, str]) -> QueueJob:
        task = RenderTask.model_validate_json(raw["data"])
        return QueueJob(
            id=raw["id"],
            task=task,
            status=JobStatus(raw.get("status", JobStatus.QUEUED.value)),
            attempts=int(raw.get("attemptsMade") or 0),
            max_attempts=int(json.loads(raw.get("opts") or "{}").get("attempts", self.retry_policy.max_attempts)),
            lease_owner=raw.get("leaseOwner") or None,
            lease_expires_at=self._dt(raw.get("leaseExpiresAt")),
            created_at=self._dt(raw.get("timestamp")) or datetime.now(UTC),
            updated_at=self._dt(raw.get("updatedAt")) or datetime.now(UTC),
            last_error=raw.get("failedReason") or None,
            checkpoint=json.loads(raw.get("checkpoint") or "{}"),
        )

    def lease(self, worker_id: str, lease_seconds: int = 60) -> QueueJob | None:
        now = self._now_ms()
        lease_until = now + lease_seconds * 1000
        while True:
            job_id = self.redis.rpop(self._key("wait"))
            if not job_id:
                QUEUE_DEPTH.labels(self.name).set(0)
                return None
            key = self._job_key(job_id)
            with self.redis.pipeline() as pipe:
                try:
                    pipe.watch(key)
                    raw = pipe.hgetall(key)
                    if not raw or raw.get("status") != JobStatus.QUEUED.value:
                        pipe.unwatch()
                        continue
                    pipe.multi()
                    pipe.hset(key, mapping={
                        "status": JobStatus.LEASED.value,
                        "leaseOwner": worker_id,
                        "leaseExpiresAt": lease_until,
                        "processedOn": now,
                        "updatedAt": now,
                    })
                    pipe.zadd(self._key("active"), {job_id: lease_until})
                    pipe.execute()
                    raw.update({"status": JobStatus.LEASED.value, "leaseOwner": worker_id, "leaseExpiresAt": str(lease_until)})
                    QUEUE_DEPTH.labels(self.name).set(self.depth())
                    logger.info("bullmq job leased", extra={"job_id": job_id, "queue": self.name})
                    return self._hydrate(raw)
                except Exception:
                    continue

    def heartbeat(self, job_id: str, worker_id: str, lease_seconds: int = 60) -> bool:
        key = self._job_key(job_id)
        raw = self.redis.hgetall(key)
        if not raw or raw.get("status") != JobStatus.LEASED.value or raw.get("leaseOwner") != worker_id:
            return False
        lease_until = self._now_ms() + lease_seconds * 1000
        self.redis.hset(key, mapping={"leaseExpiresAt": lease_until, "updatedAt": self._now_ms()})
        self.redis.zadd(self._key("active"), {job_id: lease_until})
        return True

    def checkpoint(self, job_id: str, worker_id: str, state: dict[str, Any]) -> None:
        raw = self.redis.hgetall(self._job_key(job_id))
        if raw.get("leaseOwner") != worker_id:
            raise RuntimeError("worker does not own lease")
        checkpoint = json.loads(raw.get("checkpoint") or "{}")
        checkpoint.update(state)
        self.redis.hset(self._job_key(job_id), mapping={"checkpoint": json.dumps(checkpoint, sort_keys=True), "updatedAt": self._now_ms()})

    def complete(self, job_id: str, worker_id: str | None = None, result: dict[str, Any] | None = None) -> None:
        raw = self.redis.hgetall(self._job_key(job_id))
        if worker_id and raw.get("leaseOwner") != worker_id:
            raise RuntimeError("worker does not own lease")
        now = self._now_ms()
        pipe = self.redis.pipeline(transaction=True)
        pipe.hset(self._job_key(job_id), mapping={
            "status": JobStatus.COMPLETED.value,
            "leaseOwner": "",
            "leaseExpiresAt": "",
            "finishedOn": now,
            "updatedAt": now,
            "returnvalue": json.dumps(result or {}, sort_keys=True),
        })
        pipe.zrem(self._key("active"), job_id)
        pipe.zadd(self._key("completed"), {job_id: now})
        pipe.execute()

    def fail(self, job_id: str, error: Exception | str, worker_id: str | None = None) -> None:
        raw = self.redis.hgetall(self._job_key(job_id))
        if worker_id and raw.get("leaseOwner") != worker_id:
            raise RuntimeError("worker does not own lease")
        attempts = int(raw.get("attemptsMade") or 0) + 1
        opts = json.loads(raw.get("opts") or "{}")
        max_attempts = int(opts.get("attempts", self.retry_policy.max_attempts))
        now = self._now_ms()
        if attempts >= max_attempts:
            pipe = self.redis.pipeline(transaction=True)
            pipe.hset(self._job_key(job_id), mapping={
                "status": JobStatus.DEAD_LETTERED.value,
                "attemptsMade": attempts,
                "leaseOwner": "",
                "leaseExpiresAt": "",
                "failedReason": str(error),
                "finishedOn": now,
                "updatedAt": now,
            })
            pipe.zrem(self._key("active"), job_id)
            pipe.zadd(self._key("failed"), {job_id: now})
            pipe.lpush(self._key("dlq"), job_id)
            pipe.execute()
            DEAD_LETTER_JOBS.labels(self.name, raw.get("name", "unknown")).inc()
            logger.error("bullmq job dead-lettered", extra={"job_id": job_id, "queue": self.name, "attempt": attempts})
            return

        delay_ms = self.retry_policy.delay_for_attempt(attempts) * 1000
        available_at = now + delay_ms
        pipe = self.redis.pipeline(transaction=True)
        pipe.hset(self._job_key(job_id), mapping={
            "status": JobStatus.QUEUED.value,
            "attemptsMade": attempts,
            "leaseOwner": "",
            "leaseExpiresAt": "",
            "failedReason": str(error),
            "delayUntil": available_at,
            "updatedAt": now,
        })
        pipe.zrem(self._key("active"), job_id)
        pipe.zadd(self._key("delayed"), {job_id: available_at})
        pipe.execute()
        logger.warning("bullmq job retry scheduled", extra={"job_id": job_id, "queue": self.name, "attempt": attempts})

    def promote_delayed(self) -> int:
        now = self._now_ms()
        due = self.redis.zrangebyscore(self._key("delayed"), 0, now)
        if not due:
            return 0
        pipe = self.redis.pipeline(transaction=True)
        for job_id in due:
            pipe.zrem(self._key("delayed"), job_id)
            pipe.lpush(self._key("wait"), job_id)
        pipe.execute()
        return len(due)

    def recover_expired_leases(self) -> int:
        now = self._now_ms()
        expired = self.redis.zrangebyscore(self._key("active"), 0, now)
        if not expired:
            return 0
        recovered = 0
        pipe = self.redis.pipeline(transaction=True)
        for job_id in expired:
            raw = self.redis.hgetall(self._job_key(job_id))
            if raw.get("status") == JobStatus.LEASED.value:
                pipe.hset(self._job_key(job_id), mapping={
                    "status": JobStatus.QUEUED.value,
                    "leaseOwner": "",
                    "leaseExpiresAt": "",
                    "updatedAt": now,
                })
                pipe.zrem(self._key("active"), job_id)
                pipe.lpush(self._key("wait"), job_id)
                recovered += 1
        pipe.execute()
        if recovered:
            WORKER_LEASE_RECOVERIES.labels(self.name).inc(recovered)
        return recovered

    def depth(self) -> int:
        self.promote_delayed()
        return int(self.redis.llen(self._key("wait")))

    def dead_letters(self) -> list[str]:
        return [str(item) for item in self.redis.lrange(self._key("dlq"), 0, -1)]

    def enqueue_bullmq_payload(self, name: str, data: dict[str, Any], priority: int = 50) -> str:
        """Ingress helper for external BullMQ producers that already provide job names."""

        task = RenderTask.model_validate({**data, "kind": name, "priority": priority})
        return self.enqueue(task)


def worker_token() -> str:
    return f"gpu-worker-{uuid4().hex[:12]}"
