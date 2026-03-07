import { Hono } from "hono";
import type { AppVariables } from "../types/context";

export function createPingRoutes() {
  const routes = new Hono<{ Variables: AppVariables }>();

  routes.get("/api/v1/ping", (c) => {
    return c.json({
      success: true,
      data: {
        message: "pong",
        version: "v1",
      },
    });
  });

  return routes;
}
