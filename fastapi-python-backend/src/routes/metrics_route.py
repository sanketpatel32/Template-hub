from fastapi import APIRouter, Response

from ..config.env import settings
from ..errors.http_errors import NotFoundError
from ..observability.metrics import get_metrics_snapshot, metrics_content_type

metrics_router = APIRouter(prefix='/metrics', tags=['metrics'])


@metrics_router.get('', include_in_schema=True)
async def get_metrics() -> Response:
    if not settings.METRICS_ENABLED:
        raise NotFoundError(detail='Metrics endpoint is disabled.')

    metrics = get_metrics_snapshot()
    return Response(content=metrics, media_type=metrics_content_type)
