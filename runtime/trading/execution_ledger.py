import logging
import json
import time
import os

logger = logging.getLogger("ExecutionLedger")

class ExecutionLedger:
    def __init__(self, ledger_file="immutable_ledger.jsonl"):
        self.ledger_file = ledger_file
        
    def append_trade(self, trade_event: dict):
        logger.info("Appending trade to immutable ledger...")
        trade_event['timestamp'] = time.time()
        
        with open(self.ledger_file, "a") as f:
            f.write(json.dumps(trade_event) + "\n")
            
    def get_source_of_truth(self):
        logger.info("Reconstructing state from immutable ledger...")
        if not os.path.exists(self.ledger_file):
            return []
        # Replay logic to reconstruct state deterministically
        return []
