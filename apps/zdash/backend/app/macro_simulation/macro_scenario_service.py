from datetime import datetime, timezone
from .models import MacroScenarioType, MacroScenario


class MacroScenarioService:
    def __init__(self, organization_id: str, workspace_id: str):
        self.organization_id = organization_id
        self.workspace_id = workspace_id
        self.scenarios: dict[str, MacroScenario] = {}

    def create_scenario(self, name: str, scenario_type: str, horizon: str = "12m", assumptions: list[str] | None = None) -> MacroScenario:
        scenario_id = f"macro-{len(self.scenarios) + 1}"
        scenario = MacroScenario(
            id=scenario_id,
            organization_id=self.organization_id,
            workspace_id=self.workspace_id,
            name=name,
            scenario_type=MacroScenarioType(scenario_type),
            horizon=horizon,
            assumptions=assumptions or [],
        )
        self.scenarios[scenario_id] = scenario
        return scenario

    def update_inputs(self, scenario_id: str, inputs: dict) -> MacroScenario | None:
        scenario = self.scenarios.get(scenario_id)
        if scenario is None:
            return None
        scenario.inputs.update(inputs)
        return scenario

    def set_confidence(self, scenario_id: str, confidence: float) -> MacroScenario | None:
        scenario = self.scenarios.get(scenario_id)
        if scenario is None:
            return None
        scenario.confidence = max(0.0, min(1.0, confidence))
        return scenario

    def list_scenarios(self) -> list[dict]:
        return [
            {
                "id": s.id,
                "name": s.name,
                "scenario_type": s.scenario_type.value,
                "horizon": s.horizon,
                "confidence": s.confidence,
                "assumption_count": len(s.assumptions),
            }
            for s in self.scenarios.values()
        ]

    def get_scenario(self, scenario_id: str) -> MacroScenario | None:
        return self.scenarios.get(scenario_id)
