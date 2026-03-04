import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { env } from './config/env';
import { setupSwagger } from './config/swagger';
import { errorHandler, GlobalExceptionFilter } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';
import { createRateLimiter } from './middleware/rate-limit';
import { requestContextMiddleware } from './middleware/request-context';
import { requestIdMiddleware } from './middleware/request-id';
import { httpLoggerMiddleware } from './observability/http-logger';
import { metricsMiddleware } from './observability/metrics';

function resolveCorsOrigins(value: string): string[] | true {
  if (value.trim() === '*') {
    return true;
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return origins.length > 0 ? origins : true;
}

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: false,
  });

  const httpAdapter = app.getHttpAdapter();
  const expressApp = httpAdapter.getInstance();
  const allowedOrigins = resolveCorsOrigins(env.CORS_ORIGIN);

  expressApp.disable('x-powered-by');
  expressApp.set('trust proxy', env.TRUST_PROXY);

  app.use(requestIdMiddleware);
  app.use(requestContextMiddleware);
  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins,
    }),
  );
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(httpLoggerMiddleware);
  app.use(metricsMiddleware);
  app.use(createRateLimiter());

  app.useGlobalFilters(new GlobalExceptionFilter());
  setupSwagger(app);

  await app.init();

  if (typeof httpAdapter.setNotFoundHandler === 'function') {
    httpAdapter.setNotFoundHandler(notFoundHandler as never);
  }

  if (typeof httpAdapter.setErrorHandler === 'function') {
    httpAdapter.setErrorHandler(errorHandler as never);
  }

  return app;
}
