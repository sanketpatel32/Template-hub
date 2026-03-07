from __future__ import annotations

from apps.api.errors.app_error import AppError
from apps.api.errors.http_errors import InternalServerError, ValidationError


def map_to_app_error(error: Exception) -> AppError:
    if isinstance(error, AppError):
        return error
    if isinstance(error, (ValueError, TypeError)):
        return ValidationError(detail=str(error))
    return InternalServerError(detail='An unexpected error occurred')
