import logging
import re
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = logging.getLogger(__name__)

MAX_BODY_SIZE = 5 * 1024 * 1024

_SUSPICIOUS_UA = [
    re.compile(r"curl", re.IGNORECASE),
    re.compile(r"wget", re.IGNORECASE),
    re.compile(r"python-requests", re.IGNORECASE),
]


def _is_bot(request) -> bool:
    ua = request.headers.get("user-agent", "")
    return any(p.search(ua) for p in _SUSPICIOUS_UA) or not request.headers.get("accept")


class AutonomousSecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        identity = request.headers.get("x-forwarded-for", request.client.host if request.client else "anon")

        logger.warning("AutonomousSecurityMiddleware: adaptive / anomaly / circuit-breaker backends not connected — basic checks only for %s", identity[:32])

        if _is_bot(request):
            return Response("Bot detected", status_code=403)

        size = 0
        async for chunk in request.stream():
            size += len(chunk)
            if size > MAX_BODY_SIZE:
                return Response("Payload too large", status_code=413)

        return await call_next(request)
