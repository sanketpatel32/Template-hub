import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { env } from "./config/env";
import { openApiDocument } from "./config/swagger";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { rateLimitMiddleware } from "./middleware/rate-limit";
import { requestContextMiddleware } from "./middleware/request-context";
import { requestIdMiddleware } from "./middleware/request-id";
import { registerRoutes } from "./routes";
import type { AppVariables } from "./types/context";

function resolveCorsOrigins(value: string): string[] | "*" {
  if (value.trim() === "*") {
    return "*";
  }

  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return origins.length > 0 ? origins : "*";
}

export function createApp() {
  const app = new Hono<{ Variables: AppVariables }>();

  app.use("*", requestIdMiddleware);
  app.use("*", requestContextMiddleware);
  app.use("*", secureHeaders());
  app.use(
    "*",
    cors({
      origin: resolveCorsOrigins(env.CORS_ORIGIN),
      credentials: true,
    }),
  );
  app.use("*", compress());
  app.use("*", rateLimitMiddleware);

  app.get("/openapi.json", (c) => c.json(openApiDocument));
  app.get("/docs", swaggerUI({ url: "/openapi.json" }));

  registerRoutes(app);

  app.notFound(notFoundHandler);
  app.onError(errorHandler);

  return app;
}
