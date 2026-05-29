class AgentTopology:
    def __init__(self):
        self.agents = {
            "planner": "Plans infrastructure mutations.",
            "executor": "Applies Terraform/Docker changes.",
            "repair": "Dispatches self-healing bash scripts.",
            "verifier": "Validates runtime correctness via VRE.",
            "reconciler": "Ensures desired state convergence."
        }
    
    def get_topology(self):
        return self.agents
