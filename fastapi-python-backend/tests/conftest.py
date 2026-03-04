from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from src.app import create_app
from src.state.readiness import reset_readiness


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    reset_readiness()
    app = create_app()

    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client

    reset_readiness()
