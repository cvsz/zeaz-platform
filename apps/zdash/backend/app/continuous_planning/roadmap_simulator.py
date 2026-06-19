from datetime import datetime, timezone


class RoadmapSimulator:
    def __init__(self, organization_id: str, workspace_id: str):
        self.organization_id = organization_id
        self.workspace_id = workspace_id
        self.scenarios: dict[str, dict] = {}

    def create_scenario(self, scenario_id: str, name: str, milestones: list[dict], assumptions: list[str] | None = None) -> dict:
        scenario = {
            "scenario_id": scenario_id,
            "name": name,
            "milestones": milestones,
            "assumptions": assumptions or [],
            "status": "draft",
            "forecasts": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.scenarios[scenario_id] = scenario
        return scenario

    def run_simulation(self, scenario_id: str) -> dict | None:
        scenario = self.scenarios.get(scenario_id)
        if scenario is None:
            return None
        total_milestones = len(scenario["milestones"])
        completed = sum(1 for m in scenario["milestones"] if m.get("achieved", False))
        forecast = {
            "total_milestones": total_milestones,
            "completed": completed,
            "completion_rate": round(completed / max(total_milestones, 1), 4),
            "estimated_completion": "on_track" if completed / max(total_milestones, 1) >= 0.5 else "at_risk",
            "simulated_at": datetime.now(timezone.utc).isoformat(),
        }
        scenario["forecasts"].append(forecast)
        scenario["status"] = "simulated"
        return forecast

    def compare_scenarios(self, scenario_ids: list[str]) -> list[dict]:
        results = []
        for sid in scenario_ids:
            scenario = self.scenarios.get(sid)
            if scenario is None:
                continue
            last_forecast = scenario["forecasts"][-1] if scenario["forecasts"] else {}
            results.append({
                "scenario_id": sid,
                "name": scenario["name"],
                "milestone_count": len(scenario["milestones"]),
                "latest_forecast": last_forecast,
            })
        return results

    def list_scenarios(self) -> list[dict]:
        return [
            {"scenario_id": sid, "name": s["name"], "status": s["status"], "milestone_count": len(s["milestones"])}
            for sid, s in self.scenarios.items()
        ]
