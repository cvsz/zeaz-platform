from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class InitiativeAssessment:
    initiative_id: str
    name: str
    impact_score: float
    confidence: float
    resource_cost: float
    expected_roi: float
    risks: list[str] = field(default_factory=list)
    assessed_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class InitiativeImpact:
    def __init__(self, organization_id: str):
        self.organization_id = organization_id
        self.assessments: dict[str, InitiativeAssessment] = {}

    def assess(self, initiative_id: str, name: str, impact_score: float, confidence: float, resource_cost: float) -> InitiativeAssessment:
        roi = impact_score / max(resource_cost, 0.01)
        assessment = InitiativeAssessment(
            initiative_id=initiative_id,
            name=name,
            impact_score=max(-1.0, min(1.0, impact_score)),
            confidence=max(0.0, min(1.0, confidence)),
            resource_cost=max(0.0, resource_cost),
            expected_roi=round(roi, 4),
        )
        self.assessments[initiative_id] = assessment
        return assessment

    def add_risk(self, initiative_id: str, risk: str) -> list[str]:
        assessment = self.assessments.get(initiative_id)
        if assessment is None:
            return []
        assessment.risks.append(risk)
        return assessment.risks

    def get_top_impact(self, limit: int = 5) -> list[InitiativeAssessment]:
        sorted_items = sorted(self.assessments.values(), key=lambda a: a.impact_score, reverse=True)
        return sorted_items[:limit]

    def summary(self) -> dict:
        if not self.assessments:
            return {"total": 0, "avg_impact": 0.0, "avg_roi": 0.0}
        impacts = [a.impact_score for a in self.assessments.values()]
        rois = [a.expected_roi for a in self.assessments.values()]
        return {
            "total": len(self.assessments),
            "avg_impact": round(sum(impacts) / len(impacts), 4),
            "avg_roi": round(sum(rois) / len(rois), 4),
            "highest_impact": max(impacts),
        }
