from datetime import datetime, timezone


class PlanningMemory:
    def __init__(self, organization_id: str, workspace_id: str):
        self.organization_id = organization_id
        self.workspace_id = workspace_id
        self.cycles: list[dict] = []
        self.outcomes: list[dict] = []
        self.insights: list[dict] = []

    def store_cycle(self, cycle_id: str, data: dict) -> dict:
        entry = {
            "cycle_id": cycle_id,
            "data": data,
            "stored_at": datetime.now(timezone.utc).isoformat(),
        }
        self.cycles.append(entry)
        return entry

    def store_outcome(self, cycle_id: str, outcome: str, metrics: dict | None = None) -> dict:
        entry = {
            "cycle_id": cycle_id,
            "outcome": outcome,
            "metrics": metrics or {},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self.outcomes.append(entry)
        return entry

    def record_insight(self, insight: str, tags: list[str] | None = None) -> dict:
        entry = {
            "insight": insight,
            "tags": tags or [],
            "recorded_at": datetime.now(timezone.utc).isoformat(),
        }
        self.insights.append(entry)
        return entry

    def recall_cycle(self, cycle_id: str) -> dict | None:
        for c in self.cycles:
            if c["cycle_id"] == cycle_id:
                return c
        return None

    def search_insights(self, tag: str) -> list[dict]:
        return [i for i in self.insights if tag in i["tags"]]

    def summarize(self) -> dict:
        return {
            "total_cycles": len(self.cycles),
            "total_outcomes": len(self.outcomes),
            "total_insights": len(self.insights),
        }
