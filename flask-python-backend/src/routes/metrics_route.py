from flask import Blueprint, Response

from ..config.env import settings
from ..errors.http_errors import NotFoundError
from ..observability.metrics import get_metrics_snapshot, metrics_content_type

metrics_blueprint = Blueprint('metrics', __name__)


@metrics_blueprint.get('/metrics')
def get_metrics() -> Response:
    if not settings.METRICS_ENABLED:
        raise NotFoundError(detail='Metrics endpoint is disabled.')

    return Response(get_metrics_snapshot(), content_type=metrics_content_type)
