import type { MiddlewareHandler } from "hono";
import { logger } from "../observability/logger";
import { observeRequest } from "../observability/metrics";
import { emitRequestTraceSpan, startRequestTrace } from "../observability/tracing";
import type { AppVariables } from "../types/context";

export const requestContextMiddleware: MiddlewareHandler<{ Variables: AppVariables }> = async (
  c,
  next,
) => {
  const trace = startRequestTrace(c.req.header("x-trace-id"));
  const existing = c.get("requestContext");

  c.set("requestContext", {
    requestId: existing?.requestId ?? "unknown",
    traceId: trace.traceId,
    spanId: trace.spanId,
    requestStartTime: trace.requestStartTime,
    metricsStartTimeNs: process.hrtime.bigint(),
  });

  c.header("x-trace-id", trace.traceId);
  c.header("x-span-id", trace.spanId);

  await next();

  const context = c.get("requestContext");
  const durationSeconds =
    Number(process.hrtime.bigint() - context.metricsStartTimeNs) / 1_000_000_000;

  observeRequest({
    method: c.req.method,
    route: new URL(c.req.url).pathname,
    statusCode: c.res.status,
    durationSeconds,
  });

  logger.info(
    {
      requestId: context.requestId,
      traceId: context.traceId,
      spanId: context.spanId,
      method: c.req.method,
      path: new URL(c.req.url).pathname,
      statusCode: c.res.status,
      durationMs: Math.round(durationSeconds * 1000),
    },
    "Request completed",
  );

  emitRequestTraceSpan({
    requestId: context.requestId,
    traceId: context.traceId,
    spanId: context.spanId,
    method: c.req.method,
    path: new URL(c.req.url).pathname,
    statusCode: c.res.status,
    requestStartTime: context.requestStartTime,
  });
};
