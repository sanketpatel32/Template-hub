import type { FastifyInstance } from 'fastify';
import { env } from '../config/env';
import { ServiceUnavailableError } from '../errors/http-errors';
import { isServiceReady } from '../state/readiness';

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  }));

  app.get('/ready', async () => {
    if (!isServiceReady()) {
      throw new ServiceUnavailableError({
        detail: 'Service is shutting down and not ready to serve traffic.',
      });
    }

    return {
      success: true,
      data: {
        ready: true,
        timestamp: new Date().toISOString(),
      },
    };
  });
}
