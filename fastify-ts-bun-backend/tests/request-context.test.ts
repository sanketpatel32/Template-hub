import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';

describe('request context', () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it('propagates incoming x-request-id and emits trace headers', async () => {
    app = await createApp();
    const instance = app;
    const requestId = 'req-12345';

    const response = await instance.inject({
      method: 'GET',
      url: '/api/v1/ping',
      headers: {
        'x-request-id': requestId,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['x-request-id']).toBe(requestId);
    expect(response.headers['x-trace-id']).toBeDefined();
    expect(response.headers['x-span-id']).toBeDefined();
  });

  it('adds request and trace identifiers to error responses', async () => {
    app = await createApp();
    const instance = app;

    const response = await instance.inject({
      method: 'GET',
      url: '/route-does-not-exist',
    });

    expect(response.statusCode).toBe(404);
    const body = response.json();
    expect(body.requestId).toBeDefined();
    expect(body.traceId).toBeDefined();
  });
});
