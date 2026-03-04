import asyncio
import logging

import pytest

from src.server_lifecycle import create_server_lifecycle


def _create_fake_logger() -> logging.Logger:
    logger = logging.getLogger('server-lifecycle-test')
    if not logger.handlers:
        logger.addHandler(logging.NullHandler())
    return logger


class SuccessfulServer:
    async def close(self) -> None:
        return None


class HungServer:
    async def close(self) -> None:
        await asyncio.sleep(60)


@pytest.mark.asyncio
async def test_calls_graceful_close_and_exits_with_0_on_success() -> None:
    on_before_shutdown_called = False
    exit_codes: list[int] = []

    def on_before_shutdown() -> None:
        nonlocal on_before_shutdown_called
        on_before_shutdown_called = True

    def on_exit(code: int) -> None:
        exit_codes.append(code)

    lifecycle = create_server_lifecycle(
        SuccessfulServer(),
        timeout_ms=25,
        logger=_create_fake_logger(),
        on_before_shutdown=on_before_shutdown,
        on_exit=on_exit,
    )

    await lifecycle.shutdown('SIGTERM', 0)

    assert on_before_shutdown_called is True
    assert exit_codes == [0]
    assert lifecycle.is_shutdown_in_progress() is True


@pytest.mark.asyncio
async def test_times_out_and_exits_with_1_when_close_does_not_finish() -> None:
    exit_codes: list[int] = []

    def on_exit(code: int) -> None:
        exit_codes.append(code)

    lifecycle = create_server_lifecycle(
        HungServer(),
        timeout_ms=10,
        logger=_create_fake_logger(),
        on_exit=on_exit,
    )

    await lifecycle.shutdown('SIGINT', 0)

    assert exit_codes == [1]
