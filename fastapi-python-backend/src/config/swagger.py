from typing import Any

OPENAPI_TITLE = 'FastAPI Python Template API'
OPENAPI_VERSION = '1.0.0'
OPENAPI_DESCRIPTION = 'Production-baseline FastAPI starter with Python runtime.'


def get_fastapi_app_kwargs() -> dict[str, Any]:
    return {
        'title': OPENAPI_TITLE,
        'version': OPENAPI_VERSION,
        'description': OPENAPI_DESCRIPTION,
        'openapi_url': '/openapi.json',
        'docs_url': '/docs',
    }
