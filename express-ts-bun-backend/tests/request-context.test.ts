import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';

describe('request context', () => {
  it('propagates incoming x-request-id and emits trace headers', async () => {
    const app = createApp();
    const requestId = 'req-12345';

    const response = await request(app).get('/api/v1/ping').set('x-request-id', requestId);

    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBe(requestId);
    expect(response.headers['x-trace-id']).toBeDefined();
    expect(response.headers['x-span-id']).toBeDefined();
  });

  it('adds request and trace identifiers to error responses', async () => {
    const app = createApp();

    const response = await request(app).get('/route-does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.requestId).toBeDefined();
    expect(response.body.traceId).toBeDefined();
  });
});
