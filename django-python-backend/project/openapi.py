from __future__ import annotations

from typing import Any


def schema() -> dict[str, Any]:
    return {
        'openapi': '3.0.3',
        'info': {'title': 'django-python-backend', 'version': '1.0.0'},
        'paths': {
            '/health': {
                'get': {'summary': 'Health check', 'responses': {'200': {'description': 'OK'}}}
            },
            '/ready': {
                'get': {
                    'summary': 'Readiness check',
                    'responses': {
                        '200': {'description': 'Ready'},
                        '503': {'description': 'Not ready'},
                    },
                }
            },
            '/metrics': {
                'get': {
                    'summary': 'Prometheus metrics',
                    'responses': {'200': {'description': 'Metrics'}},
                }
            },
            '/api/v1/ping': {
                'get': {'summary': 'Ping endpoint', 'responses': {'200': {'description': 'Pong'}}}
            },
            '/openapi.json': {
                'get': {
                    'summary': 'OpenAPI document',
                    'responses': {'200': {'description': 'OpenAPI JSON'}},
                }
            },
            '/docs': {
                'get': {
                    'summary': 'Swagger UI docs',
                    'responses': {'200': {'description': 'Docs page'}},
                }
            },
        },
    }
