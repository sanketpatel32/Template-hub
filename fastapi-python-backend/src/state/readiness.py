shutting_down = False


def is_service_ready() -> bool:
    return not shutting_down


def mark_shutting_down() -> None:
    global shutting_down
    shutting_down = True


def reset_readiness() -> None:
    global shutting_down
    shutting_down = False
