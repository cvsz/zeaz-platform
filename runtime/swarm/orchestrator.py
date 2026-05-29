import asyncio
import logging
import json
import time
import uuid
from typing import Dict, Any, List, Optional
import redis
from runtime.swarm.marketplace import TaskMarketplace
from runtime.swarm.consensus_engine import ConsensusEngine
from runtime.scheduler.scheduler_engine import SchedulerEngine
from runtime.scheduler.models import CognitiveTask

logger = logging.getLogger("SwarmOrchestrator")

class SwarmOrchestrator:
    def __init__(self, redis_url: str = "redis://localhost:6379/0", scheduler: Optional[SchedulerEngine] = None):
        self.redis = redis.from_url(redis_url)
        self.marketplace = TaskMarketplace(redis_url)
        self.consensus = ConsensusEngine(redis_url)
        self.scheduler = scheduler

    async def manage_swarm(self):
        logger.info("Swarm Orchestrator started.")
        while True:
            try:
                # 1. Monitor active agents
                active_agents = self.redis.smembers("swarm:active_agents")
                logger.debug(f"Active agents in swarm: {len(active_agents)}")
                
                # 2. Resolve marketplace tasks
                await self._resolve_bids()
                
            except Exception as e:
                logger.error(f"Error in Swarm Orchestrator: {e}")
            await asyncio.sleep(5)

    async def _resolve_bids(self):
        # Scan for tasks with bids but no assignment
        # Simplified resolver: Pick the best bid and submit to Scheduler
        pass

    async def submit_to_scheduler(self, task_id: str, tenant_id: str, action_type: str, payload: Dict[str, Any]):
        """
        Submits an agent-derived task to the Cognitive Scheduler.
        """
        if not self.scheduler:
            logger.warning("Scheduler not integrated with Orchestrator. Direct execution only.")
            return
            
        task = CognitiveTask(
            task_id=task_id,
            tenant_id=tenant_id,
            action_type=action_type,
            payload=payload
        )
        await self.scheduler.submit_task(task)
        logger.info(f"Orchestrator submitted task {task_id} to Scheduler.")

    async def coordinate_incident_swarm(self, incident_id: str, severity: str):
        """
        Trigger an 'incident swarm' mode where multiple specialized agents
        are coordinated to resolve a high-priority failure.
        """
        logger.info(f"COORD: Incident Swarm triggered for {incident_id} (Severity: {severity})")
        
        # 1. Post analysis task
        self.marketplace.submit_task(
            task_id=f"analyze-{incident_id}",
            task_type="INCIDENT_ANALYSIS",
            requirements=["ANALYZE_METRICS"],
            payload={"incident_id": incident_id}
        )
        
        # 2. Require consensus from Security and Telemetry before Healing
        if severity == "CRITICAL":
            consensus_reached = await self.consensus.collect_consensus(
                task_id=incident_id,
                required_agents=["security", "telemetry"]
            )
            
            if not consensus_reached:
                logger.error(f"Incident {incident_id} aborted: Consensus failed.")
                return False
                
        # 3. Post healing task
        self.marketplace.submit_task(
            task_id=f"heal-{incident_id}",
            task_type="HEAL_RUNTIME",
            requirements=["HEAL_RUNTIME"],
            payload={"incident_id": incident_id}
        )
        return True
