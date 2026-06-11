"""FastAPI gateway for zVEO queue-first media orchestration."""

from __future__ import annotations

from time import perf_counter
import os
from uuid import uuid4

from fastapi import FastAPI, Request, Response
from pydantic import BaseModel, Field

from packages.ai_prompts.engine import TargetModel, build_prompt, compile_workflow
from packages.logger import configure_logging, get_logger
from packages.queue.bullmq_queue import BullMQRedisQueue
from packages.queue.render_queue import InMemoryQueue, RenderTask
from packages.scene import CinematicWorkflow
from packages.telemetry.metrics import API_REQUESTS, metrics_response
from packages.workflow import WorkflowEngine

configure_logging()
logger = get_logger(__name__)
app = FastAPI(title="zVEO Media Orchestration API", version="1.0.0")
queue = BullMQRedisQueue(os.getenv("REDIS_URL", "redis://localhost:6379/0"), os.getenv("BULLMQ_QUEUE", "render")) if os.getenv("QUEUE_BACKEND", "memory") == "bullmq" else InMemoryQueue()
workflow_engine = WorkflowEngine(queue)


class RenderJob(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=8_000)
    style: str = Field(default="cinematic", min_length=1, max_length=256)
    duration: int = Field(default=30, ge=1, le=600)
    priority: int = Field(default=50, ge=0, le=100)
    idempotency_key: str | None = Field(default=None, max_length=128)


@app.middleware("http")
async def observability_middleware(request: Request, call_next):
    started = perf_counter()
    response = await call_next(request)
    API_REQUESTS.labels(request.method, request.url.path, str(response.status_code)).inc()
    logger.info(
        "api request",
        extra={"queue": "api", "attempt": round((perf_counter() - started) * 1000)},
    )
    return response


@app.get("/health")
async def health() -> dict[str, str | int]:
    return {"status": "ok", "queue_depth": queue.depth()}


@app.get("/metrics")
async def metrics() -> Response:
    return Response(metrics_response(), media_type="text/plain; version=0.0.4")


@app.post("/jobs", status_code=202)
async def create_job(job: RenderJob) -> dict[str, str]:
    compiled = build_prompt(job.prompt, job.style)
    task = RenderTask(
        prompt=compiled,
        style=job.style,
        duration=job.duration,
        priority=job.priority,
        idempotency_key=job.idempotency_key or str(uuid4()),
    )
    job_id = queue.enqueue(task)
    return {"job_id": job_id, "status": "queued"}


@app.post("/workflows", status_code=202)
async def create_workflow(workflow: CinematicWorkflow, target_model: TargetModel = TargetModel.VEO) -> dict[str, object]:
    submission = workflow_engine.submit(workflow, target_model)
    return {"workflow_id": submission.workflow_id, "job_ids": submission.job_ids, "status": "queued"}


@app.post("/workflows/compile")
async def compile_cinematic_workflow(workflow: CinematicWorkflow, target_model: TargetModel = TargetModel.VEO) -> dict[str, object]:
    prompts = compile_workflow(workflow, target_model)
    return {"workflow_id": str(workflow.id), "prompts": [prompt.model_dump(mode="json") for prompt in prompts]}


@app.post("/recover")
async def recover_workflows() -> dict[str, int]:
    return {"recovered_leases": workflow_engine.recover()}
