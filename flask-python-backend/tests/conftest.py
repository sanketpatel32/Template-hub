import os
from collections.abc import Generator

import pytest

os.environ.setdefault('NODE_ENV', 'test')
os.environ.setdefault('FLASK_SECRET_KEY', 'test-secret')

from src.app import create_app
from src.middleware.rate_limit import rate_limiter
from src.state.readiness import reset_readiness


@pytest.fixture()
def client() -> Generator:
    reset_readiness()
    rate_limiter._requests.clear()
    app = create_app()
    app.config.update(TESTING=True)

    with app.test_client() as test_client:
        yield test_client

    reset_readiness()
    rate_limiter._requests.clear()
