import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { resetReadiness } from '../src/state/readiness';

describe('API routes', () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    resetReadiness();
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it('returns readiness endpoint in docs', async () => {
    app = await createApp();
    const instance = app;

    const response = await instance.inject({
      method: 'GET',
      url: '/openapi.json',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.paths['/ready']).toBeDefined();
    expect(body.paths['/metrics']).toBeDefined();
  });

  it('returns pong from /api/v1/ping', async () => {
    app = await createApp();
    const instance = app;

    const response = await instance.inject({
      method: 'GET',
      url: '/api/v1/ping',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      success: true,
      data: {
        message: 'pong',
        version: 'v1',
      },
    });
  });

  it('exposes OpenAPI docs endpoints', async () => {
    app = await createApp();
    const instance = app;

    const openApiResponse = await instance.inject({
      method: 'GET',
      url: '/openapi.json',
    });
    const docsResponse = await instance.inject({
      method: 'GET',
      url: '/docs',
    });

    expect(openApiResponse.statusCode).toBe(200);
    expect(openApiResponse.json().openapi).toBe('3.0.3');
    expect([200, 301, 302]).toContain(docsResponse.statusCode);
  });

  it('rate limits after threshold', async () => {
    app = await createApp();
    const instance = app;

    for (let i = 0; i < 100; i += 1) {
      const response = await instance.inject({
        method: 'GET',
        url: '/api/v1/ping',
      });
      expect(response.statusCode).toBe(200);
    }

    const blockedResponse = await instance.inject({
      method: 'GET',
      url: '/api/v1/ping',
    });

    expect(blockedResponse.statusCode).toBe(429);
    const body = blockedResponse.json();
    expect(body.title).toBe('Too Many Requests');
    expect(body.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(body.status).toBe(429);
    expect(body.type).toContain('/rate-limit-exceeded');
  });
});
