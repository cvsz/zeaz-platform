import logging

logger = logging.getLogger("AISandbox")

class AISandboxEngine:
    def __init__(self, consensus_engine):
        self.consensus = consensus_engine
        
    def propose_trade(self, ai_signal: dict):
        logger.info("AI proposes trade. Entering sandbox...")
        
        if not self.consensus.validate_execution(ai_signal):
            logger.warning("AI trade proposal REJECTED by Consensus Engine.")
            return {"status": "BLOCKED", "reason": "Consensus Failed"}
            
        logger.info("AI trade proposal APPROVED. Forwarding to Execution Engine.")
        return {"status": "APPROVED"}
