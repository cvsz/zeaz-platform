from datetime import datetime, timezone
from .models import ShockType


class ShockSimulator:
    def __init__(self, organization_id: str, workspace_id: str):
        self.organization_id = organization_id
        self.workspace_id = workspace_id
        self.shocks: dict[str, dict] = {}
        self.simulations: list[dict] = []

    def define_shock(self, shock_id: str, name: str, shock_type: str, severity: float, probability: float) -> dict:
        shock = {
            "shock_id": shock_id,
            "name": name,
            "shock_type": ShockType(shock_type).value,
            "severity": max(-1.0, min(1.0, severity)),
            "probability": max(0.0, min(1.0, probability)),
            "effects": {},
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.shocks[shock_id] = shock
        return shock

    def add_effect(self, shock_id: str, metric: str, impact: float) -> dict | None:
        shock = self.shocks.get(shock_id)
        if shock is None:
            return None
        shock["effects"][metric] = impact
        return shock

    def run_simulation(self, shock_id: str, base_state: dict | None = None) -> dict | None:
        shock = self.shocks.get(shock_id)
        if shock is None:
            return None
        state = dict(base_state or {})
        expected_impact = shock["severity"] * shock["probability"]
        for metric, impact in shock["effects"].items():
            state[metric] = state.get(metric, 0.0) + impact * shock["severity"]
        result = {
            "shock_id": shock_id,
            "name": shock["name"],
            "shock_type": shock["shock_type"],
            "expected_impact": round(expected_impact, 4),
            "resulting_state": state,
            "simulated_at": datetime.now(timezone.utc).isoformat(),
        }
        self.simulations.append(result)
        return result

    def list_shocks(self) -> list[dict]:
        return [
            {
                "shock_id": s["shock_id"],
                "name": s["name"],
                "shock_type": s["shock_type"],
                "severity": s["severity"],
                "probability": s["probability"],
                "effect_metrics": list(s["effects"].keys()),
            }
            for s in self.shocks.values()
        ]

    def summary(self) -> dict:
        return {
            "defined_shocks": len(self.shocks),
            "simulations_run": len(self.simulations),
        }
