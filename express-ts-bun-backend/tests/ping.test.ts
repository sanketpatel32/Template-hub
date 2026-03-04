import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { resetReadiness } from '../src/state/readiness';

describe('API routes', () => {
  it('returns readiness endpoint in docs', async () => {
    const app = createApp();
    resetReadiness();

    const response = await request(app).get('/openapi.json');

    expect(response.status).toBe(200);
    expect(response.body.paths['/ready']).toBeDefined();
    expect(response.body.paths['/metrics']).toBeDefined();
  });

  it('returns pong from /api/v1/ping', async () => {
    const app = createApp();

    const response = await request(app).get('/api/v1/ping');

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
    const app = createApp();

    const openApiResponse = await request(app).get('/openapi.json');
    const docsResponse = await request(app).get('/docs');

    expect(openApiResponse.status).toBe(200);
    expect(openApiResponse.body.openapi).toBe('3.0.3');
    expect(docsResponse.status).toBe(301);
  });

  it('rate limits after threshold', async () => {
    const app = createApp();

    for (let i = 0; i < 100; i += 1) {
      const response = await request(app).get('/api/v1/ping');
      expect(response.status).toBe(200);
    }

    const blockedResponse = await request(app).get('/api/v1/ping');

    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.body.title).toBe('Too Many Requests');
    expect(blockedResponse.body.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(blockedResponse.body.status).toBe(429);
    expect(blockedResponse.body.type).toContain('/rate-limit-exceeded');
  });
});
