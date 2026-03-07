import type { Hono } from "hono";
import type { AppVariables } from "../types/context";
import { createHealthRoutes } from "./health.route";
import { createMetricsRoutes } from "./metrics.route";
import { createPingRoutes } from "./ping.route";

export function registerRoutes(app: Hono<{ Variables: AppVariables }>): void {
  app.route("/", createHealthRoutes());
  app.route("/", createMetricsRoutes());
  app.route("/", createPingRoutes());
}
