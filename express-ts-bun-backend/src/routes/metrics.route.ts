import { Router } from 'express';
import { env } from '../config/env';
import { NotFoundError } from '../errors/http-errors';
import { getMetricsSnapshot, metricsRegistry } from '../observability/metrics';

const metricsRouter = Router();

metricsRouter.get('/', async (_req, res, next) => {
  if (!env.METRICS_ENABLED) {
    next(
      new NotFoundError({
        detail: 'Metrics endpoint is disabled.',
      }),
    );
    return;
  }

  try {
    const metrics = await getMetricsSnapshot();
    res.setHeader('Content-Type', metricsRegistry.contentType);
    res.status(200).send(metrics);
  } catch (error) {
    next(error);
  }
});

export { metricsRouter };
