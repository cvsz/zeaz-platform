import asyncio
import logging
import json
from runtime.swarm.agent_base import BaseAgent
from runtime.swarm.marketplace import TaskMarketplace

logger = logging.getLogger("TelemetryAgent")

class TelemetryAgent(BaseAgent):
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        super().__init__(
            agent_type="telemetry",
            capabilities=["MONITOR_HEALTH", "ANALYZE_METRICS", "REPORT_ANOMALY"],
            redis_url=redis_url
        )
        self.marketplace = TaskMarketplace(redis_url)

    async def run(self):
        logger.info(f"Telemetry Agent {self.agent_id} is running...")
        
        # 1. Start metric collection simulation
        asyncio.create_task(self._monitor_loop())
        
        # 2. Listen to marketplace for monitoring requests
        while self.running:
            try:
                # In a real system, use xreadgroup
                messages = self.redis.xread({"swarm:marketplace": "$"}, block=1000, count=1)
                if messages:
                    for stream, msgs in messages:
                        for msg_id, payload in msgs:
                            task_data = json.loads(payload[b"data"])
                            if "MONITOR_HEALTH" in task_data.get("requirements", []):
                                self.marketplace.bid_on_task(task_data["task_id"], self.agent_id)
            except Exception as e:
                logger.error(f"Error in Telemetry Agent marketplace loop: {e}")
            await asyncio.sleep(1)

    async def _monitor_loop(self):
        while self.running:
            # Simulate fetching metrics from Prometheus
            load = 0.45 # Mock load
            if load > 0.8:
                logger.warning(f"High load detected! Publishing anomaly event.")
                await self.publish_event("ANOMALY_DETECTED", {"metric": "cpu_load", "value": load})
            
            await asyncio.sleep(10)
