import { randomUUID } from "node:crypto";
import type { ErrorHandler } from "hono";
import { toProblemDetails } from "../errors/app-error";
import { mapToAppError } from "../errors/error-map";
import { logger } from "../observability/logger";
import type { AppVariables } from "../types/context";

export const errorHandler: ErrorHandler<{ Variables: AppVariables }> = (error, c) => {
  const appError = mapToAppError(error);
  const context = c.get("requestContext");

  const requestId = context?.requestId ?? c.req.header("x-request-id") ?? randomUUID();
  const traceId = context?.traceId;

  const problem = toProblemDetails(appError, {
    instance: new URL(c.req.url).pathname,
    requestId,
    traceId,
  });

  c.header("x-request-id", requestId);

  if (appError.isOperational) {
    logger.warn({ problem, requestId, traceId, meta: appError.meta }, "Operational request error");
  } else {
    logger.error(
      { err: error, problem, requestId, traceId, meta: appError.meta },
      "Unhandled server error",
    );
  }

  return c.json(problem, appError.status);
};
