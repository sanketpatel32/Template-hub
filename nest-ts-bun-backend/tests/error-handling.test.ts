import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { errorHandler } from '../src/middleware/error-handler';
import { notFoundHandler } from '../src/middleware/not-found';

describe('error handling', () => {
  it('returns 404 for unknown routes', async () => {
    const app = express();
    app.use(notFoundHandler);
    app.use(errorHandler);

    const response = await request(app).get('/missing');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe(404);
    expect(response.body.code).toBe('NOT_FOUND');
    expect(response.body.title).toBe('Not Found');
    expect(response.body.type).toContain('/not-found');
    expect(response.body.requestId).toBeDefined();
  });

  it('returns normalized 500 payload', async () => {
    const app = express();

    app.get('/boom', () => {
      throw new Error('boom');
    });

    app.use(errorHandler);

    const response = await request(app).get('/boom');

    expect(response.status).toBe(500);
    expect(response.body.status).toBe(500);
    expect(response.body.code).toBe('INTERNAL_SERVER_ERROR');
    expect(response.body.detail).toBe('Unexpected server error.');
    expect(response.body.title).toBe('Internal Server Error');
    expect(response.body.requestId).toBeDefined();
  });
});
