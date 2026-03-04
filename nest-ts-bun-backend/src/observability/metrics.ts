import type { RequestHandler } from 'express';
import { Counter, collectDefaultMetrics, Histogram, Registry } from 'prom-client';
import { env } from '../config/env';

export const metricsRegistry = new Registry();

metricsRegistry.setDefaultLabels({
  service: 'nest-ts-bun-backend',
  environment: env.NODE_ENV,
});

if (env.METRICS_ENABLED && env.NODE_ENV !== 'test') {
  collectDefaultMetrics({
    register: metricsRegistry,
  });
}

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests served',
  labelNames: ['method', 'route', 'status_code'],
  registers: [metricsRegistry],
});

const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [metricsRegistry],
});

function resolveRoute(req: Parameters<RequestHandler>[0]): string {
  const routePath = req.route?.path;

  if (typeof routePath === 'string' && routePath.length > 0) {
    return `${req.baseUrl}${routePath}`;
  }

  return req.path || req.originalUrl || 'unknown';
}

export const metricsMiddleware: RequestHandler = (req, res, next) => {
  if (!env.METRICS_ENABLED) {
    next();
    return;
  }

  const end = httpRequestDurationSeconds.startTimer({
    method: req.method,
  });

  res.on('finish', () => {
    const route = resolveRoute(req);
    const statusCode = String(res.statusCode);

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });

    end({
      route,
      status_code: statusCode,
    });
  });

  next();
};

export async function getMetricsSnapshot() {
  return metricsRegistry.metrics();
}
