from datetime import datetime, timezone
from .models import PlanningCycleStatus


class PlanningLoop:
    def __init__(self, organization_id: str, workspace_id: str, horizon: str = "3m"):
        self.organization_id = organization_id
        self.workspace_id = workspace_id
        self.horizon = horizon
        self.cycle_id: str | None = None
        self.status = PlanningCycleStatus.scheduled
        self.iterations: list[dict] = []

    def start_cycle(self, cycle_id: str) -> dict:
        self.cycle_id = cycle_id
        self.status = PlanningCycleStatus.running
        entry = {
            "cycle_id": cycle_id,
            "status": self.status.value,
            "started_at": datetime.now(timezone.utc).isoformat(),
            "horizon": self.horizon,
        }
        self.iterations.append(entry)
        return entry

    def iterate(self, findings: dict | None = None) -> dict:
        iteration = {
            "cycle_id": self.cycle_id,
            "iteration": len(self.iterations) + 1,
            "findings": findings or {},
            "status": self.status.value,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self.iterations.append(iteration)
        return iteration

    def complete_cycle(self, outcome: str | None = None) -> dict:
        self.status = PlanningCycleStatus.completed
        result = {
            "cycle_id": self.cycle_id,
            "status": self.status.value,
            "outcome": outcome or "completed_without_outcome",
            "total_iterations": len(self.iterations),
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }
        self.iterations.append(result)
        return result

    def get_status(self) -> dict:
        return {
            "cycle_id": self.cycle_id,
            "status": self.status.value,
            "iteration_count": len(self.iterations),
            "horizon": self.horizon,
        }
