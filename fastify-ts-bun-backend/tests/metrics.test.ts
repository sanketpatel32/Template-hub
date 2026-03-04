import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';

describe('GET /metrics', () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it('returns Prometheus metrics payload', async () => {
    app = await createApp();
    const instance = app;

    const response = await instance.inject({
      method: 'GET',
      url: '/metrics',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.body).toContain('http_requests_total');
    expect(response.body).toContain('http_request_duration_seconds');
  });
});
