import type { INestApplication } from '@nestjs/common';
import type { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'NestJS Bun Template API',
    version: '1.0.0',
    description: 'Production-baseline NestJS starter with TypeScript and Bun runtime.',
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

export function setupSwagger(app: INestApplication): void {
  const expressApp = app.getHttpAdapter().getInstance() as Express;

  expressApp.get('/openapi.json', (_req: Request, res: Response) => {
    res.json(openApiDocument);
  });

  expressApp.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
}
