import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { toProblemDetails } from '../errors/app-error';
import { mapToAppError } from '../errors/error-map';

export function setFastifyErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    const appError = mapToAppError(error);
    const context = request.requestContext;
    const requestId = context?.requestId ?? request.id ?? randomUUID();

    request.requestContext = {
      ...context,
      requestId,
    };

    reply.header('x-request-id', requestId);

    const problem = toProblemDetails(appError, {
      instance: request.url,
      requestId,
      traceId: request.requestContext?.traceId,
    });

    if (appError.isOperational) {
      request.log.warn(
        {
          problem,
          meta: appError.meta,
        },
        'Operational request error',
      );
    } else {
      request.log.error(
        {
          err: error,
          problem,
          meta: appError.meta,
        },
        'Unhandled server error',
      );
    }

    void reply.code(appError.status).send(problem);
  });
}
