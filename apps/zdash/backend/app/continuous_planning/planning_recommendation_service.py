from datetime import datetime, timezone
from .models import RecommendationStatus


class PlanningRecommendationService:
    def __init__(self, organization_id: str, workspace_id: str):
        self.organization_id = organization_id
        self.workspace_id = workspace_id
        self.recommendations: dict[str, dict] = {}

    def propose(self, recommendation_id: str, title: str, description: str, priority: str = "medium") -> dict:
        recommendation = {
            "recommendation_id": recommendation_id,
            "title": title,
            "description": description,
            "priority": priority,
            "status": RecommendationStatus.proposed.value,
            "score": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.recommendations[recommendation_id] = recommendation
        return recommendation

    def score(self, recommendation_id: str, score: float) -> dict | None:
        recommendation = self.recommendations.get(recommendation_id)
        if recommendation is None:
            return None
        recommendation["score"] = max(0.0, min(1.0, score))
        return recommendation

    def review(self, recommendation_id: str, reviewer: str, notes: str = "") -> dict | None:
        recommendation = self.recommendations.get(recommendation_id)
        if recommendation is None:
            return None
        recommendation["status"] = RecommendationStatus.under_review.value
        recommendation["reviewer"] = reviewer
        recommendation["review_notes"] = notes
        recommendation["reviewed_at"] = datetime.now(timezone.utc).isoformat()
        return recommendation

    def approve(self, recommendation_id: str) -> dict | None:
        recommendation = self.recommendations.get(recommendation_id)
        if recommendation is None:
            return None
        recommendation["status"] = RecommendationStatus.approved.value
        recommendation["approved_at"] = datetime.now(timezone.utc).isoformat()
        return recommendation

    def reject(self, recommendation_id: str, reason: str) -> dict | None:
        recommendation = self.recommendations.get(recommendation_id)
        if recommendation is None:
            return None
        recommendation["status"] = RecommendationStatus.rejected.value
        recommendation["rejection_reason"] = reason
        recommendation["rejected_at"] = datetime.now(timezone.utc).isoformat()
        return recommendation

    def list_pending(self) -> list[dict]:
        return [
            r for r in self.recommendations.values()
            if r["status"] in (RecommendationStatus.proposed.value, RecommendationStatus.under_review.value)
        ]

    def get_summary(self) -> dict:
        counts: dict[str, int] = {}
        for r in self.recommendations.values():
            counts[r["status"]] = counts.get(r["status"], 0) + 1
        return {
            "total": len(self.recommendations),
            "by_status": counts,
        }
