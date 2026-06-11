from datetime import datetime, timezone
from .models import DecisionLineageEventType


class DecisionLineage:
    def __init__(self, organization_id: str, workspace_id: str):
        self.organization_id = organization_id
        self.workspace_id = workspace_id
        self.decisions: dict[str, dict] = {}
        self.events: list[dict] = []

    def create_decision(self, decision_id: str, title: str, description: str = "") -> dict:
        decision = {
            "decision_id": decision_id,
            "title": title,
            "description": description,
            "status": "open",
            "assumptions": [],
            "evidence": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.decisions[decision_id] = decision
        self._record_event(decision_id, DecisionLineageEventType.decision_created, {"title": title})
        return decision

    def add_assumption(self, decision_id: str, assumption: str) -> list[str]:
        decision = self.decisions.get(decision_id)
        if decision is None:
            return []
        decision["assumptions"].append(assumption)
        self._record_event(decision_id, DecisionLineageEventType.assumption_added, {"assumption": assumption})
        return decision["assumptions"]

    def add_evidence(self, decision_id: str, evidence: str) -> list[str]:
        decision = self.decisions.get(decision_id)
        if decision is None:
            return []
        decision["evidence"].append(evidence)
        self._record_event(decision_id, DecisionLineageEventType.evidence_added, {"evidence": evidence})
        return decision["evidence"]

    def get_lineage(self, decision_id: str) -> dict:
        decision = self.decisions.get(decision_id)
        if decision is None:
            return {"decision_id": decision_id, "status": "not_found", "events": []}
        related_events = [e for e in self.events if e["decision_id"] == decision_id]
        return {**decision, "events": related_events}

    def _record_event(self, decision_id: str, event_type: DecisionLineageEventType, payload: dict) -> None:
        self.events.append({
            "decision_id": decision_id,
            "event_type": event_type.value,
            "payload": payload,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
