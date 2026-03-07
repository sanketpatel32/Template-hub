from __future__ import annotations

from typing import Any

from django.http import HttpRequest

from apps.api.errors.app_error import AppError


def success_response(data: dict[str, Any], meta: dict[str, Any] | None = None) -> dict[str, Any]:
    payload: dict[str, Any] = {'success': True, 'data': data}
    if meta is not None:
        payload['meta'] = meta
    return payload


def problem_details(error: AppError, request: HttpRequest) -> dict[str, Any]:
    return {
        'type': error.type_uri,
        'title': error.title,
        'status': error.status,
        'detail': error.detail,
        'instance': request.path,
        'code': error.code,
        'requestId': getattr(request, 'request_id', None),
        'traceId': getattr(request, 'trace_id', None),
        'errors': error.errors,
    }
