import time
import logging
import uuid
from typing import Optional
import redis

logger = logging.getLogger("LeaseManager")

class LeaseManager:
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        self.redis = redis.from_url(redis_url)
        self.client_id = str(uuid.uuid4())

    def acquire_lease(self, task_id: str, duration: int = 30) -> bool:
        """
        Attempt to acquire a distributed lease for a task.
        :param task_id: Unique identifier for the task.
        :param duration: Lease duration in seconds.
        :return: True if lease acquired, False otherwise.
        """
        lease_key = f"lease:task:{task_id}"
        # Use SET with NX and EX for atomic acquisition
        acquired = self.redis.set(lease_key, self.client_id, ex=duration, nx=True)
        if acquired:
            logger.info(f"Lease acquired for task {task_id} by {self.client_id}")
            return True
        return False

    def renew_lease(self, task_id: str, duration: int = 30) -> bool:
        """
        Renew an existing lease held by this client.
        """
        lease_key = f"lease:task:{task_id}"
        current_owner = self.redis.get(lease_key)
        if current_owner and current_owner.decode() == self.client_id:
            self.redis.expire(lease_key, duration)
            logger.debug(f"Lease renewed for task {task_id}")
            return True
        return False

    def release_lease(self, task_id: str) -> bool:
        """
        Release a lease held by this client.
        """
        lease_key = f"lease:task:{task_id}"
        # Lua script for atomic delete if owner matches
        script = """
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
        """
        released = self.redis.eval(script, 1, lease_key, self.client_id)
        if released:
            logger.info(f"Lease released for task {task_id}")
            return True
        return False

    def is_lease_active(self, task_id: str) -> bool:
        lease_key = f"lease:task:{task_id}"
        return self.redis.exists(lease_key) > 0
