import { Hono } from "hono";
import { env } from "../config/env";
import { NotFoundError } from "../errors/http-errors";
import { getMetricsSnapshot, metricsRegistry } from "../observability/metrics";
import type { AppVariables } from "../types/context";

export function createMetricsRoutes() {
  const routes = new Hono<{ Variables: AppVariables }>();

  routes.get("/metrics", async (c) => {
    if (!env.METRICS_ENABLED) {
      throw new NotFoundError({
        detail: "Metrics endpoint is disabled.",
      });
    }

    const metrics = await getMetricsSnapshot();
    c.header("Content-Type", metricsRegistry.contentType);
    return c.text(metrics);
  });

  return routes;
}
