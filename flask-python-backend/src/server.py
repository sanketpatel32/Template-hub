from .app import create_app
from .config.env import settings
from .observability.logger import logger

app = create_app()


def main() -> None:
    logger.info('Starting Flask server', extra={'port': settings.PORT, 'env': settings.NODE_ENV})
    app.run(host=settings.HOST, port=settings.PORT)


if __name__ == '__main__':
    main()
