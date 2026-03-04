import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { toProblemDetails } from '../errors/app-error';
import { RateLimitExceededError } from '../errors/http-errors';
import type { RequestContextLocals } from '../types/context';

export function createRateLimiter() {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    validate: {
      trustProxy: false,
    },
    handler: (req, res) => {
      const context = res.locals as RequestContextLocals;
      const rateLimitError = new RateLimitExceededError({
        detail: 'Too many requests, please try again later.',
      });

      res.status(rateLimitError.status).json(
        toProblemDetails(rateLimitError, {
          instance: req.originalUrl,
          requestId: context.requestId,
          traceId: context.traceId,
        }),
      );
    },
  });
}
