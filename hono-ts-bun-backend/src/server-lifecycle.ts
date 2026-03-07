import type { Logger } from "pino";

type ShutdownReason = "SIGINT" | "SIGTERM" | "uncaughtException" | "unhandledRejection";

type ServerLifecycleOptions = {
  timeoutMs: number;
  logger: Logger;
  onBeforeShutdown?: () => void;
  onExit?: (exitCode: number) => void;
};

export type ClosableServer = {
  stop: (closeActiveConnections?: boolean) => Promise<void>;
};

export function createServerLifecycle(server: ClosableServer, options: ServerLifecycleOptions) {
  let shutdownInProgress = false;

  async function shutdown(reason: ShutdownReason, initialExitCode: number): Promise<void> {
    if (shutdownInProgress) {
      options.logger.warn({ reason }, "Shutdown already in progress");
      return;
    }

    shutdownInProgress = true;
    options.onBeforeShutdown?.();
    options.logger.warn({ reason }, "Graceful shutdown initiated");

    let exitCode = initialExitCode;

    try {
      await Promise.race([
        server.stop(true),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Graceful shutdown timed out after ${options.timeoutMs}ms`));
          }, options.timeoutMs);
        }),
      ]);
      options.logger.info({ reason }, "Graceful shutdown completed");
    } catch (error) {
      exitCode = 1;
      options.logger.error({ err: error, reason }, "Graceful shutdown failed");
    } finally {
      const onExit = options.onExit ?? ((code: number) => process.exit(code));
      onExit(exitCode);
    }
  }

  return {
    isShutdownInProgress: () => shutdownInProgress,
    shutdown,
  };
}
