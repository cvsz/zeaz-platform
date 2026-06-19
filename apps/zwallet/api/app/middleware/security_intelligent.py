import logging
import hashlib
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = logging.getLogger(__name__)


def _fingerprint(request) -> str:
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    ua = request.headers.get("user-agent", "")
    return hashlib.sha256(f"{ip}:{ua}:anon".encode()).hexdigest()


class IntelligentSecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        identity = _fingerprint(request)

        logger.warning("IntelligentSecurityMiddleware: security backends not connected — allowing request for %s", identity[:16])

        return await call_next(request)
