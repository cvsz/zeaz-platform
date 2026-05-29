import logging
from typing import Dict, Any, Callable
from runtime.policy_engine import PolicyEngine

logger = logging.getLogger("MutationSandbox")

class MutationSandbox:
    def __init__(self, policy_engine: PolicyEngine):
        self.policy_engine = policy_engine

    async def execute_mutation(self, action_type: str, mutation_fn: Callable, *args, **kwargs) -> Dict[str, Any]:
        """Execute a system mutation within a governed sandbox"""
        
        # 1. Pre-validation via Policy Engine
        if not self.policy_engine.validate_mutation(action_type):
            logger.error(f"Mutation {action_type} blocked by policy engine.")
            return {"status": "BLOCKED", "reason": "Policy violation"}
            
        try:
            # 2. Execution
            logger.info(f"Executing sandboxed mutation: {action_type}")
            result = await mutation_fn(*args, **kwargs)
            
            # 3. Post-validation (optional check of state change)
            
            return {"status": "SUCCESS", "result": result}
        except Exception as e:
            logger.error(f"Mutation {action_type} failed in sandbox: {e}")
            return {"status": "FAILED", "error": str(e)}
