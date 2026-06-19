import json
import uuid
import time
from typing import Dict, Any, Optional
# Assuming redis-py is available in the platform environment
import redis

class TaskMarketplace:
    def __init__(self, redis_client: redis.Redis, stream_name: str = "task_marketplace"):
        self.redis = redis_client
        self.stream_name = stream_name

    def publish_task(self, task_type: str, payload: Dict[str, Any]) -> str:
        task_id = str(uuid.uuid4())
        task_data = {
            "task_id": task_id,
            "task_type": task_type,
            "payload": json.dumps(payload),
            "status": "pending"
        }
        self.redis.xadd(self.stream_name, task_data)
        return task_id

    def poll_and_lease_task(self, consumer_group: str, consumer_id: str) -> Optional[Dict[str, Any]]:
        # Read from Redis stream using consumer group for exclusive task distribution
        try:
            # Create group if not exists
            self.redis.xgroup_create(self.stream_name, consumer_group, id="0", mkstream=True)
        except redis.exceptions.ResponseError:
            pass # Group already exists

        messages = self.redis.xreadgroup(consumer_group, consumer_id, {self.stream_name: ">"}, count=1)
        
        if not messages:
            return None
            
        _, message_list = messages[0]
        message_id, data = message_list[0]
        
        return {
            "message_id": message_id,
            "task_id": data[b"task_id"].decode(),
            "task_type": data[b"task_type"].decode(),
            "payload": json.loads(data[b"payload"].decode())
        }

    def bid_for_task(self, task_id: str, agent_id: str, capability_score: float, bid_window: int = 5):
        """Submit a bid for a task."""
        bid_key = f"bids:{task_id}"
        self.redis.hset(bid_key, agent_id, capability_score)
        self.redis.expire(bid_key, bid_window)

    def get_best_bid(self, task_id: str) -> Optional[str]:
        """Retrieve the best bid (lowest score) for a task."""
        bid_key = f"bids:{task_id}"
        bids = self.redis.hgetall(bid_key)
        if not bids:
            return None
        # Return agent_id with the lowest score
        best_agent = min(bids, key=lambda k: float(bids[k]))
        return best_agent.decode()
