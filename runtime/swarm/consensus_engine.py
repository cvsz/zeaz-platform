import asyncio
import logging
import json
import time
from typing import Dict, Any, List
import redis

logger = logging.getLogger("ConsensusEngine")

class ConsensusEngine:
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        self.redis = redis.from_url(redis_url)

    async def collect_consensus(self, task_id: str, required_agents: List[str], timeout: int = 15) -> bool:
        """
        Wait for a list of agents to reach consensus on a task.
        In this system, consensus means each required agent type has verified or approved.
        """
        start_time = time.time()
        approvals = set()
        
        logger.info(f"Consensus requested for task {task_id}. Required: {required_agents}")
        
        while time.time() - start_time < timeout:
            # Check for approval events from agents
            for agent_type in required_agents:
                key = f"swarm:consensus:{task_id}:{agent_type}"
                if self.redis.exists(key):
                    approvals.add(agent_type)
            
            if len(approvals) >= len(required_agents):
                logger.info(f"Consensus reached for task {task_id}")
                return True
            
            await asyncio.sleep(0.5)
            
        logger.warning(f"Consensus timeout for task {task_id}. Approvals: {list(approvals)}")
        return False

    def approve_task(self, task_id: str, agent_type: str):
        key = f"swarm:consensus:{task_id}:{agent_type}"
        self.redis.set(key, "APPROVED", ex=60)
        logger.info(f"Task {task_id} approved by {agent_type}")
