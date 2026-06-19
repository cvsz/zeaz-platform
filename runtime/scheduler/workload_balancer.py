import logging
from typing import Dict, Any, List, Optional
from runtime.scheduler.models import CognitiveTask, WorkloadSnapshot
from runtime.scheduler.affinity_engine import AffinityEngine
from runtime.llm.provider_registry import ProviderRegistry
from runtime.llm.token_budget_engine import TokenBudgetEngine

logger = logging.getLogger("WorkloadBalancer")

class WorkloadBalancer:
    def __init__(
        self, 
        registry: ProviderRegistry, 
        budget_engine: TokenBudgetEngine,
        affinity_engine: AffinityEngine
    ):
        self.registry = registry
        self.budget_engine = budget_engine
        self.affinity_engine = affinity_engine
        self.snapshots: Dict[str, WorkloadSnapshot] = {}

    def update_snapshot(self, snapshot: WorkloadSnapshot):
        self.snapshots[snapshot.provider_id] = snapshot
        logger.debug(f"Snapshot updated for {snapshot.provider_id}: load {snapshot.current_load}")

    def select_provider(self, task: CognitiveTask) -> Optional[str]:
        """
        Select the best provider based on health, affinity, load, and budget.
        """
        available_providers = self.registry.get_available_providers()
        if not available_providers:
            logger.error("No available providers for task selection.")
            return None

        # 1. Filter by Budget
        eligible_providers = []
        for pid in available_providers:
            # Estimate tokens - default to 1000 if not in payload
            estimated = task.payload.get("estimated_tokens", 1000)
            if self.budget_engine.check_budget(task.tenant_id, pid, estimated):
                eligible_providers.append(pid)
        
        if not eligible_providers:
            logger.warning(f"No providers within budget for tenant {task.tenant_id}")
            return None

        # 2. Rank by Load & Latency (Topology Awareness)
        def rank_score(pid: str) -> float:
            snapshot = self.snapshots.get(pid)
            load_factor = snapshot.current_load if snapshot else 0.5
            latency_factor = min(snapshot.latency_ms / 1000.0, 1.0) if snapshot else 0.5
            affinity = self.affinity_engine.calculate_affinity(task, pid)
            
            # Combine factors (higher is better)
            # Affinity (0-1) weighted heavily
            # Load & Latency (0-1) inverted and weighted
            return (affinity * 0.6) + ((1.0 - load_factor) * 0.2) + ((1.0 - latency_factor) * 0.2)

        best_provider = max(eligible_providers, key=rank_score)
        logger.info(f"WorkloadBalancer selected {best_provider} for task {task.task_id} (Rank: {rank_score(best_provider):.2f})")
        return best_provider

    def get_topology_health(self) -> Dict[str, Any]:
        return {
            pid: {
                "load": s.current_load,
                "active_tasks": s.active_tasks,
                "latency_ms": s.latency_ms
            } for pid, s in self.snapshots.items()
        }
