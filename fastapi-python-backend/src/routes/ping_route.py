from fastapi import APIRouter

ping_router = APIRouter(prefix='/api/v1', tags=['ping'])


@ping_router.get('/ping')
async def ping() -> dict[str, object]:
    return {
        'success': True,
        'data': {
            'message': 'pong',
            'version': 'v1',
        },
    }
