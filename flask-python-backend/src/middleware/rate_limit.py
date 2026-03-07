import time
from collections import defaultdict, deque

from flask import Flask, request

from ..config.env import settings
from ..errors.http_errors import RateLimitExceededError


class InMemoryRateLimiter:
    def __init__(self, window_ms: int, max_requests: int) -> None:
        self._window_seconds = window_ms / 1000
        self._max_requests = max_requests
        self._requests: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str, now: float) -> bool:
        bucket = self._requests[key]
        while bucket and (now - bucket[0]) > self._window_seconds:
            bucket.popleft()

        if len(bucket) >= self._max_requests:
            return False

        bucket.append(now)
        return True


rate_limiter = InMemoryRateLimiter(settings.RATE_LIMIT_WINDOW_MS, settings.RATE_LIMIT_MAX)


def register_rate_limit_middleware(app: Flask) -> None:
    @app.before_request
    def enforce_rate_limit() -> None:
        key = f'{request.remote_addr}:{request.path}'
        if not rate_limiter.check(key, time.time()):
            raise RateLimitExceededError()
