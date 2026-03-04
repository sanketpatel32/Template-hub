import pino from 'pino';
import { env } from '../config/env';

const redactionPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  '*.password',
  '*.token',
  '*.secret',
];

export const fastifyLoggerOptions = {
  level: env.LOG_LEVEL,
  redact: {
    paths: redactionPaths,
    remove: true,
  },
  base: {
    service: 'fastify-ts-bun-backend',
    environment: env.NODE_ENV,
  },
  transport:
    env.LOG_PRETTY && env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
} as const;

export const logger = pino(fastifyLoggerOptions);

export function createChildLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
