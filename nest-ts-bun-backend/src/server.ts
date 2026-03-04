import { createApp } from './app';
import { env } from './config/env';
import { logger } from './observability/logger';
import { createServerLifecycle } from './server-lifecycle';
import { markShuttingDown } from './state/readiness';

const app = await createApp();

const lifecycle = createServerLifecycle(
  {
    close: (callback) => {
      void app.close().then(
        () => callback(),
        (error: unknown) => callback(error as Error),
      );
    },
  },
  {
    timeoutMs: env.SHUTDOWN_TIMEOUT_MS,
    logger,
    onBeforeShutdown: markShuttingDown,
  },
);

try {
  await app.listen(env.PORT);

  logger.info(
    {
      port: env.PORT,
      environment: env.NODE_ENV,
    },
    'Server is listening',
  );
} catch (error) {
  logger.fatal({ err: error }, 'Failed to start server');
  process.exit(1);
}

process.on('SIGINT', () => {
  void lifecycle.shutdown('SIGINT', 0);
});

process.on('SIGTERM', () => {
  void lifecycle.shutdown('SIGTERM', 0);
});

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  void lifecycle.shutdown('uncaughtException', 1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled promise rejection');
  void lifecycle.shutdown('unhandledRejection', 1);
});
