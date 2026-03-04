import type { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Express Bun Template API',
    version: '1.0.0',
    description: 'Production-baseline Express starter with TypeScript and Bun runtime.',
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

export function setupSwagger(app: Express): void {
  app.get('/openapi.json', (_req: Request, res: Response) => {
    res.json(openApiDocument);
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
}
