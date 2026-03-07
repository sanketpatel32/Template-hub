from werkzeug.exceptions import HTTPException

from .app_error import AppError
from .http_errors import InternalServerError, NotFoundError


def map_to_app_error(error: Exception) -> AppError:
    if isinstance(error, AppError):
        return error

    if isinstance(error, HTTPException):
        if error.code == 404:
            return NotFoundError(detail='Route not found.')

        status = error.code or 500
        title = error.name or 'HTTP Error'
        detail = error.description if isinstance(error.description, str) else 'Request failed.'
        return AppError(
            status=status,
            code=f'HTTP_{status}',
            title=title,
            detail=detail,
            is_operational=status < 500,
        )

    return InternalServerError()
