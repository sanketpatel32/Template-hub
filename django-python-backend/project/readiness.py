from __future__ import annotations

import logging
import signal
import threading
from dataclasses import dataclass

from project.env import get_settings

logger = logging.getLogger(__name__)


@dataclass
class ReadinessState:
    ready: bool = True
    shutting_down: bool = False


_state = ReadinessState()
_lock = threading.Lock()
_handlers_installed = False


def mark_ready() -> None:
    with _lock:
        _state.ready = True
        _state.shutting_down = False


def mark_shutting_down() -> None:
    with _lock:
        _state.ready = False
        _state.shutting_down = True


def is_ready() -> bool:
    with _lock:
        return _state.ready and not _state.shutting_down


def is_shutting_down() -> bool:
    with _lock:
        return _state.shutting_down


def install_signal_handlers() -> None:
    global _handlers_installed
    if _handlers_installed:
        return

    def _handler(signum: int, _frame: object) -> None:
        mark_shutting_down()
        logger.warning('Shutdown signal received', extra={'signal': signum})

    signal.signal(signal.SIGTERM, _handler)
    signal.signal(signal.SIGINT, _handler)
    _handlers_installed = True


def shutdown_timeout_seconds() -> float:
    return get_settings().shutdown_timeout_ms / 1000
