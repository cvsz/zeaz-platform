"""Workflow planning, recovery, and queue submission."""

from __future__ import annotations

from dataclasses import dataclass

from packages.ai_prompts.engine import TargetModel, compile_workflow
from packages.queue.render_queue import RenderQueueBackend, RenderTask
from packages.scene import CinematicWorkflow


@dataclass(frozen=True)
class WorkflowSubmission:
    workflow_id: str
    job_ids: list[str]


class WorkflowEngine:
    """Compile cinematic workflows into resumable queue-first render jobs."""

    def __init__(self, queue: RenderQueueBackend) -> None:
        self.queue = queue

    def submit(self, workflow: CinematicWorkflow, target_model: TargetModel = TargetModel.VEO) -> WorkflowSubmission:
        job_ids: list[str] = []
        for compiled in compile_workflow(workflow, target_model):
            task = RenderTask(
                prompt=compiled.prompt,
                style=workflow.style_guide,
                duration=compiled.duration_seconds,
                workflow_id=compiled.workflow_id,
                scene_id=compiled.scene_id,
                priority=compiled.priority,
                idempotency_key=f"{compiled.workflow_id}:{compiled.scene_id}:{compiled.target_model.value}",
            )
            job_ids.append(self.queue.enqueue(task))
        return WorkflowSubmission(str(workflow.id), job_ids)

    def recover(self) -> int:
        return self.queue.recover_expired_leases()
