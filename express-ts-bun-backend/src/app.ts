import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { setupSwagger } from './config/swagger';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';
import { createRateLimiter } from './middleware/rate-limit';
import { requestContextMiddleware } from './middleware/request-context';
import { requestIdMiddleware } from './middleware/request-id';
import { httpLoggerMiddleware } from './observability/http-logger';
import { metricsMiddleware } from './observability/metrics';
import { registerRoutes } from './routes';

function resolveCorsOrigins(value: string): string[] | true {
  if (value.trim() === '*') {
    return true;
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return origins.length > 0 ? origins : true;
}

export function createApp() {
  const app = express();
  const allowedOrigins = resolveCorsOrigins(env.CORS_ORIGIN);

  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);

  app.use(requestIdMiddleware);
  app.use(requestContextMiddleware);
  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins,
    }),
  );
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(httpLoggerMiddleware);
  app.use(metricsMiddleware);
  app.use(createRateLimiter());

  registerRoutes(app);
  setupSwagger(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
