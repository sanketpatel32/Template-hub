import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Fastify Bun Template API',
    version: '1.0.0',
    description: 'Production-baseline Fastify starter with TypeScript and Bun runtime.',
  },
  paths: {
    '/health': {
      get: {
        summary: 'Service health check',
        responses: {
          '200': {
            description: 'Service is healthy',
          },
        },
      },
    },
    '/ready': {
      get: {
        summary: 'Service readiness check',
        responses: {
          '200': {
            description: 'Service is ready',
          },
          '503': {
            description: 'Service is shutting down',
          },
        },
      },
    },
    '/metrics': {
      get: {
        summary: 'Prometheus metrics endpoint',
        responses: {
          '200': {
            description: 'Prometheus metrics payload',
          },
        },
      },
    },
    '/api/v1/ping': {
      get: {
        summary: 'Ping endpoint',
        responses: {
          '200': {
            description: 'Pong response',
          },
        },
      },
    },
  },
} as const;

export async function setupSwagger(app: FastifyInstance): Promise<void> {
  await app.register(swagger, {
    openapi: openApiDocument,
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
  });

  app.get('/openapi.json', async (_request, reply) => {
    reply.send(app.swagger());
  });
}
