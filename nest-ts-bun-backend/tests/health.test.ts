import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { markShuttingDown, resetReadiness } from '../src/state/readiness';

describe('health and readiness routes', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    resetReadiness();
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it('returns service liveness payload', async () => {
    app = await createApp();

    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.environment).toBeDefined();
  });

  it('returns ready state when server is available', async () => {
    app = await createApp();

    const response = await request(app.getHttpServer()).get('/ready');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.ready).toBe(true);
  });

  it('returns 503 problem details when shutting down', async () => {
    app = await createApp();
    markShuttingDown();

    const response = await request(app.getHttpServer()).get('/ready');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe(503);
    expect(response.body.code).toBe('SERVICE_UNAVAILABLE');
    expect(response.body.type).toContain('/service-unavailable');
  });
});
