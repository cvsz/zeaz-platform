import hashlib
import logging
from typing import Dict, Any, List

logger = logging.getLogger("CardinalityGuard")

class CardinalityGuard:
    def __init__(self, max_unique_labels: int = 1000):
        self.max_unique_labels = max_unique_labels
        self.label_registry: Dict[str, set] = {}

    def sanitize_labels(self, labels: Dict[str, str]) -> Dict[str, str]:
        sanitized = {}
        for key, value in labels.items():
            if key not in self.label_registry:
                self.label_registry[key] = set()
            
            # If we've seen too many unique values for this label key, hash/bucket it
            if len(self.label_registry[key]) > self.max_unique_labels:
                if value not in self.label_registry[key]:
                    # Use a hash-based bucket to keep cardinality bounded
                    bucket = int(hashlib.md5(value.encode()).hexdigest(), 16) % 100
                    sanitized[key] = f"bucket_{bucket}"
                else:
                    sanitized[key] = value
            else:
                self.label_registry[key].add(value)
                sanitized[key] = value
        
        return sanitized

    def protect_prompt(self, prompt: str) -> str:
        """Prompts are high-cardinality. We should never use them as labels directly."""
        # Only return a hash or a snippet if needed for tracking
        return hashlib.sha256(prompt.encode()).hexdigest()[:8]

    def sanitize_agent_id(self, agent_id: str) -> str:
        # If we have thousands of transient agents, bucket them
        if agent_id.startswith("tmp_"):
            return "transient_agent"
        return agent_id
