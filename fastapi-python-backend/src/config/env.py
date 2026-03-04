from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore',
    )

    HOST: str = '127.0.0.1'
    PORT: int = Field(default=3000, ge=1)
    NODE_ENV: Literal['development', 'test', 'production'] = 'development'
    CORS_ORIGIN: str = '*'
    RATE_LIMIT_WINDOW_MS: int = Field(default=900000, ge=1)
    RATE_LIMIT_MAX: int = Field(default=100, ge=1)
    LOG_LEVEL: Literal['debug', 'info', 'warn', 'error'] = 'info'
    LOG_PRETTY: bool | None = None
    TRUST_PROXY: bool = True
    SHUTDOWN_TIMEOUT_MS: int = Field(default=10000, ge=1)
    METRICS_ENABLED: bool = True
    TRACE_ENABLED: bool = True

    @field_validator('CORS_ORIGIN')
    @classmethod
    def validate_cors_origin(cls, value: str) -> str:
        if not value.strip():
            raise ValueError('CORS_ORIGIN must not be empty')
        return value

    @property
    def effective_log_pretty(self) -> bool:
        if self.LOG_PRETTY is None:
            return self.NODE_ENV != 'production'
        return self.LOG_PRETTY


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
