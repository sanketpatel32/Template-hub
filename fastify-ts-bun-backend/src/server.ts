import { createApp } from './app';
import { env } from './config/env';
import { logger } from './observability/logger';
import { createServerLifecycle } from './server-lifecycle';
import { markShuttingDown } from './state/readiness';

const app = await createApp();

const lifecycle = createServerLifecycle(
  {
    close: async () => {
      await app.close();
    },
  },
  {
    timeoutMs: env.SHUTDOWN_TIMEOUT_MS,
    logger,
    onBeforeShutdown: markShuttingDown,
  },
);

type ShutdownReason = Parameters<typeof lifecycle.shutdown>[0];

function triggerShutdown(reason: ShutdownReason, exitCode: number): void {
  lifecycle.shutdown(reason, exitCode).catch((shutdownError) => {
    logger.error({ err: shutdownError, reason }, 'Shutdown promise rejected unexpectedly');
    process.exit(1);
  });
}

try {
  await app.listen({
    port: env.PORT,
    host: '0.0.0.0',
  });

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
  triggerShutdown('SIGINT', 0);
});

process.on('SIGTERM', () => {
  triggerShutdown('SIGTERM', 0);
});

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  triggerShutdown('uncaughtException', 1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled promise rejection');
  triggerShutdown('unhandledRejection', 1);
});
