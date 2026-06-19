"""Prometheus metrics and OpenTelemetry bootstrap for zVEO services."""

from __future__ import annotations

from contextlib import contextmanager
from time import perf_counter
from typing import Iterator

from prometheus_client import Counter, Gauge, Histogram, generate_latest

METRIC_NAMES = (
    "render_duration_seconds",
    "queue_depth",
    "failed_jobs_total",
    "export_size_bytes",
    "ffmpeg_processing_time_seconds",
    "workflow_recoveries_total",
    "dead_letter_jobs_total",
    "worker_heartbeats_total",
    "worker_active_jobs",
    "worker_concurrency",
    "worker_lease_recoveries_total",
    "artifact_uploads_total",
)

QUEUE_DEPTH = Gauge("queue_depth", "Number of jobs waiting in a queue", ["queue"])
FAILED_JOBS = Counter("failed_jobs_total", "Jobs that exhausted retry attempts", ["queue", "kind"])
DEAD_LETTER_JOBS = Counter("dead_letter_jobs_total", "Jobs moved to a dead-letter queue", ["queue", "kind"])
RENDER_DURATION = Histogram("render_duration_seconds", "Render execution latency", ["adapter"])
FFMPEG_DURATION = Histogram("ffmpeg_processing_time_seconds", "FFmpeg processing latency", ["operation"])
EXPORT_SIZE = Histogram("export_size_bytes", "Produced export sizes", ["tier"])
WORKFLOW_RECOVERIES = Counter("workflow_recoveries_total", "Workflow recovery operations", ["reason"])
API_REQUESTS = Counter("api_requests_total", "API requests", ["method", "path", "status"])
WORKER_HEARTBEATS = Counter("worker_heartbeats_total", "Successful worker lease heartbeats", ["queue", "worker"])
WORKER_ACTIVE_JOBS = Gauge("worker_active_jobs", "Jobs currently executing on a worker", ["queue", "worker", "kind"])
WORKER_CONCURRENCY = Gauge("worker_concurrency", "Adaptive worker concurrency limit", ["worker"])
WORKER_LEASE_RECOVERIES = Counter("worker_lease_recoveries_total", "Expired leases recovered by workers", ["queue"])
ARTIFACT_UPLOADS = Counter("artifact_uploads_total", "Artifacts uploaded by render workers", ["kind", "content_type"])


def metrics_response() -> bytes:
    """Return the current Prometheus exposition document."""

    return generate_latest()


@contextmanager
def observe_latency(metric: Histogram, *labels: str) -> Iterator[None]:
    """Observe elapsed wall-clock time for a labelled histogram."""

    started = perf_counter()
    try:
        yield
    finally:
        metric.labels(*labels).observe(perf_counter() - started)
