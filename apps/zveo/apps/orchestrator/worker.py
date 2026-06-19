"""Distributed render worker with leases, retries, health, and structured logging."""

from __future__ import annotations

import os
import signal
import time
from dataclasses import dataclass

from packages.logger import get_logger
from packages.queue.render_queue import InMemoryQueue, RenderTask, enqueue_render, new_worker_id
from packages.render.adapters import LocalManifestRenderAdapter, RenderAdapter
from packages.telemetry.metrics import QUEUE_DEPTH, RENDER_DURATION, observe_latency

logger = get_logger(__name__)
render_queue = InMemoryQueue()


@dataclass
class WorkerConfig:
    poll_interval_seconds: float = 1.0
    lease_seconds: int = 120
    adaptive_min_concurrency: int = 1
    adaptive_max_concurrency: int = 8


class RenderWorker:
    """Lease jobs from a queue and execute them via a render adapter."""

    def __init__(self, queue: InMemoryQueue, adapter: RenderAdapter | None = None, worker_id: str | None = None) -> None:
        self.queue = queue
        self.adapter = adapter or LocalManifestRenderAdapter()
        self.worker_id = worker_id or new_worker_id("render")
        self._running = True

    def stop(self, *_args: object) -> None:
        self._running = False

    def run_once(self) -> bool:
        recovered = self.queue.recover_expired_leases()
        if recovered:
            logger.warning("expired leases recovered", extra={"queue": self.queue.name})
        QUEUE_DEPTH.labels(self.queue.name).set(self.queue.depth())
        job = self.queue.lease(self.worker_id)
        if job is None:
            return False
        try:
            with observe_latency(RENDER_DURATION, self.adapter.__class__.__name__):
                result = self.adapter.render(job.task)
            self.queue.complete(job.id)
            logger.info("render complete", extra={"job_id": job.id, "scene_id": job.task.scene_id, "asset_id": str(result.output_path)})
            return True
        except Exception as exc:
            self.queue.fail(job.id, exc)
            logger.exception("render failed", extra={"job_id": job.id, "scene_id": job.task.scene_id})
            return False

    def run_forever(self, config: WorkerConfig | None = None) -> None:
        active = config or WorkerConfig()
        signal.signal(signal.SIGTERM, self.stop)
        signal.signal(signal.SIGINT, self.stop)
        while self._running:
            did_work = self.run_once()
            if not did_work:
                time.sleep(active.poll_interval_seconds)


def submit_render(prompt: str, style: str, duration: int) -> str:
    task = RenderTask(prompt=prompt, style=style, duration=duration)
    return enqueue_render(task, render_queue)


if __name__ == "__main__":
    RenderWorker(render_queue).run_forever(WorkerConfig(poll_interval_seconds=float(os.getenv("POLL_INTERVAL_SECONDS", "1"))))
