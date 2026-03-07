from project.readiness import is_ready, mark_ready, mark_shutting_down, shutdown_timeout_seconds


def test_readiness_lifecycle():
    mark_ready()
    assert is_ready() is True
    mark_shutting_down()
    assert is_ready() is False
    mark_ready()


def test_shutdown_timeout_positive():
    assert shutdown_timeout_seconds() > 0
