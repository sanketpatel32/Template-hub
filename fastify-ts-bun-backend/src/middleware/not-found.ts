import type { FastifyInstance } from 'fastify';
import { NotFoundError } from '../errors/http-errors';

export function setFastifyNotFoundHandler(app: FastifyInstance): void {
  app.setNotFoundHandler(async (request) => {
    throw new NotFoundError({
      detail: `Route not found: ${request.method} ${request.url}`,
    });
  });
}
