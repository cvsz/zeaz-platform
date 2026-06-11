from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class TradeoffOption:
    option_id: str
    name: str
    upside: float
    downside: float
    confidence: float
    tags: list[str] = field(default_factory=list)


class StrategicTradeoff:
    def __init__(self, organization_id: str):
        self.organization_id = organization_id
        self.options: dict[str, TradeoffOption] = {}
        self.tradeoffs: list[dict] = []

    def add_option(self, option_id: str, name: str, upside: float, downside: float, confidence: float) -> TradeoffOption:
        option = TradeoffOption(
            option_id=option_id,
            name=name,
            upside=upside,
            downside=downside,
            confidence=max(0.0, min(1.0, confidence)),
        )
        self.options[option_id] = option
        return option

    def evaluate(self, option_ids: list[str]) -> dict:
        included = [self.options[oid] for oid in option_ids if oid in self.options]
        ranked = sorted(included, key=lambda o: o.upside - o.downside, reverse=True)
        result = {
            "ranked_options": [
                {
                    "option_id": o.option_id,
                    "name": o.name,
                    "net_score": round(o.upside - o.downside, 4),
                    "upside": o.upside,
                    "downside": o.downside,
                    "confidence": o.confidence,
                }
                for o in ranked
            ],
            "evaluated_at": datetime.now(timezone.utc).isoformat(),
        }
        self.tradeoffs.append(result)
        return result

    def recommend(self) -> dict | None:
        if not self.options:
            return None
        best = max(self.options.values(), key=lambda o: o.upside - o.downside)
        return {
            "recommended_option_id": best.option_id,
            "name": best.name,
            "net_score": round(best.upside - best.downside, 4),
            "confidence": best.confidence,
        }

    def summary(self) -> dict:
        return {
            "total_options": len(self.options),
            "total_tradeoffs_evaluated": len(self.tradeoffs),
        }
