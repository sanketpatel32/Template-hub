import type { Logger } from 'pino';
import { describe, expect, it, vi } from 'vitest';
import { createServerLifecycle } from '../src/server-lifecycle';

function createFakeLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger;
}

describe('server lifecycle', () => {
  it('calls graceful close and exits with 0 on success', async () => {
    const fakeServer = {
      close: (callback: (error?: Error) => void) => {
        callback();
      },
    };

    const onBeforeShutdown = vi.fn();
    const onExit = vi.fn();
    const lifecycle = createServerLifecycle(fakeServer, {
      timeoutMs: 25,
      logger: createFakeLogger(),
      onBeforeShutdown,
      onExit,
    });

    await lifecycle.shutdown('SIGTERM', 0);

    expect(onBeforeShutdown).toHaveBeenCalledTimes(1);
    expect(onExit).toHaveBeenCalledWith(0);
    expect(lifecycle.isShutdownInProgress()).toBe(true);
  });

  it('times out and exits with 1 when close does not finish', async () => {
    const fakeServer = {
      close: (_callback: (error?: Error) => void) => {
        // Intentionally never calling the callback to simulate a hung shutdown.
      },
    };

    const onExit = vi.fn();
    const lifecycle = createServerLifecycle(fakeServer, {
      timeoutMs: 10,
      logger: createFakeLogger(),
      onExit,
    });

    await lifecycle.shutdown('SIGINT', 0);

    expect(onExit).toHaveBeenCalledWith(1);
  });
});
