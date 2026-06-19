import logging
import json
import redis
from enum import Enum
from typing import Dict, Any

logger = logging.getLogger("EventBus")

class EventPriority(Enum):
    BACKGROUND = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4

class EventBus:
    def __init__(self, redis_url="redis://localhost:6379/0"):
        # Backed by Redis Streams
        self.redis_client = redis.from_url(redis_url)
        self.stream_name = "runtime_events"

    def publish(self, topic: str, payload: Dict[str, Any], priority: EventPriority = EventPriority.NORMAL):
        event = {
            "topic": topic,
            "payload": json.dumps(payload),
            "priority": priority.name
        }
        
        # If critical, bypass batching and push directly or to high-priority stream
        stream = f"{self.stream_name}_{priority.name.lower()}" if priority == EventPriority.CRITICAL else self.stream_name
        
        try:
            self.redis_client.xadd(stream, event)
            logger.info(f"Published {priority.name} event to {stream}: {topic}")
        except Exception as e:
            logger.error(f"Failed to publish event: {e}")

    def publish_llm_event(self, provider_id: str, event_type: str, payload: Dict[str, Any]):
        """Specialized high-performance event stream for LLM activities"""
        topic = f"llm.{provider_id}.{event_type}"
        self.publish(topic, payload, priority=EventPriority.NORMAL)

    def publish_mutation(self, action_id: str, action_type: str, payload: Dict[str, Any]):
        """Stream for AI-driven system mutations (requires high durability/logging)"""
        topic = f"mutation.{action_type}.{action_id}"
        self.publish(topic, payload, priority=EventPriority.HIGH)
