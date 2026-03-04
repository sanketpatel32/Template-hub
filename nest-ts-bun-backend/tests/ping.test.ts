import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { resetReadiness } from '../src/state/readiness';

describe('API routes', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    resetReadiness();
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it('returns readiness endpoint in docs', async () => {
    app = await createApp();

    const response = await request(app.getHttpServer()).get('/openapi.json');

    expect(response.status).toBe(200);
    expect(response.body.paths['/ready']).toBeDefined();
    expect(response.body.paths['/metrics']).toBeDefined();
  });

  it('returns pong from /api/v1/ping', async () => {
    app = await createApp();

    const response = await request(app.getHttpServer()).get('/api/v1/ping');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        message: 'pong',
        version: 'v1',
      },
    });
  });

  it('exposes OpenAPI docs endpoints', async () => {
    app = await createApp();

    const openApiResponse = await request(app.getHttpServer()).get('/openapi.json');
    const docsResponse = await request(app.getHttpServer()).get('/docs');

    expect(openApiResponse.status).toBe(200);
    expect(openApiResponse.body.openapi).toBe('3.0.3');
    expect([200, 301, 302]).toContain(docsResponse.status);
  });

  it('rate limits after threshold', async () => {
    app = await createApp();

    for (let i = 0; i < 100; i += 1) {
      const response = await request(app.getHttpServer()).get('/api/v1/ping');
      expect(response.status).toBe(200);
    }

    const blockedResponse = await request(app.getHttpServer()).get('/api/v1/ping');

    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.body.title).toBe('Too Many Requests');
    expect(blockedResponse.body.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(blockedResponse.body.status).toBe(429);
    expect(blockedResponse.body.type).toContain('/rate-limit-exceeded');
  });
});
