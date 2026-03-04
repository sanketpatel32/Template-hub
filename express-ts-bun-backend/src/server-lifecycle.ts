import type { Logger } from 'pino';

type ShutdownReason = 'SIGINT' | 'SIGTERM' | 'uncaughtException' | 'unhandledRejection';

type ServerLifecycleOptions = {
  timeoutMs: number;
  logger: Logger;
  onBeforeShutdown?: () => void;
  onExit?: (exitCode: number) => void;
};

export type ClosableServer = {
  close(callback: (error?: Error) => void): void;
};

export function createServerLifecycle(server: ClosableServer, options: ServerLifecycleOptions) {
  let shutdownInProgress = false;

  async function shutdown(reason: ShutdownReason, initialExitCode: number): Promise<void> {
    if (shutdownInProgress) {
      options.logger.warn({ reason }, 'Shutdown already in progress');
      return;
    }

    shutdownInProgress = true;
    options.onBeforeShutdown?.();
    options.logger.warn({ reason }, 'Graceful shutdown initiated');

    let exitCode = initialExitCode;
    let timeoutHandle: NodeJS.Timeout | undefined;

    try {
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        }),
        new Promise<never>((_, reject) => {
          timeoutHandle = setTimeout(() => {
            reject(new Error(`Graceful shutdown timed out after ${options.timeoutMs}ms`));
          }, options.timeoutMs);
        }),
      ]);

      options.logger.info({ reason }, 'Graceful shutdown completed');
    } catch (error) {
      exitCode = 1;
      options.logger.error({ err: error, reason }, 'Graceful shutdown failed');
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }

      const onExit = options.onExit ?? ((code: number) => process.exit(code));
      onExit(exitCode);
    }
  }

  return {
    isShutdownInProgress: () => shutdownInProgress,
    shutdown,
  };
}
