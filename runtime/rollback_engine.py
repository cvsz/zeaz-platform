import os
import shutil
import logging
import subprocess

logger = logging.getLogger("RollbackEngine")

class RollbackEngine:
    def __init__(self, backup_dir="backups"):
        self.backup_dir = backup_dir
        os.makedirs(self.backup_dir, exist_ok=True)

    def snapshot_state(self):
        logger.info("Snapshotting current deployment state...")
        if os.path.exists("docker-compose.yml"):
            shutil.copy("docker-compose.yml", os.path.join(self.backup_dir, "docker-compose.yml.bak"))
        if os.path.exists(".env"):
            shutil.copy(".env", os.path.join(self.backup_dir, ".env.bak"))

    def execute_rollback(self):
        logger.info("Executing automated rollback...")
        compose_bak = os.path.join(self.backup_dir, "docker-compose.yml.bak")
        env_bak = os.path.join(self.backup_dir, ".env.bak")
        
        if os.path.exists(compose_bak):
            shutil.copy(compose_bak, "docker-compose.yml")
            logger.info("Restored docker-compose.yml")
            
        if os.path.exists(env_bak):
            shutil.copy(env_bak, ".env")
            logger.info("Restored .env")
            
        # Restarting stable topology, preserving volumes and databases natively in Docker Compose
        logger.info("Restarting stable topology...")
        try:
            # We don't bring down volumes (-v) so MinIO and PostgreSQL data remain intact
            subprocess.run(["docker", "compose", "up", "-d"], check=True)
            logger.info("Rollback complete. Preserved volumes, database, and MinIO objects.")
        except Exception as e:
            logger.error(f"Failed to restart topology during rollback: {e}")

if __name__ == "__main__":
    r = RollbackEngine()
    r.execute_rollback()
