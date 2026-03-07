import asyncio
import logging

import pytest

from src.server_lifecycle import create_server_lifecycle


class SuccessfulServer:
    async def close(self) -> None:
        await asyncio.sleep(0)


class HungServer:
    async def close(self) -> None:
        await asyncio.sleep(60)


def _logger() -> logging.Logger:
    logger = logging.getLogger('server-lifecycle-test')
    if not logger.handlers:
        logger.addHandler(logging.NullHandler())
    return logger


@pytest.mark.asyncio
async def test_calls_graceful_close_and_exits_with_0_on_success() -> None:
    exit_codes: list[int] = []

    lifecycle = create_server_lifecycle(
        SuccessfulServer(),
        timeout_ms=25,
        logger=_logger(),
        on_exit=exit_codes.append,
    )

    await lifecycle.shutdown('SIGTERM', 0)

    assert exit_codes == [0]
    assert lifecycle.is_shutdown_in_progress() is True


@pytest.mark.asyncio
async def test_times_out_and_exits_with_1_when_close_hangs() -> None:
    exit_codes: list[int] = []

    lifecycle = create_server_lifecycle(
        HungServer(),
        timeout_ms=10,
        logger=_logger(),
        on_exit=exit_codes.append,
    )

    await lifecycle.shutdown('SIGINT', 0)

    assert exit_codes == [1]
