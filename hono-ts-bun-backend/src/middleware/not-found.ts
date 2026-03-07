import type { NotFoundHandler } from "hono";
import { NotFoundError } from "../errors/http-errors";
import type { AppVariables } from "../types/context";

export const notFoundHandler: NotFoundHandler<{ Variables: AppVariables }> = (c) => {
  throw new NotFoundError({
    detail: `Route not found: ${c.req.method} ${new URL(c.req.url).pathname}`,
  });
};
