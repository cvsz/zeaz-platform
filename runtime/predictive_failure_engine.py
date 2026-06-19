import json
import hashlib
import logging
import statistics
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field

logger = logging.getLogger("PredictiveFailureEngine")


@dataclass
class FailurePattern:
    name: str
    embedding: List[float]
    severity: str
    typical_ttf_minutes: int
    false_positive_rate: float


class PredictiveFailureEngine:
    def __init__(
        self,
        embedding_dim: int = 4,
        history_size: int = 1000,
        anomaly_threshold: float = 0.65,
        similarity_metric: str = "cosine",
    ):
        self.embedding_dim = embedding_dim
        self.history_size = history_size
        self.anomaly_threshold = anomaly_threshold
        self.similarity_metric = similarity_metric
        self.embedding_cache: List[Dict[str, Any]] = []
        self.failure_patterns: List[FailurePattern] = self._build_default_patterns()
        self.metrics: Dict[str, List[float]] = {
            "mean_confidence": [],
            "detection_count": [],
        }

    def _build_default_patterns(self) -> List[FailurePattern]:
        return [
            FailurePattern(
                name="Memory leak leading to OOM",
                embedding=[0.9, 0.1, 0.7, 0.3],
                severity="critical",
                typical_ttf_minutes=45,
                false_positive_rate=0.05,
            ),
            FailurePattern(
                name="Connection pool exhaustion",
                embedding=[0.8, 0.3, 0.2, 0.9],
                severity="critical",
                typical_ttf_minutes=15,
                false_positive_rate=0.08,
            ),
            FailurePattern(
                name="Gradual latency degradation",
                embedding=[0.3, 0.7, 0.6, 0.2],
                severity="warning",
                typical_ttf_minutes=120,
                false_positive_rate=0.12,
            ),
            FailurePattern(
                name="Disk space pressure",
                embedding=[0.2, 0.8, 0.1, 0.5],
                severity="warning",
                typical_ttf_minutes=240,
                false_positive_rate=0.03,
            ),
            FailurePattern(
                name="Network packet loss spike",
                embedding=[0.6, 0.4, 0.8, 0.1],
                severity="critical",
                typical_ttf_minutes=5,
                false_positive_rate=0.10,
            ),
        ]

    def _dict_to_deterministic_string(self, d: Dict[str, Any]) -> str:
        return json.dumps(d, sort_keys=True, default=str)

    def _compute_cosine_similarity(self, a: List[float], b: List[float]) -> float:
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = sum(x * x for x in a) ** 0.5
        norm_b = sum(x * x for x in b) ** 0.5
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    def _compute_l2_distance(self, a: List[float], b: List[float]) -> float:
        return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5

    def _compute_similarity(self, a: List[float], b: List[float]) -> float:
        if self.similarity_metric == "cosine":
            return self._compute_cosine_similarity(a, b)
        return 1.0 / (1.0 + self._compute_l2_distance(a, b))

    def generate_embedding(self, state_snapshot: Dict[str, Any]) -> List[float]:
        logger.info("Generating semantic embedding for runtime state snapshot...")
        canonical = self._dict_to_deterministic_string(state_snapshot)
        digest = hashlib.sha256(canonical.encode()).hexdigest()

        embedding = []
        chunk_size = len(digest) // self.embedding_dim
        for i in range(self.embedding_dim):
            start = i * chunk_size
            end = start + chunk_size if i < self.embedding_dim - 1 else len(digest)
            chunk = digest[start:end]
            normalized = int(chunk, 16) / (16 ** len(chunk))
            embedding.append(round(normalized, 6))

        logger.debug("Generated embedding dim=%d from snapshot keys=%s", self.embedding_dim, list(state_snapshot.keys()))
        return embedding

    def predict_recurrence(self, current_embedding: List[float]) -> Dict[str, Any]:
        logger.info("Performing similarity search across %d known failure patterns...", len(self.failure_patterns))

        scores = []
        for pattern in self.failure_patterns:
            sim = self._compute_similarity(current_embedding, pattern.embedding)
            scores.append((pattern, sim))

        scores.sort(key=lambda x: x[1], reverse=True)

        best_pattern, best_sim = scores[0]
        logger.debug("Top match: %s (similarity=%.4f)", best_pattern.name, best_sim)

        if best_sim >= self.anomaly_threshold:
            probability = round(min(best_sim * (1.0 - best_pattern.false_positive_rate), 1.0), 4)
            self.metrics["mean_confidence"].append(probability)
            self.metrics["detection_count"].append(1)

            result = {
                "failure_detected": True,
                "predicted_failure": best_pattern.name,
                "probability": probability,
                "severity": best_pattern.severity,
                "time_to_failure": f"{best_pattern.typical_ttf_minutes}m",
                "matched_patterns": len(scores),
                "best_similarity": round(best_sim, 4),
                "similarity_metric": self.similarity_metric,
            }
        else:
            result = {
                "failure_detected": False,
                "predicted_failure": None,
                "probability": 0.0,
                "severity": "none",
                "time_to_failure": None,
                "matched_patterns": 0,
                "best_similarity": round(best_sim, 4),
                "similarity_metric": self.similarity_metric,
            }

        if len(self.embedding_cache) >= self.history_size:
            self.embedding_cache.pop(0)
        self.embedding_cache.append({
            "embedding": current_embedding,
            "result": result,
        })

        logger.info(
            "Prediction complete: detected=%s failure=%s probability=%.2f",
            result["failure_detected"],
            result["predicted_failure"],
            result["probability"],
        )
        return result

    def get_summary(self) -> Dict[str, Any]:
        recent = self.metrics["mean_confidence"][-100:] if self.metrics["mean_confidence"] else [0.0]
        return {
            "total_predictions": len(self.embedding_cache),
            "avg_confidence": round(statistics.mean(recent), 4) if recent else 0.0,
            "total_detections": sum(self.metrics["detection_count"]),
            "known_patterns": len(self.failure_patterns),
        }
