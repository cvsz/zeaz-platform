import os
import json
import logging
from datetime import datetime

logger = logging.getLogger("PlatformMemory")

class PlatformMemoryEngine:
    def __init__(self):
        # Uses PostgreSQL + pgvector for learning historical failure behavior
        self.db_dsn = os.environ.get("POSTGRES_DSN", "postgresql://user:pass@localhost:5432/platform")
        self.memory_path = os.path.join(os.path.dirname(__file__), "memory_store.json")
        if not os.path.exists(self.memory_path):
            with open(self.memory_path, 'w') as f:
                json.dump({"incidents": [], "deployments": []}, f)

    def record_incident(self, incident_data):
        logger.info("Persisting incident to platform memory...")
        self._append_to_store("incidents", incident_data)

    def record_deployment(self, deployment_data):
        logger.info("Recording deployment outcome...")
        self._append_to_store("deployments", deployment_data)

    def _append_to_store(self, collection, data):
        with open(self.memory_path, 'r') as f:
            store = json.load(f)
        
        data["timestamp"] = datetime.utcnow().isoformat()
        store.setdefault(collection, []).append(data)
        
        with open(self.memory_path, 'w') as f:
            json.dump(store, f, indent=2)

if __name__ == "__main__":
    mem = PlatformMemoryEngine()
    mem.record_deployment({"status": "SUCCESS", "version": "v1.2.0"})
