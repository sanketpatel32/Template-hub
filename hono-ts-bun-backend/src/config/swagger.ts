export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Hono Bun Template API",
    version: "1.0.0",
    description: "Production-baseline Hono starter with TypeScript and Bun runtime.",
  },
  paths: {
    "/health": {
      get: {
        summary: "Service health check",
        responses: { "200": { description: "Service is healthy" } },
      },
    },
    "/ready": {
      get: {
        summary: "Service readiness check",
        responses: {
          "200": { description: "Service is ready" },
          "503": { description: "Service is shutting down" },
        },
      },
    },
    "/metrics": {
      get: {
        summary: "Prometheus metrics endpoint",
        responses: { "200": { description: "Prometheus metrics payload" } },
      },
    },
    "/api/v1/ping": {
      get: { summary: "Ping endpoint", responses: { "200": { description: "Pong response" } } },
    },
  },
} as const;
