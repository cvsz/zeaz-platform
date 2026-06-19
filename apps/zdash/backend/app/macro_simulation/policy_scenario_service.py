from datetime import datetime, timezone


class PolicyScenarioService:
    def __init__(self, organization_id: str, workspace_id: str):
        self.organization_id = organization_id
        self.workspace_id = workspace_id
        self.policy_scenarios: dict[str, dict] = {}

    def create_policy_scenario(self, scenario_id: str, name: str, policy_type: str, parameters: dict | None = None) -> dict:
        scenario = {
            "scenario_id": scenario_id,
            "name": name,
            "policy_type": policy_type,
            "parameters": parameters or {},
            "impact_estimates": {},
            "status": "draft",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.policy_scenarios[scenario_id] = scenario
        return scenario

    def estimate_impact(self, scenario_id: str, metric: str, delta: float) -> dict | None:
        scenario = self.policy_scenarios.get(scenario_id)
        if scenario is None:
            return None
        scenario["impact_estimates"][metric] = delta
        return {"scenario_id": scenario_id, "metric": metric, "delta": delta}

    def analyze(self, scenario_id: str) -> dict | None:
        scenario = self.policy_scenarios.get(scenario_id)
        if scenario is None:
            return None
        impacts = scenario["impact_estimates"]
        total_impact = sum(impacts.values()) if impacts else 0.0
        return {
            "scenario_id": scenario_id,
            "name": scenario["name"],
            "policy_type": scenario["policy_type"],
            "total_estimated_impact": round(total_impact, 4),
            "metric_count": len(impacts),
            "status": "analyzed" if impacts else "no_impacts_estimated",
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
        }

    def list_scenarios(self) -> list[dict]:
        return [
            {
                "scenario_id": sid,
                "name": s["name"],
                "policy_type": s["policy_type"],
                "status": s["status"],
                "impact_metrics": list(s["impact_estimates"].keys()),
            }
            for sid, s in self.policy_scenarios.items()
        ]
