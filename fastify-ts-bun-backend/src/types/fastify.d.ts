import type { RequestContext } from './context';

declare module 'fastify' {
  interface FastifyRequest {
    requestContext?: RequestContext;
  }
}
