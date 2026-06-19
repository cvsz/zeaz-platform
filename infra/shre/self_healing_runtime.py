import asyncio
import json
import logging
import subprocess
import time
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("SHRE")

class SHREngine:
    def __init__(self):
        self.state_file = "runtime_state.json"
        self.max_retries = 3
        self.state = self.load_state()

    def load_state(self):
        try:
            with open(self.state_file, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            return {"services": {}, "history": []}

    def save_state(self):
        with open(self.state_file, "w") as f:
            json.dump(self.state, f, indent=2)

    def observe(self):
        logger.info("[OBSERVE] Collecting signals...")
        signals = []
        
        # Check container health
        res = subprocess.run(["docker", "ps", "--format", "{{.Names}}|{{.State}}|{{.Status}}"], capture_output=True, text=True)
        for line in res.stdout.strip().split("\n"):
            if not line: continue
            name, state, status = line.split("|")
            severity = "OK" if "Up" in state or "healthy" in status else "CRITICAL"
            signals.append({
                "timestamp": datetime.utcnow().isoformat(),
                "service": name,
                "signal_type": "container_health",
                "severity": severity,
                "payload": {"state": state, "status": status}
            })
        return signals

    def detect(self, signals):
        logger.info("[DETECT] Analyzing signals...")
        anomalies = []
        for sig in signals:
            if sig["severity"] == "CRITICAL":
                anomalies.append(sig)
        return anomalies

    def diagnose(self, anomaly):
        logger.info(f"[DIAGNOSE] Diagnosing anomaly in {anomaly['service']}...")
        service = anomaly["service"]
        if "traefik" in service:
            return "broken network routing", "fix_traefik.sh"
        elif "authentik" in service or "server" in service or "worker" in service:
            return "auth misconfiguration", "repair_auth.sh"
        elif "langgraph" in service or "ai" in service:
            return "worker idle but queue non-empty", "reset_worker.sh"
        else:
            return "container down", "restart_service.sh"

    async def repair(self, service, action_script):
        logger.info(f"[REPAIR] Dispatching {action_script} for {service}...")
        
        retries = self.state["services"].get(service, {}).get("retries", 0)
        if retries >= self.max_retries:
            logger.error(f"[REPAIR] Max retries reached for {service}. Circuit breaker open.")
            return False

        self.state["services"].setdefault(service, {"retries": 0})["retries"] += 1
        self.save_state()

        script_path = f"./repair_actions/{action_script}"
        process = await asyncio.create_subprocess_exec(
            "bash", script_path, service,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        if process.returncode == 0:
            logger.info(f"[REPAIR] Action successful for {service}")
            return True
        else:
            logger.error(f"[REPAIR] Action failed for {service}: {stderr.decode()}")
            return False

    def verify(self, service):
        logger.info(f"[VERIFY] Verifying health for {service}...")
        # Give it a moment to stabilize
        time.sleep(5)
        res = subprocess.run(["docker", "inspect", "--format", "{{.State.Health.Status}}", service], capture_output=True, text=True)
        return "healthy" in res.stdout or "running" in res.stdout

    async def run_cycle(self):
        signals = self.observe()
        anomalies = self.detect(signals)
        
        if not anomalies:
            logger.info("[RECONCILE] System is healthy and converged.")
            # Decay retries on success
            for srv in self.state["services"]:
                if self.state["services"][srv]["retries"] > 0:
                    self.state["services"][srv]["retries"] -= 1
            self.save_state()
            return

        for anomaly in anomalies:
            hypothesis, action_script = self.diagnose(anomaly)
            success = await self.repair(anomaly["service"], action_script)
            if success:
                if self.verify(anomaly["service"]):
                    logger.info(f"[RECONCILE] {anomaly['service']} successfully repaired.")
                else:
                    logger.warning(f"[RECONCILE] {anomaly['service']} still failing after repair.")

    async def start(self):
        logger.info("Starting Self-Healing Runtime Engine (SHRE)...")
        while True:
            await self.run_cycle()
            await asyncio.sleep(15)

if __name__ == "__main__":
    engine = SHREngine()
    asyncio.run(engine.start())
