import { Router } from 'express';
import { env } from '../config/env';
import { ServiceUnavailableError } from '../errors/http-errors';
import { isServiceReady } from '../state/readiness';

const healthRouter = Router();
const readyRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

readyRouter.get('/', (_req, res, next) => {
  if (!isServiceReady()) {
    next(
      new ServiceUnavailableError({
        detail: 'Service is shutting down and not ready to serve traffic.',
      }),
    );
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      ready: true,
      timestamp: new Date().toISOString(),
    },
  });
});

export { healthRouter, readyRouter };
