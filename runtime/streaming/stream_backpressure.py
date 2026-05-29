import asyncio
import logging
from typing import Dict, Any, List

logger = logging.getLogger("StreamBackpressure")

class StreamBackpressure:
    def __init__(self, max_queue_size: int = 100):
        self.queues: Dict[str, asyncio.Queue] = {}
        self.max_queue_size = max_queue_size

    async def push(self, client_id: str, event: Dict[str, Any]):
        if client_id not in self.queues:
            self.queues[client_id] = asyncio.Queue(maxsize=self.max_queue_size)
            
        queue = self.queues[client_id]
        
        if queue.full():
            # If queue is full, drop the oldest event (LIFO-like behavior for real-time)
            # or apply pressure by slowing down.
            logger.warning(f"Backpressure: Queue full for client {client_id}. Dropping oldest event.")
            try:
                queue.get_nowait()
            except asyncio.QueueEmpty:
                pass
        
        await queue.put(event)

    async def get_next(self, client_id: str) -> Dict[str, Any]:
        if client_id not in self.queues:
            return None
        return await self.queues[client_id].get()

    def remove_client(self, client_id: str):
        if client_id in self.queues:
            del self.queues[client_id]
