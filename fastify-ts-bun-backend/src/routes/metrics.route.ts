import type { FastifyInstance } from 'fastify';
import { env } from '../config/env';
import { NotFoundError } from '../errors/http-errors';
import { getMetricsSnapshot, metricsRegistry } from '../observability/metrics';

export async function registerMetricsRoute(app: FastifyInstance): Promise<void> {
  app.get('/metrics', async (request, reply) => {
    if (!env.METRICS_ENABLED) {
      throw new NotFoundError({
        detail: 'Metrics endpoint is disabled.',
      });
    }

    try {
      const metrics = await getMetricsSnapshot();
      reply.header('Content-Type', metricsRegistry.contentType);
      return metrics;
    } catch (error) {
      request.log.error({ err: error }, 'Failed to collect metrics');
      throw error;
    }
  });
}
