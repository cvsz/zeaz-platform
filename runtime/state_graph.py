import logging
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger("StateGraph")

class ServiceState(Enum):
    PENDING = "PENDING"
    STARTING = "STARTING"
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    FAILED = "FAILED"
    STOPPING = "STOPPING"
    STOPPED = "STOPPED"

@dataclass
class ServiceNode:
    name: str
    desired_state: ServiceState
    actual_state: ServiceState
    dependencies: List[str]
    health_score: float
    repair_budget: int
    convergence_timeout: int

class StateGraph:
    def __init__(self):
        self.nodes: Dict[str, ServiceNode] = {}
        
    def add_node(self, node: ServiceNode):
        self.nodes[node.name] = node
        
    def get_node(self, name: str) -> Optional[ServiceNode]:
        return self.nodes.get(name)
        
    def update_actual_state(self, name: str, state: ServiceState, health_score: float):
        if name in self.nodes:
            self.nodes[name].actual_state = state
            self.nodes[name].health_score = health_score
            logger.info(f"Node {name} actual state updated to {state.name}")
            
    def update_desired_state(self, name: str, state: ServiceState):
        if name in self.nodes:
            self.nodes[name].desired_state = state
            logger.info(f"Node {name} desired state updated to {state.name}")
            
    def compute_dependencies_met(self, name: str) -> bool:
        node = self.nodes.get(name)
        if not node:
            return False
        for dep in node.dependencies:
            dep_node = self.nodes.get(dep)
            if not dep_node or dep_node.actual_state != ServiceState.HEALTHY:
                return False
        return True

    def get_convergence_targets(self) -> List[ServiceNode]:
        targets = []
        for name, node in self.nodes.items():
            if node.desired_state != node.actual_state:
                targets.append(node)
        return targets
