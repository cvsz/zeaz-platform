import time
import logging
from typing import Dict
from state_graph import StateGraph, ServiceState, ServiceNode
from action_coordinator import ActionCoordinator

logger = logging.getLogger("ConvergenceEngine")

class ConvergenceEngine:
    def __init__(self, state_graph: StateGraph, coordinator: ActionCoordinator):
        self.state_graph = state_graph
        self.coordinator = coordinator
        self.last_action_time: Dict[str, float] = {}
        self.cooldown_window = 30.0  # seconds

    def reconcile(self):
        targets = self.state_graph.get_convergence_targets()
        if not targets:
            logger.info("System is converged. No reconciliation needed.")
            return

        for target in targets:
            # Check cooldown to prevent oscillation / restart storms
            last_time = self.last_action_time.get(target.name, 0)
            if time.time() - last_time < self.cooldown_window:
                logger.warning(f"Cooldown active for {target.name}. Skipping reconciliation to prevent oscillation.")
                continue

            # Check repair budget
            if target.repair_budget <= 0:
                logger.error(f"Repair budget exhausted for {target.name}. Halting automated convergence.")
                continue

            # Dependency-aware healing
            if target.desired_state == ServiceState.HEALTHY and target.actual_state in [ServiceState.DEGRADED, ServiceState.FAILED]:
                if not self.state_graph.compute_dependencies_met(target.name):
                    logger.warning(f"Dependencies not met for {target.name}. Delaying healing.")
                    continue
                
                # Execute healing via coordinator
                if self.coordinator.acquire_lease(f"heal_{target.name}"):
                    logger.info(f"Initiating healing for {target.name}")
                    # In a real system, trigger restart/repair commands here
                    target.repair_budget -= 1
                    self.last_action_time[target.name] = time.time()
                    self.coordinator.release_lease(f"heal_{target.name}")
