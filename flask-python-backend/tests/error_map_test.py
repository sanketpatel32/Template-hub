from werkzeug.exceptions import BadRequest

from src.errors.error_map import map_to_app_error
from src.errors.http_errors import InternalServerError


def test_maps_http_exception() -> None:
    mapped = map_to_app_error(BadRequest('bad input'))

    assert mapped.status == 400
    assert mapped.code == 'HTTP_400'


def test_maps_unknown_exception_to_internal_server_error() -> None:
    mapped = map_to_app_error(RuntimeError('boom'))

    assert isinstance(mapped, InternalServerError)
