from datetime import datetime, timezone


class RegionalScenarioService:
    def __init__(self, organization_id: str, workspace_id: str):
        self.organization_id = organization_id
        self.workspace_id = workspace_id
        self.regional_configs: dict[str, dict] = {}
        self.assessments: dict[str, list[dict]] = {}

    def configure_region(self, region_id: str, name: str, gdp_growth_base: float, risk_premium: float = 0.0) -> dict:
        config = {
            "region_id": region_id,
            "name": name,
            "gdp_growth_base": gdp_growth_base,
            "risk_premium": risk_premium,
            "configured_at": datetime.now(timezone.utc).isoformat(),
        }
        self.regional_configs[region_id] = config
        return config

    def assess_region(self, region_id: str, scenario_name: str, adjustments: dict | None = None) -> dict | None:
        config = self.regional_configs.get(region_id)
        if config is None:
            return None
        adj = adjustments or {}
        gdp_impact = config["gdp_growth_base"] + adj.get("gdp_adjustment", 0.0) - config["risk_premium"]
        assessment = {
            "region_id": region_id,
            "region_name": config["name"],
            "scenario_name": scenario_name,
            "adjusted_gdp_growth": round(gdp_impact, 4),
            "risk_premium_applied": config["risk_premium"],
            "risk_flags": adj.get("risk_flags", []),
            "assessed_at": datetime.now(timezone.utc).isoformat(),
        }
        if region_id not in self.assessments:
            self.assessments[region_id] = []
        self.assessments[region_id].append(assessment)
        return assessment

    def compare_regions(self, region_ids: list[str], metric: str = "adjusted_gdp_growth") -> list[dict]:
        results = []
        for rid in region_ids:
            entries = self.assessments.get(rid, [])
            if not entries:
                continue
            latest = entries[-1]
            config = self.regional_configs.get(rid, {})
            results.append({
                "region_id": rid,
                "region_name": config.get("name", rid),
                metric: latest.get(metric, 0.0),
                "assessments_count": len(entries),
            })
        return sorted(results, key=lambda r: r.get(metric, 0.0), reverse=True)

    def summary(self) -> dict:
        return {
            "configured_regions": len(self.regional_configs),
            "total_assessments": sum(len(v) for v in self.assessments.values()),
        }
