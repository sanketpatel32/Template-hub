import gzip
import io
from typing import Any

from flask import Flask, Response, jsonify, request

from .config.env import settings
from .config.swagger import OPENAPI_SPEC, SWAGGER_UI_HTML
from .middleware.error_handler import register_error_handlers
from .middleware.rate_limit import register_rate_limit_middleware
from .middleware.request_context import register_request_context_middleware
from .middleware.request_id import register_request_id_middleware
from .observability.logger import logger
from .observability.metrics import register_metrics_hooks
from .routes.health_route import health_blueprint
from .routes.metrics_route import metrics_blueprint
from .routes.ping_route import ping_blueprint


def _apply_security_headers(response: Response) -> Response:
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'no-referrer'
    response.headers['X-XSS-Protection'] = '0'
    return response


def _apply_cors_headers(response: Response) -> Response:
    response.headers['Access-Control-Allow-Origin'] = settings.CORS_ORIGIN
    response.headers['Access-Control-Allow-Headers'] = (
        'Content-Type, Authorization, X-Request-Id, X-Trace-Id'
    )
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    return response


def _apply_compression(response: Response) -> Response:
    if 'gzip' not in request.headers.get('Accept-Encoding', '').lower():
        return response

    if response.direct_passthrough or response.status_code < 200 or response.status_code >= 300:
        return response

    if response.content_length is not None and response.content_length < 512:
        return response

    if response.headers.get('Content-Encoding'):
        return response

    body = response.get_data()
    compressed = io.BytesIO()
    with gzip.GzipFile(mode='wb', fileobj=compressed) as gz:
        gz.write(body)
    response.set_data(compressed.getvalue())
    response.headers['Content-Encoding'] = 'gzip'
    response.headers['Vary'] = 'Accept-Encoding'
    response.headers['Content-Length'] = str(len(response.get_data()))
    return response


def create_app() -> Flask:
    app = Flask(__name__)
    app.config['SECRET_KEY'] = settings.FLASK_SECRET_KEY

    register_request_id_middleware(app)
    register_request_context_middleware(app)
    register_metrics_hooks(app)

    @app.before_request
    def log_request() -> None:
        logger.info('Incoming request', extra={'method': request.method, 'path': request.path})

    register_rate_limit_middleware(app)

    app.register_blueprint(health_blueprint)
    app.register_blueprint(metrics_blueprint)
    app.register_blueprint(ping_blueprint)

    @app.get('/openapi.json')
    def openapi_json() -> Any:
        return jsonify(OPENAPI_SPEC)

    @app.get('/docs')
    def docs() -> Response:
        return Response(SWAGGER_UI_HTML, mimetype='text/html')

    @app.after_request
    def response_pipeline(response: Response) -> Response:
        response = _apply_security_headers(response)
        response = _apply_cors_headers(response)
        response = _apply_compression(response)
        return response

    register_error_handlers(app)
    return app
