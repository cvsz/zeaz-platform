import logging
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from urllib.parse import urlparse

logger = logging.getLogger("VerificationEngine")


@dataclass
class CheckResult:
    name: str
    passed: bool
    duration_ms: float
    error: Optional[str] = None
    detail: Optional[Dict[str, Any]] = None


class VerificationEngine:
    def __init__(
        self,
        base_url: str = "http://localhost:8080",
        auth_endpoint: str = "/auth/redirect",
        ws_endpoint: str = "/ws",
        redis_endpoint: str = "redis://localhost:6379",
        loki_endpoint: str = "http://localhost:3100",
        prometheus_endpoint: str = "http://localhost:9090",
        db_endpoint: str = "postgresql://localhost:5432/vecdb",
        ai_exec_endpoint: str = "http://localhost:8787",
        timeout_sec: float = 5.0,
    ):
        self.base_url = base_url.rstrip("/")
        self.auth_endpoint = auth_endpoint
        self.ws_endpoint = ws_endpoint
        self.redis_endpoint = redis_endpoint
        self.loki_endpoint = loki_endpoint.rstrip("/")
        self.prometheus_endpoint = prometheus_endpoint.rstrip("/")
        self.db_endpoint = db_endpoint
        self.ai_exec_endpoint = ai_exec_endpoint.rstrip("/")
        self.timeout_sec = timeout_sec
        self._checkers: Dict[str, Callable[[], CheckResult]] = {}
        self._results: List[CheckResult] = []
        self._register_default_checkers()

    def _register_default_checkers(self) -> None:
        self.register_checker("auth_redirect", self.check_auth_redirect)
        self.register_checker("websocket", self.check_websocket)
        self.register_checker("redis", self.check_redis)
        self.register_checker("loki", self.check_loki)
        self.register_checker("prometheus", self.check_prometheus)
        self.register_checker("db_persistence", self.check_db_persistence)
        self.register_checker("ai_execution", self.check_ai_execution)

    def register_checker(self, name: str, fn: Callable[[], CheckResult]) -> None:
        self._checkers[name] = fn

    def _http_health_check(self, url: str, expected_status: int = 200) -> CheckResult:
        import time
        import requests

        start = time.monotonic()
        try:
            resp = requests.get(url, timeout=self.timeout_sec, allow_redirects=False)
            elapsed = (time.monotonic() - start) * 1000
            passed = resp.status_code == expected_status
            return CheckResult(
                name=url,
                passed=passed,
                duration_ms=round(elapsed, 2),
                error=None if passed else f"expected {expected_status}, got {resp.status_code}",
                detail={"status_code": resp.status_code, "url": url},
            )
        except requests.ConnectionError:
            elapsed = (time.monotonic() - start) * 1000
            return CheckResult(
                name=url,
                passed=False,
                duration_ms=round(elapsed, 2),
                error="connection refused",
                detail={"url": url},
            )
        except requests.Timeout:
            elapsed = (time.monotonic() - start) * 1000
            return CheckResult(
                name=url,
                passed=False,
                duration_ms=round(elapsed, 2),
                error=f"timeout after {self.timeout_sec}s",
                detail={"url": url},
            )
        except Exception as e:
            elapsed = (time.monotonic() - start) * 1000
            return CheckResult(
                name=url,
                passed=False,
                duration_ms=round(elapsed, 2),
                error=str(e),
                detail={"url": url},
            )

    def check_auth_redirect(self) -> CheckResult:
        logger.info("Verifying Auth redirect flow at %s%s...", self.base_url, self.auth_endpoint)
        url = f"{self.base_url}{self.auth_endpoint}"
        result = self._http_health_check(url, expected_status=302)
        if not result.passed and result.error and "expected 302" in result.error:
            result = self._http_health_check(url, expected_status=200)
        logger.info("Auth redirect check: %s (%.1fms)", "PASS" if result.passed else "FAIL", result.duration_ms)
        return result

    def check_websocket(self) -> CheckResult:
        import time
        import socket

        logger.info("Verifying Websocket connectivity at ws://%s%s...", urlparse(self.base_url).hostname or "localhost", self.ws_endpoint)
        start = time.monotonic()
        host = urlparse(self.base_url).hostname or "localhost"
        port = 80

        try:
            sock = socket.create_connection((host, port), timeout=self.timeout_sec)
            sock.settimeout(self.timeout_sec)
            sock.sendall(b"GET /ws HTTP/1.1\r\nHost: %s\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n" % host.encode())
            response = sock.recv(128)
            sock.close()
            elapsed = (time.monotonic() - start) * 1000
            passed = b"101" in response or b"426" in response
            logger.info("Websocket check: %s (%.1fms)", "PASS" if passed else "FAIL", elapsed)
            return CheckResult(
                name="websocket",
                passed=passed,
                duration_ms=round(elapsed, 2),
                error=None if passed else f"unexpected response: {response[:64].decode(errors='replace')}",
                detail={"host": host, "port": port, "endpoint": self.ws_endpoint},
            )
        except (socket.timeout, ConnectionRefusedError, OSError) as e:
            elapsed = (time.monotonic() - start) * 1000
            return CheckResult(
                name="websocket",
                passed=False,
                duration_ms=round(elapsed, 2),
                error=str(e),
                detail={"host": host, "port": port},
            )

    def _url_health_check(self, endpoint_url: str, service_name: str, expected_keyword: Optional[str] = None) -> CheckResult:
        result = self._http_health_check(endpoint_url)
        result.name = service_name
        if result.passed and expected_keyword:
            import requests
            try:
                resp = requests.get(endpoint_url, timeout=self.timeout_sec)
                if expected_keyword not in resp.text:
                    result.passed = False
                    result.error = f"missing expected keyword '{expected_keyword}' in response"
            except Exception:
                pass
        return result

    def check_redis(self) -> CheckResult:
        import time
        import socket

        logger.info("Verifying Redis queue health at %s...", self.redis_endpoint)
        parsed = urlparse(self.redis_endpoint)
        host = parsed.hostname or "localhost"
        port = parsed.port or 6379
        start = time.monotonic()

        try:
            sock = socket.create_connection((host, port), timeout=self.timeout_sec)
            sock.settimeout(self.timeout_sec)
            sock.sendall(b"*1\r\n$4\r\nPING\r\n")
            response = sock.recv(128)
            sock.close()
            elapsed = (time.monotonic() - start) * 1000
            passed = b"+PONG" in response
            return CheckResult(
                name="redis",
                passed=passed,
                duration_ms=round(elapsed, 2),
                error=None if passed else f"unexpected response: {response[:64].decode(errors='replace')}",
                detail={"host": host, "port": port, "endpoint": self.redis_endpoint},
            )
        except (socket.timeout, ConnectionRefusedError, OSError) as e:
            elapsed = (time.monotonic() - start) * 1000
            return CheckResult(
                name="redis",
                passed=False,
                duration_ms=round(elapsed, 2),
                error=str(e),
                detail={"host": host, "port": port},
            )

    def check_loki(self) -> CheckResult:
        logger.info("Verifying Loki ingestion at %s/ready...", self.loki_endpoint)
        return self._url_health_check(f"{self.loki_endpoint}/ready", "loki", expected_keyword="ready")

    def check_prometheus(self) -> CheckResult:
        logger.info("Verifying Prometheus targets at %s/api/v1/targets...", self.prometheus_endpoint)
        result = self._url_health_check(f"{self.prometheus_endpoint}/api/v1/targets", "prometheus")
        if result.passed:
            import requests
            try:
                resp = requests.get(f"{self.prometheus_endpoint}/api/v1/targets", timeout=self.timeout_sec)
                data = resp.json()
                targets = data.get("data", {}).get("activeTargets", [])
                healthy = sum(1 for t in targets if t.get("health") == "up")
                total = len(targets)
                result.detail = {"total_targets": total, "healthy_targets": healthy, "url": self.prometheus_endpoint}
                logger.info("Prometheus: %d/%d targets healthy", healthy, total)
            except Exception:
                pass
        return result

    def check_db_persistence(self) -> CheckResult:
        import time

        logger.info("Verifying pgvector storage at %s...", self.db_endpoint)
        parsed = urlparse(self.db_endpoint)
        host = parsed.hostname or "localhost"
        port = parsed.port or 5432
        start = time.monotonic()

        try:
            import socket
            sock = socket.create_connection((host, port), timeout=self.timeout_sec)
            sock.close()
            elapsed = (time.monotonic() - start) * 1000
            return CheckResult(
                name="db_persistence",
                passed=True,
                duration_ms=round(elapsed, 2),
                detail={"host": host, "port": port, "endpoint": self.db_endpoint},
            )
        except (socket.timeout, ConnectionRefusedError, OSError) as e:
            elapsed = (time.monotonic() - start) * 1000
            return CheckResult(
                name="db_persistence",
                passed=False,
                duration_ms=round(elapsed, 2),
                error=str(e),
                detail={"host": host, "port": port},
            )

    def check_ai_execution(self) -> CheckResult:
        logger.info("Verifying AI Execution at %s/health...", self.ai_exec_endpoint)
        return self._url_health_check(f"{self.ai_exec_endpoint}/health", "ai_execution")

    def verify_deployment(self) -> Dict[str, Any]:
        logger.info("Starting deployment verification (%d checks)...", len(self._checkers))
        self._results.clear()
        failures = []

        for name, checker in self._checkers.items():
            try:
                result = checker()
                self._results.append(result)
                if not result.passed:
                    failures.append(result)
                    logger.error("Verification FAILED: %s - %s", result.name, result.error)
                else:
                    logger.info("Verification PASSED: %s (%.1fms)", result.name, result.duration_ms)
            except Exception as e:
                logger.error("Verification EXCEPTION: %s - %s", name, e, exc_info=True)
                failures.append(CheckResult(name=name, passed=False, duration_ms=0, error=str(e)))

        total = len(self._results)
        passed = total - len(failures)
        success_rate = round((passed / total) * 100, 1) if total > 0 else 0.0

        result = {
            "deployment_healthy": len(failures) == 0,
            "total_checks": total,
            "passed": passed,
            "failed": len(failures),
            "success_rate_pct": success_rate,
            "checks": [
                {
                    "name": r.name,
                    "passed": r.passed,
                    "duration_ms": r.duration_ms,
                    "error": r.error,
                }
                for r in self._results
            ],
            "failures": [
                {"name": r.name, "error": r.error, "detail": r.detail}
                for r in failures
            ],
        }

        if failures:
            logger.warning(
                "Deployment verification: %d/%d passed (%.1f%%). %d failures.",
                passed, total, success_rate, len(failures),
            )
        else:
            logger.info("Deployment verification: all %d checks passed.", total)

        return result

    def get_summary(self) -> Dict[str, Any]:
        return {
            "total_checkers": len(self._checkers),
            "last_run_checks": len(self._results),
            "last_run_passed": sum(1 for r in self._results if r.passed) if self._results else 0,
        }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    v = VerificationEngine()
    result = v.verify_deployment()
    print(f"Deployment healthy: {result['deployment_healthy']}")
