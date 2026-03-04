import type { RequestHandler } from 'express';
import { emitRequestTraceSpan, startRequestTrace } from '../observability/tracing';
import type { RequestContextLocals } from '../types/context';

function getTraceIdHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export const requestContextMiddleware: RequestHandler = (req, res, next) => {
  const context = res.locals as RequestContextLocals;
  const traceContext = startRequestTrace(getTraceIdHeaderValue(req.headers['x-trace-id']));

  context.traceId = traceContext.traceId;
  context.spanId = traceContext.spanId;
  context.requestStartTime = traceContext.requestStartTime;

  res.setHeader('x-trace-id', traceContext.traceId);
  res.setHeader('x-span-id', traceContext.spanId);

  res.on('finish', () => {
    emitRequestTraceSpan({
      requestId: context.requestId,
      traceId: context.traceId,
      spanId: context.spanId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      requestStartTime: context.requestStartTime,
    });
  });

  next();
};
