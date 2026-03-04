import type { RequestHandler } from 'express';
import { NotFoundError } from '../errors/http-errors';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    new NotFoundError({
      detail: `Route not found: ${req.method} ${req.originalUrl}`,
    }),
  );
};
