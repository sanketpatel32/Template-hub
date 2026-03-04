import type { FastifyInstance } from 'fastify';

export async function registerPingRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/v1/ping', async () => ({
    success: true,
    data: {
      message: 'pong',
      version: 'v1',
    },
  }));
}
