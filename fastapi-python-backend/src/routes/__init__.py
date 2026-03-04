from fastapi import FastAPI

from .health_route import health_router, ready_router
from .metrics_route import metrics_router
from .ping_route import ping_router


def register_routes(app: FastAPI) -> None:
    app.include_router(health_router)
    app.include_router(ready_router)
    app.include_router(metrics_router)
    app.include_router(ping_router)
