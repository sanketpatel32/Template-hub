import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { setFastifyErrorHandler } from '../src/middleware/error-handler';
import { setFastifyNotFoundHandler } from '../src/middleware/not-found';

describe('error handling', () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it('returns 404 for unknown routes', async () => {
    app = Fastify({ logger: false });
    setFastifyNotFoundHandler(app);
    setFastifyErrorHandler(app);

    const response = await app.inject({
      method: 'GET',
      url: '/missing',
    });

    expect(response.statusCode).toBe(404);
    const body = response.json();
    expect(body.status).toBe(404);
    expect(body.code).toBe('NOT_FOUND');
    expect(body.title).toBe('Not Found');
    expect(body.type).toContain('/not-found');
    expect(body.requestId).toBeDefined();
  });

  it('returns normalized 500 payload', async () => {
    app = Fastify({ logger: false });

    app.get('/boom', async () => {
      throw new Error('boom');
    });

    setFastifyErrorHandler(app);

    const response = await app.inject({
      method: 'GET',
      url: '/boom',
    });

    expect(response.statusCode).toBe(500);
    const body = response.json();
    expect(body.status).toBe(500);
    expect(body.code).toBe('INTERNAL_SERVER_ERROR');
    expect(body.detail).toBe('Unexpected server error.');
    expect(body.title).toBe('Internal Server Error');
    expect(body.requestId).toBeDefined();
  });
});
