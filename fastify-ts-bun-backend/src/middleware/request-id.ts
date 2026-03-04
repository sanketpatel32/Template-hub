import type { onRequestHookHandler } from 'fastify';

export const requestIdHook: onRequestHookHandler = (request, reply, done) => {
  request.requestContext = {
    ...request.requestContext,
    requestId: request.id,
  };

  reply.header('x-request-id', request.id);
  done();
};
