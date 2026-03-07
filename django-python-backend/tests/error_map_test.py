from apps.api.errors.error_map import map_to_app_error


def test_value_error_maps_to_validation_error():
    err = map_to_app_error(ValueError('bad value'))
    assert err.status == 400
    assert err.code == 'VALIDATION_ERROR'
