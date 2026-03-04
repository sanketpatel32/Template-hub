from json import JSONDecodeError

from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError as PydanticValidationError

from .app_error import AppError
from .http_errors import InternalServerError, ValidationError


def map_to_app_error(error: Exception | BaseException | object) -> AppError:
    if isinstance(error, AppError):
        return error

    if isinstance(error, (PydanticValidationError, RequestValidationError)):
        return ValidationError(
            detail='Request validation failed.',
            errors=list(error.errors()),
            cause=error if isinstance(error, Exception) else None,
        )

    if isinstance(error, JSONDecodeError):
        return ValidationError(
            detail='Malformed JSON body.',
            cause=error,
        )

    if isinstance(error, Exception):
        return InternalServerError(
            detail='Unexpected server error.',
            cause=error,
            meta={
                'originalErrorName': error.__class__.__name__,
            },
        )

    return InternalServerError(
        detail='Unexpected server error.',
        meta={
            'unknownErrorType': type(error).__name__,
        },
    )
