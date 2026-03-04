import type { onResponseHookHandler } from 'fastify';
import { env } from '../config/env';

export const httpLoggerOnResponseHook: onResponseHookHandler = (request, reply, done) => {
  if (env.NODE_ENV === 'test') {
    done();
    return;
  }

  const statusCode = reply.statusCode;
  const context = request.requestContext;
  const payload = {
    method: request.method,
    path: request.url,
    statusCode,
    requestId: context?.requestId ?? request.id,
    traceId: context?.traceId,
    spanId: context?.spanId,
    responseTimeMs: reply.elapsedTime,
  };

  if (statusCode >= 500) {
    request.log.error(payload, 'HTTP request completed');
    done();
    return;
  }

  if (statusCode >= 400) {
    request.log.warn(payload, 'HTTP request completed');
    done();
    return;
  }

  request.log.info(payload, 'HTTP request completed');
  done();
};
