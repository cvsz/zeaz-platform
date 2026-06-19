import time
import logging
import statistics
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from collections import defaultdict

logger = logging.getLogger("CorrelationEngine")


@dataclass
class SignalEvent:
    source: str
    event_type: str
    timestamp: float
    correlation_id: Optional[str]
    severity: str
    payload: Dict[str, Any]


@dataclass
class CausalEdge:
    source_event: str
    target_event: str
    confidence: float
    latency_sec: float


class CorrelationEngine:
    def __init__(
        self,
        correlation_window_sec: float = 30.0,
        min_confidence: float = 0.3,
        max_causal_depth: int = 10,
    ):
        self.correlation_window_sec = correlation_window_sec
        self.min_confidence = min_confidence
        self.max_causal_depth = max_causal_depth
        self._events: List[SignalEvent] = []
        self._incidents: List[Dict[str, Any]] = []

    def ingest_logs(self, logs: List[Dict]) -> int:
        count = 0
        for entry in logs:
            self._events.append(SignalEvent(
                source="logs",
                event_type=entry.get("event", entry.get("message", "unknown")),
                timestamp=entry.get("timestamp", entry.get("time", time.time())),
                correlation_id=entry.get("correlation_id", entry.get("trace_id")),
                severity=entry.get("level", entry.get("severity", "info")),
                payload=entry,
            ))
            count += 1
        logger.debug("Ingested %d log events", count)
        return count

    def ingest_metrics(self, metrics: List[Dict]) -> int:
        count = 0
        for entry in metrics:
            self._events.append(SignalEvent(
                source="metrics",
                event_type=entry.get("metric", entry.get("name", "unknown_metric")),
                timestamp=entry.get("timestamp", entry.get("time", time.time())),
                correlation_id=entry.get("correlation_id"),
                severity=self._metric_value_to_severity(entry.get("value", 0)),
                payload=entry,
            ))
            count += 1
        logger.debug("Ingested %d metric events", count)
        return count

    def ingest_traces(self, traces: List[Dict]) -> int:
        count = 0
        for entry in traces:
            self._events.append(SignalEvent(
                source="traces",
                event_type=entry.get("span_name", entry.get("name", "unknown_span")),
                timestamp=entry.get("timestamp", entry.get("start_time", time.time())),
                correlation_id=entry.get("trace_id", entry.get("correlation_id")),
                severity=entry.get("status", entry.get("severity", "info")),
                payload=entry,
            ))
            count += 1
        logger.debug("Ingested %d trace events", count)
        return count

    def _metric_value_to_severity(self, value: float) -> str:
        if value > 0.9:
            return "critical"
        elif value > 0.7:
            return "warning"
        return "info"

    def _group_by_time_window(self, events: List[SignalEvent]) -> Dict[float, List[SignalEvent]]:
        groups: Dict[float, List[SignalEvent]] = defaultdict(list)
        for event in events:
            bucket = round(event.timestamp / self.correlation_window_sec) * self.correlation_window_sec
            groups[bucket].append(event)
        return groups

    def _group_by_correlation_id(self, events: List[SignalEvent]) -> Dict[str, List[SignalEvent]]:
        groups: Dict[str, List[SignalEvent]] = defaultdict(list)
        for event in events:
            cid = event.correlation_id or f"uncorrelated_{event.timestamp}"
            groups[cid].append(event)
        return groups

    def _build_causal_chain(self, events: List[SignalEvent]) -> Tuple[List[Dict[str, Any]], List[CausalEdge]]:
        if len(events) < 2:
            chain = []
            for e in events:
                chain.append({
                    "event": e.event_type,
                    "source": e.source,
                    "timestamp": e.timestamp,
                    "severity": e.severity,
                })
            return chain, []

        sorted_events = sorted(events, key=lambda e: e.timestamp)
        chain = []
        edges = []

        for i, e in enumerate(sorted_events):
            chain.append({
                "event": e.event_type,
                "source": e.source,
                "timestamp": e.timestamp,
                "severity": e.severity,
            })
            if i > 0:
                prev = sorted_events[i - 1]
                latency = e.timestamp - prev.timestamp
                confidence = max(0.0, 1.0 - (latency / (self.correlation_window_sec * 3)))
                if confidence >= self.min_confidence:
                    edges.append(CausalEdge(
                        source_event=prev.event_type,
                        target_event=e.event_type,
                        confidence=round(confidence, 4),
                        latency_sec=round(latency, 3),
                    ))

        return chain, edges

    def _infer_root_cause(self, events: List[SignalEvent], edges: List[CausalEdge]) -> Optional[str]:
        if not events:
            return None

        sorted_events = sorted(events, key=lambda e: e.timestamp)
        source_priority = {"metrics": 0, "logs": 1, "traces": 2}
        sorted_by_source = sorted(sorted_events, key=lambda e: source_priority.get(e.source, 99))

        return sorted_by_source[0].event_type if sorted_by_source else None

    def correlate_signals(
        self,
        logs: List[Dict],
        metrics: List[Dict],
        traces: List[Dict],
    ) -> Dict[str, Any]:
        logger.info(
            "Correlating cross-signal observations: %d logs, %d metrics, %d traces",
            len(logs), len(metrics), len(traces),
        )

        self.ingest_logs(logs)
        self.ingest_metrics(metrics)
        self.ingest_traces(traces)

        all_events = self._events[-len(logs) - len(metrics) - len(traces):]
        if not all_events:
            return {"incidents": [], "summary": "no signals to correlate"}

        time_groups = self._group_by_time_window(all_events)
        id_groups = self._group_by_correlation_id(all_events)

        incidents = []
        for window_ts, window_events in sorted(time_groups.items()):
            causal_chain, edges = self._build_causal_chain(window_events)
            root_cause = self._infer_root_cause(window_events, edges)
            sources_present = list(set(e.source for e in window_events))
            severities = [e.severity for e in window_events]
            max_severity = "critical" if "critical" in severities else ("warning" if "warning" in severities else "info")
            correlation_ids = list(set(e.correlation_id for e in window_events if e.correlation_id))

            incident = {
                "window_start": window_ts,
                "root_cause_inferred": root_cause or "unknown",
                "causal_chain": causal_chain,
                "causal_edges": [(e.source_event, e.target_event, e.confidence) for e in edges],
                "sources": sources_present,
                "severity": max_severity,
                "correlation_ids": correlation_ids,
                "event_count": len(window_events),
                "incident_lineage": " -> ".join(c["event"] for c in causal_chain[:5]),
            }
            incidents.append(incident)

        matched_ids = len([g for g in id_groups.values() if len(g) > 1])
        self._incidents.extend(incidents)

        result = {
            "incidents": incidents,
            "total_events_processed": len(all_events),
            "time_windows_found": len(time_groups),
            "correlated_id_groups": matched_ids,
            "unique_incidents": len(incidents),
            "severity_counts": {
                "critical": sum(1 for i in incidents if i["severity"] == "critical"),
                "warning": sum(1 for i in incidents if i["severity"] == "warning"),
                "info": sum(1 for i in incidents if i["severity"] == "info"),
            },
        }

        logger.info(
            "Correlation complete: %d incidents, %d windows, %d id-groups matched",
            len(incidents), len(time_groups), matched_ids,
        )
        return result

    def get_summary(self) -> Dict[str, Any]:
        return {
            "total_events_buffered": len(self._events),
            "total_incidents_detected": len(self._incidents),
            "window_seconds": self.correlation_window_sec,
            "min_confidence": self.min_confidence,
        }
