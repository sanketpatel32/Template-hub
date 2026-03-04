import type { FastifyInstance } from 'fastify';
import { registerHealthRoutes } from './health.route';
import { registerMetricsRoute } from './metrics.route';
import { registerPingRoutes } from './ping.route';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await registerHealthRoutes(app);
  await registerMetricsRoute(app);
  await registerPingRoutes(app);
}
