from __future__ import annotations

import json
import logging
from typing import Any

from pythonjsonlogger import jsonlogger

SENSITIVE_KEYS = {'authorization', 'cookie', 'password', 'secret', 'token', 'api_key'}


class RedactingJsonFormatter(jsonlogger.JsonFormatter):
    def process_log_record(self, log_record: dict[str, Any]) -> dict[str, Any]:
        return redact(log_record)


def redact(data: dict[str, Any]) -> dict[str, Any]:
    redacted: dict[str, Any] = {}
    for key, value in data.items():
        if key.lower() in SENSITIVE_KEYS:
            redacted[key] = '[REDACTED]'
            continue
        if isinstance(value, dict):
            redacted[key] = redact(value)
            continue
        redacted[key] = value
    return redacted


class PrettyFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            'level': record.levelname,
            'message': record.getMessage(),
            'logger': record.name,
        }
        for attr in ('requestId', 'traceId', 'spanId', 'path', 'method', 'durationMs', 'status'):
            value = getattr(record, attr, None)
            if value is not None:
                payload[attr] = value
        return json.dumps(redact(payload))
