import time
import signal
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field

logger = logging.getLogger("RuntimeReconciler")


class ReconciliationError(Exception):
    pass


@dataclass
class ResourceState:
    name: str
    kind: str
    current: Dict[str, Any]
    desired: Dict[str, Any]
    healthy: bool = True


class RuntimeReconciler:
    def __init__(
        self,
        reconcile_interval: int = 60,
        drift_tolerance: float = 0.1,
        max_retries: int = 3,
        resource_specs: Optional[List[Dict[str, Any]]] = None,
    ):
        self.reconcile_interval = reconcile_interval
        self.drift_tolerance = drift_tolerance
        self.max_retries = max_retries
        self._shutdown_requested = False
        self._resources: List[ResourceState] = []
        self._reconciliation_history: List[Dict[str, Any]] = []
        self._reconcile_count = 0
        self._failure_count = 0

        if resource_specs:
            for spec in resource_specs:
                self._resources.append(ResourceState(
                    name=spec.get("name", "unknown"),
                    kind=spec.get("kind", "generic"),
                    current=spec.get("initial_state", {}),
                    desired=spec.get("desired_state", {}),
                ))

        signal.signal(signal.SIGTERM, self._handle_signal)
        signal.signal(signal.SIGINT, self._handle_signal)

    def _handle_signal(self, signum: int, frame) -> None:
        sig_name = signal.Signals(signum).name
        logger.info("Received signal %s, initiating graceful shutdown...", sig_name)
        self._shutdown_requested = True

    def register_resource(self, name: str, kind: str, current: Dict[str, Any], desired: Dict[str, Any]) -> None:
        self._resources.append(ResourceState(name=name, kind=kind, current=current, desired=desired))
        logger.info("Registered resource: %s (kind=%s)", name, kind)

    def _compute_drift(self, current: Dict[str, Any], desired: Dict[str, Any]) -> Dict[str, Any]:
        drift = {}
        for key, desired_val in desired.items():
            current_val = current.get(key)
            if current_val is None and desired_val is not None:
                drift[key] = {"expected": desired_val, "actual": None, "delta": None}
            elif isinstance(desired_val, (int, float)) and isinstance(current_val, (int, float)):
                if desired_val != 0:
                    relative_delta = abs(current_val - desired_val) / abs(desired_val)
                    if relative_delta > self.drift_tolerance:
                        drift[key] = {
                            "expected": desired_val,
                            "actual": current_val,
                            "delta": round(current_val - desired_val, 4),
                            "relative_delta": round(relative_delta, 4),
                        }
            elif current_val != desired_val:
                drift[key] = {
                    "expected": desired_val,
                    "actual": current_val,
                    "delta": str(current_val) if current_val is not None else None,
                }
        return drift

    def _apply_correction(self, resource: ResourceState, drift: Dict[str, Any]) -> bool:
        for key, diff in drift.items():
            logger.info("Applying correction: %s.%s -> %s", resource.name, key, diff["expected"])
            resource.current[key] = diff["expected"]
        return True

    def reconcile(self) -> List[Dict[str, Any]]:
        self._reconcile_count += 1
        results = []

        for resource in self._resources:
            drift = self._compute_drift(resource.current, resource.desired)
            if not drift:
                logger.debug("Resource '%s' is in desired state (no drift)", resource.name)
                resource.healthy = True
                results.append({
                    "resource": resource.name,
                    "kind": resource.kind,
                    "drifted": False,
                    "drift_fields": 0,
                    "corrected": False,
                })
                continue

            logger.warning("Drift detected in '%s': %d fields out of tolerance", resource.name, len(drift))
            resource.healthy = False
            corrected = False

            for attempt in range(1, self.max_retries + 1):
                try:
                    logger.info("Correction attempt %d/%d for '%s'", attempt, self.max_retries, resource.name)
                    if self._apply_correction(resource, drift):
                        corrected = True
                        resource.healthy = True
                        break
                except ReconciliationError as e:
                    logger.error("Correction attempt %d failed for '%s': %s", attempt, resource.name, e)
                    time.sleep(2 ** attempt)

            if not corrected:
                self._failure_count += 1
                logger.error("Failed to reconcile '%s' after %d attempts", resource.name, self.max_retries)

            results.append({
                "resource": resource.name,
                "kind": resource.kind,
                "drifted": True,
                "drift_fields": len(drift),
                "corrected": corrected,
            })

        self._reconciliation_history.append({
            "cycle": self._reconcile_count,
            "timestamp": time.time(),
            "results": results,
            "total_resources": len(self._resources),
            "healthy_count": sum(1 for r in self._resources if r.healthy),
        })

        logger.info(
            "Reconciliation cycle %d complete: %d/%d resources healthy",
            self._reconcile_count,
            sum(1 for r in self._resources if r.healthy),
            len(self._resources),
        )
        return results

    def run(self):
        logger.info("Runtime Reconciler started (interval=%ds, max_retries=%d)", self.reconcile_interval, self.max_retries)
        while not self._shutdown_requested:
            try:
                self.reconcile()
            except Exception as e:
                self._failure_count += 1
                logger.error("Reconciliation cycle failed: %s", e, exc_info=True)
            time.sleep(self.reconcile_interval)
        logger.info("Runtime Reconciler shut down gracefully after %d cycles", self._reconcile_count)

    def get_status(self) -> Dict[str, Any]:
        return {
            "running": not self._shutdown_requested,
            "cycles_completed": self._reconcile_count,
            "total_failures": self._failure_count,
            "managed_resources": len(self._resources),
            "healthy_resources": sum(1 for r in self._resources if r.healthy),
        }


if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO)
    reconciler = RuntimeReconciler(reconcile_interval=60)
    reconciler.register_resource(
        name="ai-gateway",
        kind="deployment",
        current={"replicas": 1, "cpu_util": 0.3},
        desired={"replicas": 3, "cpu_util": 0.7},
    )
    reconciler.register_resource(
        name="auth-service",
        kind="deployment",
        current={"replicas": 1, "latency_p99_ms": 200},
        desired={"replicas": 2, "latency_p99_ms": 100},
    )
    reconciler.run()
