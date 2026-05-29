import docker
import time
import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SelfHealingRuntime")

class SelfHealingEngine:
    def __init__(self):
        self.client = docker.from_env()
        self.api_url = "http://localhost:8000/api/runtime/healing/trigger"
    
    def check_health(self):
        for container in self.client.containers.list():
            if container.status != "running":
                logger.warning(f"Container {container.name} is {container.status}. Attempting restart...")
                self.repair(container)
                
    def repair(self, container):
        try:
            container.restart()
            requests.post(f"{self.api_url}?service_name={container.name}")
            logger.info(f"Successfully repaired {container.name}")
        except Exception as e:
            logger.error(f"Failed to repair {container.name}: {e}")

    def run(self):
        logger.info("Self-healing runtime started. Monitoring infrastructure...")
        while True:
            self.check_health()
            time.sleep(30)

if __name__ == "__main__":
    engine = SelfHealingEngine()
    engine.run()
