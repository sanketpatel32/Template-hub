import type { Express } from 'express';
import { healthRouter, readyRouter } from './health.route';
import { metricsRouter } from './metrics.route';
import { pingRouter } from './ping.route';

export function registerRoutes(app: Express): void {
  app.use('/health', healthRouter);
  app.use('/ready', readyRouter);
  app.use('/metrics', metricsRouter);
  app.use('/api/v1', pingRouter);
}
