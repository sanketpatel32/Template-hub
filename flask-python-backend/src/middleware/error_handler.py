from flask import Flask, Response, g, jsonify, request
from werkzeug.exceptions import HTTPException

from ..errors.app_error import AppError, to_problem_details
from ..errors.error_map import map_to_app_error
from ..errors.http_errors import NotFoundError
from ..observability.logger import logger


def _build_problem_response(
    app_error: AppError, original_error: Exception | None = None
) -> Response:
    problem = to_problem_details(
        app_error,
        instance=request.path,
        request_id=getattr(g, 'request_id', None),
        trace_id=getattr(g, 'trace_id', None),
        span_id=getattr(g, 'span_id', None),
    )

    log_context = {
        'problem': problem,
        'request_id': getattr(g, 'request_id', None),
        'trace_id': getattr(g, 'trace_id', None),
        'span_id': getattr(g, 'span_id', None),
    }

    if app_error.is_operational:
        logger.warning('Operational request error', extra=log_context)
    else:
        logger.error(
            'Unhandled server error', extra=log_context, exc_info=original_error or app_error
        )

    response = jsonify(problem)
    response.status_code = app_error.status
    response.headers['x-request-id'] = getattr(g, 'request_id', '')
    response.headers['x-trace-id'] = getattr(g, 'trace_id', '')
    response.headers['x-span-id'] = getattr(g, 'span_id', '')
    return response


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(AppError)
    def app_error_handler(error: AppError) -> Response:
        return _build_problem_response(error, original_error=error)

    @app.errorhandler(HTTPException)
    def http_error_handler(error: HTTPException) -> Response:
        mapped: AppError
        if error.code == 404:
            mapped = NotFoundError(detail=f'Route not found: {request.method} {request.path}')
            return _build_problem_response(mapped)

        mapped = map_to_app_error(error)
        return _build_problem_response(mapped, original_error=error)

    @app.errorhandler(Exception)
    def unknown_error_handler(error: Exception) -> Response:
        mapped = map_to_app_error(error)
        return _build_problem_response(mapped, original_error=error)
