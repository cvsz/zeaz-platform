import redis
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("QueueSupervisor")

class QueueSupervisor:
    def __init__(self):
        self.redis = redis.Redis(host='localhost', port=6379, db=0)
    
    def check_queues(self):
        try:
            length = self.redis.llen("celery")
            if length > 100:
                logger.warning(f"Queue depth is high: {length}. Triggering autoscaling...")
                # Scaling logic would go here
            else:
                logger.info(f"Queue depth normal: {length}")
        except Exception as e:
            logger.error(f"Failed to check queue: {e}")

    def run(self):
        logger.info("Queue supervisor started.")
        while True:
            self.check_queues()
            time.sleep(15)

if __name__ == "__main__":
    supervisor = QueueSupervisor()
    supervisor.run()
