import asyncio
import json
import logging
import uuid
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import redis
from runtime.scheduler.lease_manager import LeaseManager
from runtime.scheduler.execution_journal import ExecutionJournal

logger = logging.getLogger("BaseAgent")

class BaseAgent(ABC):
    def __init__(
        self,
        agent_type: str,
        capabilities: List[str],
        redis_url: str = "redis://localhost:6379/0",
        journal_secret: str = "swarm-secret"
    ):
        self.agent_id = f"{agent_type}-{uuid.uuid4().hex[:8]}"
        self.agent_type = agent_type
        self.capabilities = capabilities
        self.redis = redis.from_url(redis_url)
        self.lease_manager = LeaseManager(redis_url)
        self.journal = ExecutionJournal(secret_key=journal_secret)
        self.running = False
        self.heartbeat_interval = 5 # seconds

    async def start(self):
        self.running = True
        logger.info(f"Agent {self.agent_id} starting with capabilities: {self.capabilities}")
        # Start heartbeat task
        asyncio.create_task(self._heartbeat_loop())
        # Start main processing loop
        await self.run()

    async def stop(self):
        self.running = False
        logger.info(f"Agent {self.agent_id} stopping...")

    async def _heartbeat_loop(self):
        while self.running:
            try:
                heartbeat_data = {
                    "agent_id": self.agent_id,
                    "agent_type": self.agent_type,
                    "capabilities": self.capabilities,
                    "last_seen": time.time(),
                    "status": "active"
                }
                self.redis.set(f"swarm:agent:{self.agent_id}", json.dumps(heartbeat_data), ex=15)
                # Also publish to a capability graph or registry if needed
                self.redis.sadd("swarm:active_agents", self.agent_id)
            except Exception as e:
                logger.error(f"Heartbeat failed for {self.agent_id}: {e}")
            await asyncio.sleep(self.heartbeat_interval)

    @abstractmethod
    async def run(self):
        """Main operational loop for the agent"""
        pass

    async def publish_event(self, event_type: str, payload: Dict[str, Any]):
        event = {
            "agent_id": self.agent_id,
            "type": event_type,
            "timestamp": time.time(),
            "payload": payload
        }
        self.redis.xadd("swarm:events", {"data": json.dumps(event)})

    def record_action(self, action_id: str, action_type: str, tenant_id: str, payload: Dict[str, Any], result: Optional[Dict[str, Any]] = None):
        self.journal.record_execution(
            task_id=action_id,
            action=action_type,
            tenant_id=tenant_id,
            payload=payload,
            result=result
        )
