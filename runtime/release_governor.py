import os
import json
import logging
from enum import Enum
import subprocess
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ReleaseGovernor")

class ReleaseState(Enum):
    PENDING = "PENDING"
    VALIDATING = "VALIDATING"
    DEPLOYING = "DEPLOYING"
    STABILIZING = "STABILIZING"
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    FAILED = "FAILED"
    ROLLED_BACK = "ROLLED_BACK"

class ReleaseGovernor:
    def __init__(self):
        self.state = ReleaseState.PENDING
        self.deployment_id = os.environ.get("DEPLOYMENT_ID", "local-dev")

    def transition(self, new_state: ReleaseState):
        logger.info(f"Transitioning release {self.deployment_id} from {self.state.name} to {new_state.name}")
        self.state = new_state

    def coordinate_release(self):
        try:
            self.transition(ReleaseState.VALIDATING)
            from risk_engine import RiskEngine
            risk_engine = RiskEngine()
            risk_res = risk_engine.evaluate_risk()
            if risk_res.get("blocked"):
                logger.error(f"Deployment blocked by risk engine: {risk_res.get('reason')}")
                self.transition(ReleaseState.FAILED)
                return False

            self.transition(ReleaseState.DEPLOYING)
            # Invoke deployment script (e.g., make zaiz-up)
            subprocess.run(["make", "zaiz-up"], check=True)

            self.transition(ReleaseState.STABILIZING)
            
            from verification_engine import VerificationEngine
            verifier = VerificationEngine()
            if not verifier.verify_deployment():
                logger.error("Verification failed during stabilization.")
                self.transition(ReleaseState.DEGRADED)
                from rollback_engine import RollbackEngine
                rollback = RollbackEngine()
                rollback.execute_rollback()
                self.transition(ReleaseState.ROLLED_BACK)
                return False
                
            self.transition(ReleaseState.HEALTHY)
            
            from platform_memory.memory_engine import PlatformMemoryEngine
            mem = PlatformMemoryEngine()
            mem.record_deployment({"status": "HEALTHY", "deployment_id": self.deployment_id})
            
            return True

        except Exception as e:
            logger.error(f"Release failed with error: {e}")
            self.transition(ReleaseState.FAILED)
            from rollback_engine import RollbackEngine
            rollback = RollbackEngine()
            rollback.execute_rollback()
            self.transition(ReleaseState.ROLLED_BACK)
            
            from platform_memory.memory_engine import PlatformMemoryEngine
            mem = PlatformMemoryEngine()
            mem.record_deployment({"status": "ROLLED_BACK", "deployment_id": self.deployment_id, "error": str(e)})
            
            return False

if __name__ == "__main__":
    gov = ReleaseGovernor()
    gov.coordinate_release()
