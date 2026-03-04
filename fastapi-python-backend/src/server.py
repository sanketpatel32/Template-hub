import signal

import uvicorn

from .app import app
from .config.env import settings
from .observability.logger import logger
from .state.readiness import mark_shutting_down


def _handle_signal(signum: int, _frame: object | None) -> None:
    mark_shutting_down()
    signal_name = signal.Signals(signum).name
    logger.warning('Graceful shutdown initiated', extra={'reason': signal_name})


def run() -> None:
    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)

    logger.info(
        'Server is listening',
        extra={
            'port': settings.PORT,
            'environment': settings.NODE_ENV,
        },
    )

    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        log_level='info' if settings.LOG_LEVEL == 'warn' else settings.LOG_LEVEL,
        access_log=False,
    )


if __name__ == '__main__':
    run()
