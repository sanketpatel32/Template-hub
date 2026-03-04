import { randomUUID } from 'node:crypto';
import { type ArgumentsHost, Catch, type ExceptionFilter } from '@nestjs/common';
import type { ErrorRequestHandler, Request, Response } from 'express';
import { toProblemDetails } from '../errors/app-error';
import { mapToAppError } from '../errors/error-map';
import { logger } from '../observability/logger';
import type { RequestContextLocals } from '../types/context';

function resolveRequestId(req: Request, res: Response): string {
  const context = res.locals as RequestContextLocals;
  const requestIdHeader = req.header('x-request-id');

  if (context.requestId) {
    return context.requestId;
  }

  if (Array.isArray(requestIdHeader)) {
    return requestIdHeader[0] ?? randomUUID();
  }

  return requestIdHeader ?? randomUUID();
}

function writeErrorResponse(error: unknown, req: Request, res: Response): void {
  const appError = mapToAppError(error, {
    method: req.method,
    path: req.originalUrl || req.url,
  });

  const context = res.locals as RequestContextLocals;
  const requestId = resolveRequestId(req, res);
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
        err: error,
        problem,
        meta: appError.meta,
      },
      'Unhandled server error',
    );
  }

  res.status(appError.status).json(problem);
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  writeErrorResponse(err, req, res);
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    if (!req || !res || res.headersSent) {
      return;
    }

    writeErrorResponse(exception, req, res);
  }
}
