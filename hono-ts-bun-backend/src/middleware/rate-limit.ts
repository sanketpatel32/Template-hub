import type { MiddlewareHandler } from "hono";
import { env } from "../config/env";
import { RateLimitExceededError } from "../errors/http-errors";

type CounterState = {
  count: number;
  resetAt: number;
};

const requestBuckets = new Map<string, CounterState>();

function clientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "global";
}

export const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const key = clientKey(c.req.raw);
  const now = Date.now();
  const bucket = requestBuckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    requestBuckets.set(key, {
      count: 1,
      resetAt: now + env.RATE_LIMIT_WINDOW_MS,
    });
  } else {
    bucket.count += 1;
    if (bucket.count > env.RATE_LIMIT_MAX) {
      throw new RateLimitExceededError({
        detail: "Too many requests, please try again later.",
      });
    }
  }

  await next();
};

export function resetRateLimitState(): void {
  requestBuckets.clear();
}
