import os
import yaml
import logging

logger = logging.getLogger("RiskEngine")

class RiskScore:
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class RiskEngine:
    def __init__(self, compose_path="docker-compose.yml", env_path=".env"):
        self.compose_path = compose_path
        self.env_path = env_path

    def analyze_compose(self):
        if not os.path.exists(self.compose_path):
            return {"score": RiskScore.CRITICAL, "blocked": True, "reason": "docker-compose.yml not found"}
        
        with open(self.compose_path, 'r') as f:
            data = yaml.safe_load(f)
            
        for service, config in data.get('services', {}).items():
            if 'ports' in config:
                for port in config['ports']:
                    if isinstance(port, str) and not port.startswith('127.0.0.1'):
                        return {"score": RiskScore.CRITICAL, "blocked": True, "reason": f"Public port exposed in service {service}: {port}"}
                        
        return {"score": RiskScore.LOW, "blocked": False, "reason": "Compose check passed"}

    def analyze_env(self):
        if not os.path.exists(self.env_path):
            return {"score": RiskScore.MEDIUM, "blocked": False, "reason": "No .env found (might be safe but medium risk)"}
            
        with open(self.env_path, 'r') as f:
            content = f.read()
            if 'AUTH_DISABLED=true' in content:
                return {"score": RiskScore.CRITICAL, "blocked": True, "reason": "Auth is disabled in environment"}
            if 'TELEMETRY_DISABLED=true' in content:
                return {"score": RiskScore.CRITICAL, "blocked": True, "reason": "Telemetry is disabled in environment"}

        return {"score": RiskScore.LOW, "blocked": False, "reason": "Env check passed"}

    def evaluate_risk(self):
        logger.info("Evaluating deployment risk...")
        compose_risk = self.analyze_compose()
        if compose_risk["blocked"]:
            return compose_risk
            
        env_risk = self.analyze_env()
        if env_risk["blocked"]:
            return env_risk
            
        # Additional checks: db schema changes, queue topologies...
        return {"score": RiskScore.LOW, "blocked": False, "reason": "All risk checks passed safely"}

if __name__ == "__main__":
    engine = RiskEngine()
    print(engine.evaluate_risk())
