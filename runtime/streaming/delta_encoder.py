import difflib
import json
from typing import Dict, Any, Optional

class DeltaEncoder:
    def __init__(self):
        self.last_states: Dict[str, Any] = {}

    def encode(self, stream_id: str, new_state: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Return only the differences from the last state for a given stream_id"""
        if stream_id not in self.last_states:
            self.last_states[stream_id] = new_state
            return {"type": "FULL", "data": new_state}
        
        last_state = self.last_states[stream_id]
        delta = self._get_delta(last_state, new_state)
        
        if not delta:
            return None
            
        self.last_states[stream_id] = new_state
        return {"type": "DELTA", "data": delta}

    def _get_delta(self, old: Dict[str, Any], new: Dict[str, Any]) -> Dict[str, Any]:
        delta = {}
        for key, value in new.items():
            if key not in old or old[key] != value:
                delta[key] = value
        # Note: This doesn't handle deletions for simplicity in this example
        return delta

    def reset(self, stream_id: str):
        if stream_id in self.last_states:
            del self.last_states[stream_id]
