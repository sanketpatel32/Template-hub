import { Counter, collectDefaultMetrics, Histogram, Registry } from "prom-client";
import { env } from "../config/env";

export const metricsRegistry = new Registry();

metricsRegistry.setDefaultLabels({
  service: "hono-ts-bun-backend",
  environment: env.NODE_ENV,
});

if (env.METRICS_ENABLED && env.NODE_ENV !== "test") {
  collectDefaultMetrics({
    register: metricsRegistry,
  });
}

const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests served",
  labelNames: ["method", "route", "status_code"],
  registers: [metricsRegistry],
});

const httpRequestDurationSeconds = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [metricsRegistry],
});

export function observeRequest(input: {
  method: string;
  route: string;
  statusCode: number;
  durationSeconds: number;
}) {
  if (!env.METRICS_ENABLED) {
    return;
  }

  httpRequestsTotal.inc({
    method: input.method,
    route: input.route,
    status_code: String(input.statusCode),
  });

  httpRequestDurationSeconds.observe(
    {
      method: input.method,
      route: input.route,
      status_code: String(input.statusCode),
    },
    input.durationSeconds,
  );
}

export async function getMetricsSnapshot() {
  return metricsRegistry.metrics();
}
