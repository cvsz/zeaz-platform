import asyncio
import logging
import json
from runtime.swarm.agent_base import BaseAgent
from runtime.swarm.marketplace import TaskMarketplace
from runtime.swarm.consensus_engine import ConsensusEngine

logger = logging.getLogger("GovernanceAgent")

class GovernanceAgent(BaseAgent):
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        super().__init__(
            agent_type="governance",
            capabilities=["APPROVE_ACTION", "REVIEW_POLICY", "GATEKEEP_MUTATION"],
            redis_url=redis_url
        )
        self.marketplace = TaskMarketplace(redis_url)
        self.consensus = ConsensusEngine(redis_url)

    async def run(self):
        logger.info(f"Governance Agent {self.agent_id} is monitoring for approval requests...")
        
        while self.running:
            try:
                # Listen for tasks requiring explicit governance approval
                messages = self.redis.xread({"swarm:marketplace": "$"}, block=1000, count=1)
                if messages:
                    for stream, msgs in messages:
                        for msg_id, payload in msgs:
                            task_data = json.loads(payload[b"data"])
                            if "APPROVE_ACTION" in task_data.get("requirements", []):
                                # Logic to review and approve
                                # In a real system, this might wait for a human or check a policy DB
                                logger.info(f"Governance Agent: Approving task {task_data['task_id']}")
                                self.consensus.approve_task(task_data["task_id"], "governance")
                                self.marketplace.bid_on_task(task_data["task_id"], self.agent_id)
            except Exception as e:
                logger.error(f"Error in Governance Agent: {e}")
            await asyncio.sleep(2)
