import { createServer } from 'node:http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './observability/logger';
import { createServerLifecycle } from './server-lifecycle';
import { markShuttingDown } from './state/readiness';

const app = createApp();
const server = createServer(app);

const lifecycle = createServerLifecycle(server, {
  timeoutMs: env.SHUTDOWN_TIMEOUT_MS,
  logger,
  onBeforeShutdown: markShuttingDown,
});

server.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      environment: env.NODE_ENV,
    },
    'Server is listening',
  );
});

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
