import logging
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode
from typing import Dict, Any, Optional

logger = logging.getLogger("OTELIntegration")
tracer = trace.get_tracer("zeaz.cognitive_fabric")

class OTELManager:
    @staticmethod
    def start_span(name: str, attributes: Optional[Dict[str, Any]] = None):
        return tracer.start_as_current_span(name, attributes=attributes)

    @staticmethod
    def record_exception(span: trace.Span, exception: Exception):
        span.record_exception(exception)
        span.set_status(Status(StatusCode.ERROR))

    @staticmethod
    def set_attribute(span: trace.Span, key: str, value: Any):
        span.set_attribute(key, value)
