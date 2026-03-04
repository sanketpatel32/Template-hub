from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from .config.env import settings
from .config.swagger import get_fastapi_app_kwargs
from .middleware.error_handler import register_error_handlers
from .middleware.rate_limit import RateLimitMiddleware
from .middleware.request_context import RequestContextMiddleware
from .middleware.request_id import RequestIdMiddleware
from .observability.http_logger import HttpLoggerMiddleware
from .observability.metrics import MetricsMiddleware
from .routes import register_routes


def resolve_cors_origins(value: str) -> list[str]:
    if value.strip() == '*':
        return ['*']

    origins = [origin.strip() for origin in value.split(',') if origin.strip()]
    return origins or ['*']


def create_app() -> FastAPI:
    app = FastAPI(**get_fastapi_app_kwargs())
    allowed_origins = resolve_cors_origins(settings.CORS_ORIGIN)

    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(MetricsMiddleware)
    app.add_middleware(HttpLoggerMiddleware)
    app.add_middleware(GZipMiddleware, minimum_size=256)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=False,
        allow_methods=['*'],
        allow_headers=['*'],
    )
    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(RequestIdMiddleware)

    register_routes(app)
    register_error_handlers(app)

    return app


app = create_app()
