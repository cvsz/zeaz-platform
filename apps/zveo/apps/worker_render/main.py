"""Distributed GPU-aware render worker entrypoint."""

from __future__ import annotations

import os
import signal
import threading
import time
from concurrent.futures import Future, ThreadPoolExecutor
from dataclasses import asdict
from pathlib import Path

from prometheus_client import start_http_server

from packages.ffmpeg.composer import ARCHIVE_4K, SOCIAL_VERTICAL, YOUTUBE_1080P, build_thumbnail_command, build_transcode_command, run_ffmpeg
from packages.logger import configure_logging, get_logger
from packages.queue.bullmq_queue import BullMQRedisQueue, worker_token
from packages.queue.render_queue import QueueJob, RenderJobKind, RenderQueueBackend
from packages.render.adapters import MultiProviderRenderAdapter
from packages.storage.artifacts import ArtifactUploader
from packages.storage.s3 import S3AssetStore
from packages.storage.validator import sha256_file
from packages.telemetry.metrics import QUEUE_DEPTH, RENDER_DURATION, WORKER_ACTIVE_JOBS, WORKER_CONCURRENCY, WORKER_HEARTBEATS, observe_latency

configure_logging()
logger = get_logger(__name__)

TIERS = {"youtube_1080p": YOUTUBE_1080P, "social_vertical": SOCIAL_VERTICAL, "archive_4k": ARCHIVE_4K}


class AdaptiveConcurrency:
    """Adjusts local concurrency from GPU inventory, queue pressure, and failures."""

    def __init__(self, minimum: int = 1, maximum: int | None = None) -> None:
        self.minimum = minimum
        self.maximum = maximum or int(os.getenv("WORKER_MAX_CONCURRENCY", str(self._gpu_count() or 2)))
        self.current = max(minimum, min(self.maximum, int(os.getenv("WORKER_INITIAL_CONCURRENCY", str(minimum)))))
        WORKER_CONCURRENCY.labels(os.getenv("WORKER_ID", "unknown")).set(self.current)

    @staticmethod
    def _gpu_count() -> int:
        visible = os.getenv("NVIDIA_VISIBLE_DEVICES") or os.getenv("CUDA_VISIBLE_DEVICES")
        if visible and visible not in {"", "none", "void"}:
            return len([item for item in visible.split(",") if item.strip() and item.strip() != "all"] or ["all"])
        return 0

    def tune(self, queue_depth: int, failures: int, worker_id: str) -> int:
        if failures:
            self.current = max(self.minimum, self.current - 1)
        elif queue_depth > self.current * 2:
            self.current = min(self.maximum, self.current + 1)
        elif queue_depth == 0:
            self.current = max(self.minimum, self.current - 1)
        WORKER_CONCURRENCY.labels(worker_id).set(self.current)
        return self.current


class RenderWorker:
    """Lease-based worker with heartbeats, checkpoints, retries, and artifact upload."""

    def __init__(self, queue: RenderQueueBackend, worker_id: str, lease_seconds: int = 90) -> None:
        self.queue = queue
        self.worker_id = worker_id
        self.lease_seconds = lease_seconds
        self.adapter = MultiProviderRenderAdapter()
        self.stop_event = threading.Event()
        self.concurrency = AdaptiveConcurrency()
        bucket = os.getenv("ARTIFACT_BUCKET", "zveo-artifacts")
        endpoint = os.getenv("S3_ENDPOINT_URL")
        self.uploader = ArtifactUploader(S3AssetStore(bucket=bucket, endpoint_url=endpoint), os.getenv("ARTIFACT_PREFIX", "renders"))

    def _heartbeat_loop(self, job_id: str) -> None:
        while not self.stop_event.wait(max(1, self.lease_seconds // 3)):
            if not self.queue.heartbeat(job_id, self.worker_id, self.lease_seconds):
                logger.error("heartbeat lost lease", extra={"job_id": job_id, "queue": "render"})
                self.stop_event.set()
                return
            WORKER_HEARTBEATS.labels("render", self.worker_id).inc()

    def _post_process(self, job: QueueJob, source: Path) -> list[Path]:
        tier_name = job.task.export_tier or "youtube_1080p"
        tier = TIERS.get(tier_name, YOUTUBE_1080P)
        output = source.with_name(f"{source.stem}-{tier.name}.mp4")
        thumb = source.with_name(f"{source.stem}-thumb.jpg")
        self.queue.checkpoint(job.id, self.worker_id, {"stage": "ffmpeg_transcode", "tier": tier.name})
        run_ffmpeg(build_transcode_command(str(source), str(output), tier), "export_rendering")
        self.queue.checkpoint(job.id, self.worker_id, {"stage": "thumbnail"})
        run_ffmpeg(build_thumbnail_command(str(output), str(thumb)), "thumbnail")
        return [output, thumb]

    def execute(self, job: QueueJob) -> None:
        WORKER_ACTIVE_JOBS.labels("render", self.worker_id, job.task.kind.value).inc()
        heartbeat = threading.Thread(target=self._heartbeat_loop, args=(job.id,), daemon=True)
        heartbeat.start()
        try:
            logger.info("job execution started", extra={"job_id": job.id, "queue": "render", "workflow_id": job.task.workflow_id, "scene_id": job.task.scene_id})
            self.queue.checkpoint(job.id, self.worker_id, {"stage": "provider_render", "provider_checkpoint": job.checkpoint})
            with observe_latency(RENDER_DURATION, job.task.kind.value):
                result = self.adapter.render(job.task, job.checkpoint)
            if sha256_file(result.output_path) != result.checksum_sha256:
                raise ValueError("render artifact checksum mismatch")

            produced = [result.output_path]
            if job.task.kind in {RenderJobKind.POST_PROCESSING, RenderJobKind.EXPORT_RENDERING} and os.getenv("ENABLE_FFMPEG", "true").lower() == "true":
                produced = self._post_process(job, result.output_path)

            self.queue.checkpoint(job.id, self.worker_id, {"stage": "artifact_upload", "paths": [str(path) for path in produced]})
            uploads = [asdict(self.uploader.upload(path, job.id, job.task.kind.value, result.content_type if path == result.output_path else "application/octet-stream")) for path in produced]
            self.queue.complete(job.id, self.worker_id, {"provider_job_id": result.provider_job_id, "artifacts": uploads})
            logger.info("job execution completed", extra={"job_id": job.id, "queue": "render"})
        except Exception as exc:
            logger.exception("job execution failed", extra={"job_id": job.id, "queue": "render"})
            self.queue.fail(job.id, exc, self.worker_id)
            raise
        finally:
            WORKER_ACTIVE_JOBS.labels("render", self.worker_id, job.task.kind.value).dec()

    def run_forever(self) -> None:
        failures = 0
        with ThreadPoolExecutor(max_workers=self.concurrency.maximum) as executor:
            futures: set[Future] = set()
            while not self.stop_event.is_set():
                recovered = self.queue.recover_expired_leases()
                depth = self.queue.depth()
                QUEUE_DEPTH.labels("render").set(depth)
                target = self.concurrency.tune(depth, failures, self.worker_id)
                failures = 0
                futures = {future for future in futures if not future.done()}
                while len(futures) < target:
                    job = self.queue.lease(self.worker_id, self.lease_seconds)
                    if not job:
                        break
                    futures.add(executor.submit(self.execute, job))
                for future in list(futures):
                    if future.done():
                        try:
                            future.result()
                        except Exception:
                            failures += 1
                        futures.remove(future)
                logger.info("worker tick", extra={"queue": "render", "attempt": len(futures) + recovered})
                self.stop_event.wait(float(os.getenv("WORKER_POLL_SECONDS", "2")))


def main() -> None:
    worker_id = os.getenv("WORKER_ID", worker_token())
    os.environ["WORKER_ID"] = worker_id
    start_http_server(int(os.getenv("METRICS_PORT", "9100")))
    queue = BullMQRedisQueue(os.getenv("REDIS_URL", "redis://localhost:6379/0"), os.getenv("BULLMQ_QUEUE", "render"))
    worker = RenderWorker(queue, worker_id, int(os.getenv("LEASE_SECONDS", "90")))
    signal.signal(signal.SIGTERM, lambda *_: worker.stop_event.set())
    signal.signal(signal.SIGINT, lambda *_: worker.stop_event.set())
    worker.run_forever()


if __name__ == "__main__":
    main()
