import json
import logging
import time
from typing import Dict, Any, List, Optional
import redis

logger = logging.getLogger("TaskMarketplace")

class TaskMarketplace:
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        self.redis = redis.from_url(redis_url)
        self.marketplace_stream = "swarm:marketplace"
        self._setup_marketplace()

    def _setup_marketplace(self):
        try:
            self.redis.xgroup_create(self.marketplace_stream, "marketplace_group", id="0", mkstream=True)
        except redis.exceptions.ResponseError:
            pass # Group already exists

    def submit_task(self, task_id: str, task_type: str, requirements: List[str], payload: Dict[str, Any]):
        task = {
            "task_id": task_id,
            "task_type": task_type,
            "requirements": requirements,
            "payload": payload,
            "status": "OPEN",
            "timestamp": time.time()
        }
        self.redis.xadd(self.marketplace_stream, {"data": json.dumps(task)})
        logger.info(f"Task {task_id} ({task_type}) submitted to marketplace.")

    def bid_on_task(self, task_id: str, agent_id: str, bid_value: float = 1.0):
        """
        Agents bid on tasks. Bid value can represent readiness or cost.
        """
        bid = {
            "agent_id": agent_id,
            "bid_value": bid_value,
            "timestamp": time.time()
        }
        self.redis.hset(f"swarm:task_bids:{task_id}", agent_id, json.dumps(bid))
        self.redis.expire(f"swarm:task_bids:{task_id}", 300) # 5 min cleanup
        logger.info(f"Agent {agent_id} bid on task {task_id}")

    def get_bids(self, task_id: str) -> Dict[str, Dict[str, Any]]:
        bids = self.redis.hgetall(f"swarm:task_bids:{task_id}")
        return {k.decode(): json.loads(v.decode()) for k, v in bids.items()}

    def assign_task(self, task_id: str, agent_id: str):
        assignment = {
            "agent_id": agent_id,
            "assigned_at": time.time()
        }
        self.redis.set(f"swarm:task_assignment:{task_id}", json.dumps(assignment), ex=3600)
        logger.info(f"Task {task_id} assigned to agent {agent_id}")

    def get_assignment(self, task_id: str) -> Optional[Dict[str, Any]]:
        data = self.redis.get(f"swarm:task_assignment:{task_id}")
        return json.loads(data.decode()) if data else None
