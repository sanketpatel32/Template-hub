import asyncio
import logging
import sys
from collections.abc import Callable
from typing import Literal, Protocol

ShutdownReason = Literal['SIGINT', 'SIGTERM', 'uncaughtException', 'unhandledRejection']


class ClosableServer(Protocol):
    async def close(self) -> None: ...


class ServerLifecycle:
    def __init__(
        self,
        server: ClosableServer,
        *,
        timeout_ms: int,
        logger: logging.Logger,
        on_before_shutdown: Callable[[], None] | None = None,
        on_exit: Callable[[int], None] | None = None,
    ) -> None:
        self._server = server
        self._timeout_ms = timeout_ms
        self._logger = logger
        self._on_before_shutdown = on_before_shutdown
        self._on_exit = on_exit
        self._shutdown_in_progress = False

    def is_shutdown_in_progress(self) -> bool:
        return self._shutdown_in_progress

    async def shutdown(self, reason: ShutdownReason, initial_exit_code: int) -> None:
        if self._shutdown_in_progress:
            self._logger.warning('Shutdown already in progress', extra={'reason': reason})
            return

        self._shutdown_in_progress = True
        if self._on_before_shutdown is not None:
            self._on_before_shutdown()

        self._logger.warning('Graceful shutdown initiated', extra={'reason': reason})
        exit_code = initial_exit_code

        try:
            await asyncio.wait_for(self._server.close(), timeout=self._timeout_ms / 1000)
            self._logger.info('Graceful shutdown completed', extra={'reason': reason})
        except Exception as error:  # noqa: BLE001
            exit_code = 1
            self._logger.error('Graceful shutdown failed', extra={'reason': reason}, exc_info=error)
        finally:
            on_exit = self._on_exit or sys.exit
            on_exit(exit_code)


def create_server_lifecycle(
    server: ClosableServer,
    *,
    timeout_ms: int,
    logger: logging.Logger,
    on_before_shutdown: Callable[[], None] | None = None,
    on_exit: Callable[[int], None] | None = None,
) -> ServerLifecycle:
    return ServerLifecycle(
        server,
        timeout_ms=timeout_ms,
        logger=logger,
        on_before_shutdown=on_before_shutdown,
        on_exit=on_exit,
    )
