import { randomUUID } from 'node:crypto';
import type { ErrorRequestHandler } from 'express';
import { toProblemDetails } from '../errors/app-error';
import { mapToAppError } from '../errors/error-map';
import { logger } from '../observability/logger';
import type { RequestContextLocals } from '../types/context';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const appError = mapToAppError(err);
  const context = res.locals as RequestContextLocals;
  const requestIdHeader = req.header('x-request-id');
  const requestId = context.requestId ?? requestIdHeader ?? randomUUID();
  context.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  const requestLogger = req.log ?? logger;
  const problem = toProblemDetails(appError, {
    instance: req.originalUrl || req.url,
    requestId,
    traceId: context.traceId,
  });

  if (appError.isOperational) {
    requestLogger.warn(
      {
        problem,
        meta: appError.meta,
      },
      'Operational request error',
    );
  } else {
    requestLogger.error(
      {
        err,
        problem,
        meta: appError.meta,
      },
      'Unhandled server error',
    );
  }

  res.status(appError.status).json(problem);
};
