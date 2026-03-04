import threading
import time
from collections import defaultdict, deque

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from ..config.env import settings
from ..errors.http_errors import RateLimitExceededError


class InMemoryRateLimiter:
    def __init__(self, *, window_ms: int, max_requests: int) -> None:
        self.window_seconds = window_ms / 1000
        self.max_requests = max_requests
        self._requests: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        threshold = now - self.window_seconds

        with self._lock:
            bucket = self._requests[key]

            while bucket and bucket[0] <= threshold:
                bucket.popleft()

            if len(bucket) >= self.max_requests:
                return False

            bucket.append(now)
            return True


def _resolve_client_identifier(request: Request) -> str:
    if settings.TRUST_PROXY:
        forwarded_for = request.headers.get('x-forwarded-for')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()

    if request.client:
        return request.client.host

    return 'unknown'


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app) -> None:
        super().__init__(app)
        self._limiter = InMemoryRateLimiter(
            window_ms=settings.RATE_LIMIT_WINDOW_MS,
            max_requests=settings.RATE_LIMIT_MAX,
        )

    async def dispatch(self, request: Request, call_next) -> Response:
        client_key = _resolve_client_identifier(request)

        try:
            if not self._limiter.allow(client_key):
                raise RateLimitExceededError(detail='Rate limit exceeded. Please retry later.')
        except RateLimitExceededError:
            request.state.rate_limit_error = True
            raise

        return await call_next(request)
