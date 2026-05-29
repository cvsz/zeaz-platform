import asyncio
import logging
import json
from runtime.swarm.agent_base import BaseAgent
from runtime.swarm.marketplace import TaskMarketplace

logger = logging.getLogger("HealingAgent")

class HealingAgent(BaseAgent):
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        super().__init__(
            agent_type="healing",
            capabilities=["HEAL_RUNTIME", "RESTART_SERVICE", "ROLLBACK_STATE"],
            redis_url=redis_url
        )
        self.marketplace = TaskMarketplace(redis_url)

    async def run(self):
        logger.info(f"Healing Agent {self.agent_id} is ready for repair tasks...")
        
        while self.running:
            try:
                # Watch for healing tasks
                messages = self.redis.xread({"swarm:marketplace": "$"}, block=1000, count=1)
                if messages:
                    for stream, msgs in messages:
                        for msg_id, payload in msgs:
                            task_data = json.loads(payload[b"data"])
                            if "HEAL_RUNTIME" in task_data.get("requirements", []):
                                self.marketplace.bid_on_task(task_data["task_id"], self.agent_id)
            except Exception as e:
                logger.error(f"Error in Healing Agent: {e}")
            await asyncio.sleep(1)

    async def perform_repair(self, task_id: str, repair_type: str):
        logger.info(f"Healing Agent: Executing repair {repair_type} for task {task_id}")
        # Call into self_healing_runtime or scheduler
        await asyncio.sleep(0.5)
        return {"status": "HEALED", "repair": repair_type}
