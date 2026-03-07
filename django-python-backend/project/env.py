from __future__ import annotations

import os
from functools import lru_cache
from typing import Literal

from pydantic import BaseModel, Field, ValidationError, field_validator


class EnvSettings(BaseModel):
    port: int = Field(alias='PORT')
    node_env: Literal['development', 'test', 'production'] = Field(alias='NODE_ENV')
    cors_origin: str = Field(alias='CORS_ORIGIN')
    rate_limit_window_ms: int = Field(alias='RATE_LIMIT_WINDOW_MS')
    rate_limit_max: int = Field(alias='RATE_LIMIT_MAX')
    log_level: str = Field(alias='LOG_LEVEL')
    log_pretty: bool = Field(alias='LOG_PRETTY')
    trust_proxy: bool = Field(alias='TRUST_PROXY')
    shutdown_timeout_ms: int = Field(alias='SHUTDOWN_TIMEOUT_MS')
    metrics_enabled: bool = Field(alias='METRICS_ENABLED')
    trace_enabled: bool = Field(alias='TRACE_ENABLED')
    django_secret_key: str = Field(alias='DJANGO_SECRET_KEY')
    django_allowed_hosts: str = Field(alias='DJANGO_ALLOWED_HOSTS')

    @field_validator('django_secret_key')
    @classmethod
    def validate_secret(cls, value: str) -> str:
        if len(value.strip()) < 8:
            raise ValueError('DJANGO_SECRET_KEY must be at least 8 characters long')
        return value

    @field_validator('rate_limit_window_ms', 'rate_limit_max', 'shutdown_timeout_ms')
    @classmethod
    def validate_positive(cls, value: int) -> int:
        if value <= 0:
            raise ValueError('must be a positive integer')
        return value

    @property
    def allowed_hosts(self) -> list[str]:
        return [host.strip() for host in self.django_allowed_hosts.split(',') if host.strip()]


@lru_cache(maxsize=1)
def get_settings() -> EnvSettings:
    env_values = {
        'PORT': os.getenv('PORT', '8000'),
        'NODE_ENV': os.getenv('NODE_ENV', 'development'),
        'CORS_ORIGIN': os.getenv('CORS_ORIGIN', '*'),
        'RATE_LIMIT_WINDOW_MS': os.getenv('RATE_LIMIT_WINDOW_MS', '60000'),
        'RATE_LIMIT_MAX': os.getenv('RATE_LIMIT_MAX', '120'),
        'LOG_LEVEL': os.getenv('LOG_LEVEL', 'INFO'),
        'LOG_PRETTY': os.getenv('LOG_PRETTY', 'true'),
        'TRUST_PROXY': os.getenv('TRUST_PROXY', 'false'),
        'SHUTDOWN_TIMEOUT_MS': os.getenv('SHUTDOWN_TIMEOUT_MS', '5000'),
        'METRICS_ENABLED': os.getenv('METRICS_ENABLED', 'true'),
        'TRACE_ENABLED': os.getenv('TRACE_ENABLED', 'true'),
        'DJANGO_SECRET_KEY': os.getenv('DJANGO_SECRET_KEY', 'change-me-in-production'),
        'DJANGO_ALLOWED_HOSTS': os.getenv('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1,testserver'),
    }
    try:
        return EnvSettings.model_validate(env_values)
    except ValidationError as error:
        raise RuntimeError(f'Environment validation failed: {error}') from error
