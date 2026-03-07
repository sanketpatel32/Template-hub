import { randomUUID } from "node:crypto";
import type { MiddlewareHandler } from "hono";
import type { AppVariables } from "../types/context";

export const requestIdMiddleware: MiddlewareHandler<{ Variables: AppVariables }> = async (
  c,
  next,
) => {
  const headerValue = c.req.header("x-request-id");
  const requestId = headerValue || randomUUID();

  c.set("requestContext", {
    ...(c.get("requestContext") ?? {}),
    requestId,
  } as AppVariables["requestContext"]);

  c.header("x-request-id", requestId);

  await next();
};
