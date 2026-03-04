import type { FastifyInstance, onRequestHookHandler, onResponseHookHandler } from 'fastify';
import { emitRequestTraceSpan, startRequestTrace } from '../observability/tracing';

function getTraceIdHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

const onRequest: onRequestHookHandler = (request, reply, done) => {
  const traceContext = startRequestTrace(getTraceIdHeaderValue(request.headers['x-trace-id']));

  request.requestContext = {
    ...request.requestContext,
    traceId: traceContext.traceId,
    spanId: traceContext.spanId,
    requestStartTime: traceContext.requestStartTime,
  };

  reply.header('x-trace-id', traceContext.traceId);
  reply.header('x-span-id', traceContext.spanId);

  done();
};

const onResponse: onResponseHookHandler = (request, reply, done) => {
  const context = request.requestContext;

  emitRequestTraceSpan({
    requestId: context?.requestId ?? request.id,
    traceId: context?.traceId,
    spanId: context?.spanId,
    method: request.method,
    path: request.url,
    statusCode: reply.statusCode,
    requestStartTime: context?.requestStartTime,
  });

  done();
};

export function registerRequestContextHooks(app: FastifyInstance): void {
  app.addHook('onRequest', onRequest);
  app.addHook('onResponse', onResponse);
}
