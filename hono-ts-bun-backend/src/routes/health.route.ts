import { Hono } from "hono";
import { env } from "../config/env";
import { ServiceUnavailableError } from "../errors/http-errors";
import { isServiceReady } from "../state/readiness";
import type { AppVariables } from "../types/context";

export function createHealthRoutes() {
  const routes = new Hono<{ Variables: AppVariables }>();

  routes.get("/health", (c) => {
    return c.json({
      success: true,
      data: {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
      },
    });
  });

  routes.get("/ready", (c) => {
    if (!isServiceReady()) {
      throw new ServiceUnavailableError({
        detail: "Service is shutting down and not ready to serve traffic.",
      });
    }

    return c.json({
      success: true,
      data: {
        ready: true,
        timestamp: new Date().toISOString(),
      },
    });
  });

  return routes;
}
