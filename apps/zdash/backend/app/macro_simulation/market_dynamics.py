from datetime import datetime, timezone


class MarketDynamics:
    def __init__(self, market_id: str, name: str):
        self.market_id = market_id
        self.name = name
        self.supply_factors: dict[str, float] = {}
        self.demand_factors: dict[str, float] = {}
        self.history: list[dict] = []

    def set_supply_factor(self, factor: str, value: float) -> None:
        self.supply_factors[factor] = value

    def set_demand_factor(self, factor: str, value: float) -> None:
        self.demand_factors[factor] = value

    def calculate_equilibrium(self) -> dict:
        supply_score = sum(self.supply_factors.values()) / max(len(self.supply_factors), 1)
        demand_score = sum(self.demand_factors.values()) / max(len(self.demand_factors), 1)
        price_pressure = demand_score - supply_score
        result = {
            "market_id": self.market_id,
            "name": self.name,
            "supply_score": round(supply_score, 4),
            "demand_score": round(demand_score, 4),
            "price_pressure": round(price_pressure, 4),
            "equilibrium": "balanced" if abs(price_pressure) < 0.1 else ("demand_above_supply" if price_pressure > 0 else "supply_above_demand"),
            "calculated_at": datetime.now(timezone.utc).isoformat(),
        }
        self.history.append(result)
        return result

    def trend(self, window: int = 5) -> dict:
        recent = self.history[-window:]
        if not recent:
            return {"market_id": self.market_id, "trend": "insufficient_data"}
        avg_pressure = sum(r["price_pressure"] for r in recent) / len(recent)
        return {
            "market_id": self.market_id,
            "name": self.name,
            "avg_price_pressure": round(avg_pressure, 4),
            "trend": "rising" if avg_pressure > 0.05 else ("falling" if avg_pressure < -0.05 else "stable"),
            "observations": len(recent),
        }

    def summary(self) -> dict:
        return {
            "market_id": self.market_id,
            "name": self.name,
            "supply_factors": len(self.supply_factors),
            "demand_factors": len(self.demand_factors),
            "snapshots_taken": len(self.history),
        }
