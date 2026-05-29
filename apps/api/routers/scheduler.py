from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
import uuid
from runtime.scheduler.models import CognitiveTask, TaskStatus, WorkloadSnapshot
from runtime.scheduler.scheduler_engine import SchedulerEngine
from runtime.scheduler.lease_manager import LeaseManager
from runtime.scheduler.execution_journal import ExecutionJournal
from runtime.scheduler.workload_balancer import WorkloadBalancer
from runtime.scheduler.backpressure_manager import BackpressureManager
from runtime.scheduler.affinity_engine import AffinityEngine
from runtime.llm.provider_registry import ProviderRegistry
from runtime.llm.token_budget_engine import TokenBudgetEngine

<<<<<<< HEAD
from runtime.policy_engine import PolicyEngine

=======
>>>>>>> f2f2392 (Codex/final cleanup docs env backups (#122))
router = APIRouter()

# Setup (In a real app, use dependency injection/global state)
registry = ProviderRegistry()
budget_engine = TokenBudgetEngine()
affinity_engine = AffinityEngine(registry)
balancer = WorkloadBalancer(registry, budget_engine, affinity_engine)
backpressure = BackpressureManager()
lease_manager = LeaseManager()
journal = ExecutionJournal()
<<<<<<< HEAD
policy_engine = PolicyEngine()
=======
>>>>>>> f2f2392 (Codex/final cleanup docs env backups (#122))

scheduler = SchedulerEngine(
    "redis://localhost:6379/0",
    lease_manager,
    journal,
    balancer,
<<<<<<< HEAD
    backpressure,
    policy_engine
=======
    backpressure
>>>>>>> f2f2392 (Codex/final cleanup docs env backups (#122))
)

@router.post("/tasks")
async def submit_task(task_data: Dict[str, Any]):
    try:
        task = CognitiveTask(
            task_id=str(uuid.uuid4()),
            tenant_id=task_data.get("tenant_id", "default"),
            action_type=task_data.get("action_type", "GENERIC"),
            payload=task_data.get("payload", {}),
            priority=task_data.get("priority", "NORMAL"),
            affinity_requirements=task_data.get("affinity", {})
        )
        await scheduler.submit_task(task)
        return {"task_id": task.task_id, "status": "QUEUED"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/{task_id}/lineage")
async def get_task_lineage(task_id: str):
    return journal.get_task_lineage(task_id)

@router.post("/topology/snapshot")
async def update_snapshot(snapshot: WorkloadSnapshot):
    balancer.update_snapshot(snapshot)
    backpressure.calculate_backpressure(snapshot)
    return {"status": "UPDATED"}

@router.get("/topology/health")
async def get_health():
    return balancer.get_topology_health()
