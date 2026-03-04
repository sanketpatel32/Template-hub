import type { onRequestHookHandler, onResponseHookHandler } from 'fastify';
import { Counter, collectDefaultMetrics, Histogram, Registry } from 'prom-client';
import { env } from '../config/env';

export const metricsRegistry = new Registry();

metricsRegistry.setDefaultLabels({
  service: 'fastify-ts-bun-backend',
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

function resolveRoute(request: Parameters<onResponseHookHandler>[0]): string {
  const route = request.routeOptions.url;
  if (typeof route === 'string' && route.length > 0) {
    return route;
  }

  return request.url || 'unknown';
}

const onRequest: onRequestHookHandler = (request, _reply, done) => {
  if (!env.METRICS_ENABLED) {
    done();
    return;
  }

  request.requestContext = {
    ...request.requestContext,
    metricsStartTimeNs: process.hrtime.bigint(),
  };

  done();
};

const onResponse: onResponseHookHandler = (request, reply, done) => {
  if (!env.METRICS_ENABLED) {
    done();
    return;
  }

  const route = resolveRoute(request);
  const statusCode = String(reply.statusCode);

  httpRequestsTotal.inc({
    method: request.method,
    route,
    status_code: statusCode,
  });

  const startedAt = request.requestContext?.metricsStartTimeNs;
  if (startedAt) {
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
    httpRequestDurationSeconds.observe(
      {
        method: request.method,
        route,
        status_code: statusCode,
      },
      durationSeconds,
    );
  }

  done();
};

export const metricsHooks = {
  onRequest,
  onResponse,
};

export async function getMetricsSnapshot() {
  return metricsRegistry.metrics();
}
