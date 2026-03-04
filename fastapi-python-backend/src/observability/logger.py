import logging
import sys
from typing import Any

from pythonjsonlogger.jsonlogger import JsonFormatter

from ..config.env import settings

SENSITIVE_KEYS = {'authorization', 'cookie', 'password', 'token', 'secret', 'x-api-key'}


def _redact_value(value: Any) -> Any:
    if isinstance(value, dict):
        redacted: dict[str, Any] = {}
        for key, nested_value in value.items():
            if key.lower() in SENSITIVE_KEYS:
                redacted[key] = '[REDACTED]'
            else:
                redacted[key] = _redact_value(nested_value)
        return redacted

    if isinstance(value, list):
        return [_redact_value(item) for item in value]

    return value


class RedactingJsonFormatter(JsonFormatter):
    def process_log_record(self, log_record: dict[str, Any]) -> dict[str, Any]:
        return _redact_value(log_record)


def _build_handler() -> logging.Handler:
    handler = logging.StreamHandler(sys.stdout)

    if settings.effective_log_pretty and settings.NODE_ENV != 'production':
        formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    else:
        formatter = RedactingJsonFormatter('%(asctime)s %(levelname)s %(name)s %(message)s')

    handler.setFormatter(formatter)
    return handler


logger = logging.getLogger('fastapi-python-backend')
logger.setLevel(settings.LOG_LEVEL.upper())
logger.propagate = False

if not logger.handlers:
    logger.addHandler(_build_handler())


def create_child_logger(context: dict[str, Any]) -> logging.LoggerAdapter[logging.Logger]:
    return logging.LoggerAdapter(logger, context)
