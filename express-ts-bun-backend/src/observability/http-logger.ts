import type { Request, Response } from 'express';
import pinoHttp from 'pino-http';
import { env } from '../config/env';
import type { RequestContextLocals } from '../types/context';
import { logger } from './logger';

function getContext(res: Response): RequestContextLocals {
  return res.locals as RequestContextLocals;
}

function getRequestId(req: Request, res: Response): string {
  const context = getContext(res);
  const headerValue = req.headers['x-request-id'];

  if (context.requestId) {
    return context.requestId;
  }

  if (Array.isArray(headerValue)) {
    return headerValue[0] ?? 'unknown-request-id';
  }

  return headerValue ?? 'unknown-request-id';
}

export const httpLoggerMiddleware = pinoHttp({
  logger,
  autoLogging: env.NODE_ENV !== 'test',
  genReqId: getRequestId,
  customLogLevel: (_req, res, error) => {
    if (env.NODE_ENV === 'test') {
      return 'silent';
    }

    if (error || res.statusCode >= 500) {
      return 'error';
    }

    if (res.statusCode >= 400) {
      return 'warn';
    }

    return 'info';
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      remoteAddress: req.socket?.remoteAddress,
      remotePort: req.socket?.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  customProps: (_req, res) => {
    const context = getContext(res);
    return {
      requestId: context.requestId,
      traceId: context.traceId,
      spanId: context.spanId,
    };
  },
});
