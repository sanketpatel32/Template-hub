_is_ready = True


def is_service_ready() -> bool:
    return _is_ready


def mark_shutting_down() -> None:
    global _is_ready
    _is_ready = False


def reset_readiness() -> None:
    global _is_ready
    _is_ready = True
