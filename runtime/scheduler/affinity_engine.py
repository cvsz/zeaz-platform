import logging
from typing import Dict, Any, List
from runtime.scheduler.models import CognitiveTask
from runtime.llm.provider_registry import ProviderRegistry

logger = logging.getLogger("AffinityEngine")

class AffinityEngine:
    def __init__(self, registry: ProviderRegistry):
        self.registry = registry

    def calculate_affinity(self, task: CognitiveTask, provider_id: str) -> float:
        """
        Calculate an affinity score (0.0 to 1.0) for a task on a specific provider.
        """
        score = 0.5 # Baseline
        
        capabilities = self.registry.discovery_capabilities(provider_id)
        if not capabilities:
            return 0.0
            
        # 1. Capability Matching
        reqs = task.affinity_requirements
        if reqs.get("model") and reqs["model"] != capabilities.get("model"):
            score -= 0.3
            
        if reqs.get("location") and reqs["location"] != capabilities.get("location"):
            score -= 0.2
            
        # 2. Performance Affinity (latency, throughput - mock logic for now)
        # In a real system, we'd fetch this from metrics
        
        # 3. Cost Affinity
        # If task is low priority, penalize expensive providers
        if task.priority == "LOW":
            # Assume vertex-ai is "baseline" and we prefer cheaper ones if available
            pass

        return max(0.0, min(1.0, score))

    def get_best_provider(self, task: CognitiveTask, candidate_providers: List[str]) -> str:
        """
        Find the provider with the highest affinity score for a task.
        """
        scores = {pid: self.calculate_affinity(task, pid) for pid in candidate_providers}
        if not scores:
            return candidate_providers[0] if candidate_providers else None
            
        best_provider = max(scores, key=scores.get)
        logger.info(f"Task {task.task_id} affinity: best provider {best_provider} (score {scores[best_provider]})")
        return best_provider
