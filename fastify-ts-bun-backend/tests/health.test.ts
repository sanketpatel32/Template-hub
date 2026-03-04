import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { markShuttingDown, resetReadiness } from '../src/state/readiness';

describe('health and readiness routes', () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    resetReadiness();
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it('returns service liveness payload', async () => {
    app = await createApp();
    const instance = app;

    const response = await instance.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ok');
    expect(body.data.environment).toBeDefined();
  });

  it('returns ready state when server is available', async () => {
    app = await createApp();
    const instance = app;

    const response = await instance.inject({
      method: 'GET',
      url: '/ready',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.ready).toBe(true);
  });

  it('returns 503 problem details when shutting down', async () => {
    app = await createApp();
    const instance = app;
    markShuttingDown();

    const response = await instance.inject({
      method: 'GET',
      url: '/ready',
    });

    expect(response.statusCode).toBe(503);
    const body = response.json();
    expect(body.status).toBe(503);
    expect(body.code).toBe('SERVICE_UNAVAILABLE');
    expect(body.type).toContain('/service-unavailable');
  });
});
