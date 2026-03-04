import type { Logger } from 'pino';

type ShutdownReason = 'SIGINT' | 'SIGTERM' | 'uncaughtException' | 'unhandledRejection';

type ServerLifecycleOptions = {
  timeoutMs: number;
  logger: Logger;
  onBeforeShutdown?: () => void;
  onExit?: (exitCode: number) => void;
};

export type ClosableServer = {
  close(callback?: (error?: Error) => void): void | Promise<void>;
};

function closeServer(server: ClosableServer): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const done = (error?: Error) => {
      if (settled) {
        return;
      }

      settled = true;
      if (error) {
        reject(error);
        return;
      }

      resolve();
    };

    try {
      const maybePromise = server.close(done);

      if (maybePromise && typeof (maybePromise as Promise<void>).then === 'function') {
        const closePromise = maybePromise as Promise<void>;
        closePromise.then(() => done()).catch((error) => done(error as Error));
      }
    } catch (error) {
      done(error as Error);
    }
  });
}

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
        closeServer(server),
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
