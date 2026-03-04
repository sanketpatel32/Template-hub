import time
from datetime import UTC, datetime

from fastapi import APIRouter

from ..config.env import settings
from ..errors.http_errors import ServiceUnavailableError
from ..state.readiness import is_service_ready

_PROCESS_START_TIME = time.monotonic()

health_router = APIRouter(prefix='/health', tags=['health'])
ready_router = APIRouter(prefix='/ready', tags=['health'])


def _utc_now_iso() -> str:
    return datetime.now(UTC).isoformat().replace('+00:00', 'Z')


@health_router.get('')
async def get_health() -> dict[str, object]:
    return {
        'success': True,
        'data': {
            'status': 'ok',
            'uptime': time.monotonic() - _PROCESS_START_TIME,
            'timestamp': _utc_now_iso(),
            'environment': settings.NODE_ENV,
        },
    }


@ready_router.get('')
async def get_ready() -> dict[str, object]:
    if not is_service_ready():
        raise ServiceUnavailableError(
            detail='Service is shutting down and not ready to serve traffic.'
        )

    return {
        'success': True,
        'data': {
            'ready': True,
            'timestamp': _utc_now_iso(),
        },
    }
