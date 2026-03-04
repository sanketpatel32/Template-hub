from typing import Annotated

from pydantic import BaseModel, Field
from pydantic import ValidationError as PydanticValidationError

from src.errors.error_map import map_to_app_error
from src.errors.http_errors import NotFoundError


class Payload(BaseModel):
    name: Annotated[str, Field(min_length=3)]


def test_passes_through_known_app_error_instances() -> None:
    original = NotFoundError(detail='Entity was not found.')

    mapped = map_to_app_error(original)

    assert mapped is original
    assert mapped.status == 404


def test_maps_pydantic_validation_errors_to_validation_error() -> None:
    caught_error: PydanticValidationError | None = None

    try:
        Payload(name='ab')
    except PydanticValidationError as error:
        caught_error = error

    assert caught_error is not None

    mapped = map_to_app_error(caught_error)
    assert mapped.status == 400
    assert mapped.code == 'VALIDATION_ERROR'
    assert len(mapped.errors) > 0


def test_maps_unknown_errors_to_internal_server_error() -> None:
    mapped = map_to_app_error(RuntimeError('boom'))

    assert mapped.status == 500
    assert mapped.code == 'INTERNAL_SERVER_ERROR'
    assert mapped.detail == 'Unexpected server error.'
