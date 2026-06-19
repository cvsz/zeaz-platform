from datetime import datetime, timezone


class ScenarioPackService:
    def __init__(self, organization_id: str, workspace_id: str):
        self.organization_id = organization_id
        self.workspace_id = workspace_id
        self.packs: dict[str, dict] = {}

    def create_pack(self, pack_id: str, name: str, description: str) -> dict:
        pack = {
            "pack_id": pack_id,
            "name": name,
            "description": description,
            "scenarios": [],
            "status": "draft",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.packs[pack_id] = pack
        return pack

    def add_scenario(self, pack_id: str, scenario_id: str, scenario_data: dict) -> dict | None:
        pack = self.packs.get(pack_id)
        if pack is None:
            return None
        pack["scenarios"].append({"scenario_id": scenario_id, **scenario_data})
        return pack

    def publish_pack(self, pack_id: str) -> dict | None:
        pack = self.packs.get(pack_id)
        if pack is None:
            return None
        if not pack["scenarios"]:
            return None
        pack["status"] = "published"
        pack["published_at"] = datetime.now(timezone.utc).isoformat()
        return pack

    def get_export(self, pack_id: str) -> dict | None:
        pack = self.packs.get(pack_id)
        if pack is None:
            return None
        return {
            "pack_id": pack["pack_id"],
            "name": pack["name"],
            "description": pack["description"],
            "status": pack["status"],
            "scenario_count": len(pack["scenarios"]),
            "scenarios": pack["scenarios"],
            "exported_at": datetime.now(timezone.utc).isoformat(),
        }

    def list_packs(self) -> list[dict]:
        return [
            {
                "pack_id": p["pack_id"],
                "name": p["name"],
                "status": p["status"],
                "scenario_count": len(p["scenarios"]),
            }
            for p in self.packs.values()
        ]
