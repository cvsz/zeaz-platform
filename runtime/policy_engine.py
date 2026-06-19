import logging
from typing import Dict, Any

logger = logging.getLogger("PolicyEngine")

class PolicyEngine:
    def __init__(self):
        # Strict governance policies
        self.policies = {
            "require_approval_for_rollback": True,
            "sandbox_ai_actions": True,
            "max_repair_budget_per_hour": 3,
            "allowed_mutations": ["restart_worker", "scale_up_queue", "rotate_jwt"]
        }

    def validate_mutation(self, mutation_action: str) -> bool:
        logger.info(f"Validating mutation request: {mutation_action}")
        if mutation_action not in self.policies["allowed_mutations"]:
            logger.warning(f"Mutation {mutation_action} blocked by policy (not in allowed list).")
            return False
        return True

    def constrain_ai_recommendation(self, ai_action: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sandboxes AI operational recommendations to ensure they don't perform
        destructive actions without human or deterministic governor approval.
        """
        logger.info("Constraining AI action...")
        action_type = ai_action.get("type")
        if self.policies["sandbox_ai_actions"]:
            if action_type == "destructive":
                ai_action["status"] = "BLOCKED_BY_POLICY"
                ai_action["reason"] = "AI cannot execute destructive actions autonomously"
            else:
                ai_action["status"] = "PENDING_APPROVAL"
        return ai_action
