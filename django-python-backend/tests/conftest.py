from __future__ import annotations

import os

import pytest

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')


@pytest.fixture
def client():
    from django.test import Client

    return Client()
