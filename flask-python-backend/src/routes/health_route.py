import time
from datetime import UTC, datetime

from flask import Blueprint, jsonify

from ..config.env import settings
from ..errors.http_errors import ServiceUnavailableError
from ..state.readiness import is_service_ready

health_blueprint = Blueprint('health', __name__)

_PROCESS_START = time.monotonic()


def _utc_now_iso() -> str:
    return datetime.now(UTC).isoformat().replace('+00:00', 'Z')


@health_blueprint.get('/health')
def get_health():
    return jsonify(
        {
            'success': True,
            'data': {
                'status': 'ok',
                'uptime': time.monotonic() - _PROCESS_START,
                'timestamp': _utc_now_iso(),
                'environment': settings.NODE_ENV,
            },
        }
    )


@health_blueprint.get('/ready')
def get_ready():
    if not is_service_ready():
        raise ServiceUnavailableError(
            detail='Service is shutting down and not ready to serve traffic.'
        )

    return jsonify({'success': True, 'data': {'ready': True, 'timestamp': _utc_now_iso()}})
