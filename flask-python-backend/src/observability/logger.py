import logging
import sys
from typing import Any

from pythonjsonlogger.json import JsonFormatter

from ..config.env import settings

SENSITIVE_KEYS = {'authorization', 'cookie', 'password', 'token', 'secret', 'x-api-key'}


def _redact_value(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            key: '[REDACTED]' if key.lower() in SENSITIVE_KEYS else _redact_value(nested)
            for key, nested in value.items()
        }
    if isinstance(value, list):
        return [_redact_value(item) for item in value]
    return value


class RedactingJsonFormatter(JsonFormatter):
    def process_log_record(self, log_data: dict[str, Any]) -> dict[str, Any]:
        return _redact_value(log_data)


def _build_handler() -> logging.Handler:
    handler = logging.StreamHandler(sys.stdout)
    if settings.effective_log_pretty and settings.NODE_ENV != 'production':
        handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(message)s'))
    else:
        handler.setFormatter(
            RedactingJsonFormatter('%(asctime)s %(levelname)s %(name)s %(message)s')
        )
    return handler


logger = logging.getLogger('flask-python-backend')
logger.setLevel(settings.LOG_LEVEL.upper().replace('WARN', 'WARNING'))
logger.propagate = False
if not logger.handlers:
    logger.addHandler(_build_handler())
