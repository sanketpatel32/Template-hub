import uuid
from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from ..errors.app_error import AppError, to_problem_details
from ..errors.error_map import map_to_app_error
from ..errors.http_errors import NotFoundError
from ..observability.logger import logger


def _resolve_request_id(request: Request) -> str:
    request_id = getattr(request.state, 'request_id', None) or request.headers.get('x-request-id')
    if request_id:
        return request_id

    generated = str(uuid.uuid4())
    request.state.request_id = generated
    return generated


def _build_problem_response(
    request: Request,
    app_error: AppError,
    *,
    original_error: Exception | None = None,
) -> JSONResponse:
    request_id = _resolve_request_id(request)
    trace_id = getattr(request.state, 'trace_id', None)

    problem = to_problem_details(
        app_error,
        instance=request.url.path,
        request_id=request_id,
        trace_id=trace_id,
    )

    log_extra = {
        'problem': problem,
        'meta': app_error.meta,
        'request_id': request_id,
        'trace_id': trace_id,
    }

    if app_error.is_operational:
        logger.warning('Operational request error', extra=log_extra)
    else:
        logger.error(
            'Unhandled server error', extra=log_extra, exc_info=original_error or app_error
        )

    response = JSONResponse(status_code=app_error.status, content=problem)
    response.headers['x-request-id'] = request_id
    if trace_id:
        response.headers['x-trace-id'] = trace_id

    return response


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        return _build_problem_response(request, exc, original_error=exc)

    @app.middleware('http')
    async def app_error_bridge(request: Request, call_next):
        try:
            return await call_next(request)
        except AppError as exc:
            if getattr(request.state, 'rate_limit_error', False):
                return await handle_app_error(request, exc)
            raise

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        mapped = map_to_app_error(exc)
        return _build_problem_response(request, mapped, original_error=exc)

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        mapped: AppError

        if exc.status_code == 404:
            mapped = NotFoundError(detail=f'Route not found: {request.method} {request.url.path}')
            return _build_problem_response(request, mapped)

        status_code = exc.status_code
        title = (
            HTTPStatus(status_code).phrase
            if status_code in HTTPStatus._value2member_map_
            else 'HTTP Error'
        )
        mapped = AppError(
            status=status_code,
            code=f'HTTP_{status_code}',
            title=title,
            detail=str(exc.detail),
            is_operational=True,
        )
        return _build_problem_response(request, mapped, original_error=exc)

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        mapped = map_to_app_error(exc)
        return _build_problem_response(request, mapped, original_error=exc)
