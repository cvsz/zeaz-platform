from datetime import datetime, timezone


class SupplyDemandSimulator:
    def __init__(self, organization_id: str, workspace_id: str):
        self.organization_id = organization_id
        self.workspace_id = workspace_id
        self.supply_curves: dict[str, dict] = {}
        self.demand_curves: dict[str, dict] = {}
        self.equilibria: list[dict] = []

    def set_supply_curve(self, curve_id: str, base_quantity: float, elasticity: float = 1.0) -> dict:
        curve = {
            "curve_id": curve_id,
            "base_quantity": base_quantity,
            "elasticity": elasticity,
            "set_at": datetime.now(timezone.utc).isoformat(),
        }
        self.supply_curves[curve_id] = curve
        return curve

    def set_demand_curve(self, curve_id: str, base_quantity: float, elasticity: float = -1.0) -> dict:
        curve = {
            "curve_id": curve_id,
            "base_quantity": base_quantity,
            "elasticity": elasticity,
            "set_at": datetime.now(timezone.utc).isoformat(),
        }
        self.demand_curves[curve_id] = curve
        return curve

    def find_equilibrium(self, supply_id: str, demand_id: str, price_levels: list[float] | None = None) -> dict | None:
        supply = self.supply_curves.get(supply_id)
        demand = self.demand_curves.get(demand_id)
        if supply is None or demand is None:
            return None
        levels = price_levels or [0.5, 1.0, 1.5, 2.0]
        closest = None
        min_gap = float("inf")
        for p in levels:
            q_s = supply["base_quantity"] + supply["elasticity"] * p
            q_d = demand["base_quantity"] + demand["elasticity"] * p
            gap = abs(q_s - q_d)
            if gap < min_gap:
                min_gap = gap
                closest = {"price": p, "quantity_supplied": round(q_s, 4), "quantity_demanded": round(q_d, 4), "gap": round(gap, 4)}
        result = {
            "supply_id": supply_id,
            "demand_id": demand_id,
            "equilibrium": closest,
            "clearable": closest["gap"] < 0.01 if closest else False,
            "simulated_at": datetime.now(timezone.utc).isoformat(),
        }
        self.equilibria.append(result)
        return result

    def shift_supply(self, curve_id: str, shift_amount: float) -> dict | None:
        curve = self.supply_curves.get(curve_id)
        if curve is None:
            return None
        curve["base_quantity"] += shift_amount
        return curve

    def shift_demand(self, curve_id: str, shift_amount: float) -> dict | None:
        curve = self.demand_curves.get(curve_id)
        if curve is None:
            return None
        curve["base_quantity"] += shift_amount
        return curve

    def summary(self) -> dict:
        return {
            "supply_curves": len(self.supply_curves),
            "demand_curves": len(self.demand_curves),
            "equilibria_found": len(self.equilibria),
        }
