import { randomUUID } from 'node:crypto';
import compress from '@fastify/compress';
import type { FastifyCorsOptions } from '@fastify/cors';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify from 'fastify';
import { env } from './config/env';
import { setupSwagger } from './config/swagger';
import { setFastifyErrorHandler } from './middleware/error-handler';
import { setFastifyNotFoundHandler } from './middleware/not-found';
import { registerRateLimiter } from './middleware/rate-limit';
import { registerRequestContextHooks } from './middleware/request-context';
import { requestIdHook } from './middleware/request-id';
import { httpLoggerOnResponseHook } from './observability/http-logger';
import { fastifyLoggerOptions } from './observability/logger';
import { metricsHooks } from './observability/metrics';
import { registerRoutes } from './routes';

function resolveCorsOrigins(value: string): FastifyCorsOptions['origin'] {
  if (value.trim() === '*') {
    return true;
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return origins.length > 0 ? origins : true;
}

export async function createApp() {
  const app = Fastify({
    logger: fastifyLoggerOptions,
    trustProxy: env.TRUST_PROXY,
    disableRequestLogging: true,
    genReqId: (request) => {
      const headerValue = request.headers['x-request-id'];
      if (Array.isArray(headerValue)) {
        return headerValue[0] ?? randomUUID();
      }

      return headerValue ?? randomUUID();
    },
  });

  app.addHook('onRequest', requestIdHook);
  registerRequestContextHooks(app);

  await app.register(helmet);
  await app.register(cors, {
    origin: resolveCorsOrigins(env.CORS_ORIGIN),
  });
  await app.register(compress);

  app.addHook('onRequest', metricsHooks.onRequest);
  app.addHook('onResponse', metricsHooks.onResponse);
  app.addHook('onResponse', httpLoggerOnResponseHook);
  setFastifyErrorHandler(app);

  await registerRateLimiter(app);
  await registerRoutes(app);
  await setupSwagger(app);

  setFastifyNotFoundHandler(app);

  return app;
}
