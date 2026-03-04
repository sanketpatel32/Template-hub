import { HttpException } from '@nestjs/common';
import { ZodError } from 'zod';
import { AppError } from './app-error';
import {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  ExternalServiceError,
  InternalServerError,
  NotFoundError,
  RateLimitExceededError,
  ServiceUnavailableError,
  ValidationError,
} from './http-errors';

type JsonSyntaxError = SyntaxError & {
  status?: number;
  body?: unknown;
  type?: string;
};

type MapToAppErrorContext = {
  method?: string;
  path?: string;
};

type HttpExceptionResponse =
  | string
  | {
      message?: string | string[];
      error?: string;
    };

function isMalformedJsonError(error: unknown): error is JsonSyntaxError {
  if (!(error instanceof SyntaxError)) {
    return false;
  }

  const candidate = error as JsonSyntaxError;
  return candidate.type === 'entity.parse.failed' || candidate.status === 400;
}

function getHttpExceptionDetail(error: HttpException): string {
  const response = error.getResponse() as HttpExceptionResponse;

  if (typeof response === 'string' && response.trim().length > 0) {
    return response;
  }

  if (response && typeof response === 'object') {
    if (Array.isArray(response.message) && response.message.length > 0) {
      return response.message.join(', ');
    }

    if (typeof response.message === 'string' && response.message.trim().length > 0) {
      return response.message;
    }

    if (typeof response.error === 'string' && response.error.trim().length > 0) {
      return response.error;
    }
  }

  return error.message || 'Request failed.';
}

function mapHttpException(error: HttpException, context?: MapToAppErrorContext): AppError {
  const status = error.getStatus();
  const detail = getHttpExceptionDetail(error);

  switch (status) {
    case 400:
      return new ValidationError({
        detail,
        cause: error,
      });
    case 401:
      return new AuthenticationError({
        detail,
        cause: error,
      });
    case 403:
      return new AuthorizationError({
        detail,
        cause: error,
      });
    case 404:
      return new NotFoundError({
        detail:
          context?.method && context.path
            ? `Route not found: ${context.method} ${context.path}`
            : detail,
        cause: error,
      });
    case 409:
      return new ConflictError({
        detail,
        cause: error,
      });
    case 429:
      return new RateLimitExceededError({
        detail,
        cause: error,
      });
    case 502:
      return new ExternalServiceError({
        detail,
        cause: error,
      });
    case 503:
      return new ServiceUnavailableError({
        detail,
        cause: error,
      });
    default:
      if (status >= 500) {
        return new InternalServerError({
          detail: 'Unexpected server error.',
          cause: error,
          meta: {
            originalErrorName: error.name,
          },
        });
      }

      return new ValidationError({
        detail,
        cause: error,
      });
  }
}

export function mapToAppError(error: unknown, context?: MapToAppErrorContext): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ValidationError({
      detail: 'Request validation failed.',
      errors: error.issues,
      cause: error,
    });
  }

  if (error instanceof HttpException) {
    return mapHttpException(error, context);
  }

  if (isMalformedJsonError(error)) {
    return new ValidationError({
      detail: 'Malformed JSON body.',
      cause: error,
    });
  }

  if (error instanceof Error) {
    return new InternalServerError({
      detail: 'Unexpected server error.',
      cause: error,
      meta: {
        originalErrorName: error.name,
      },
    });
  }

  return new InternalServerError({
    detail: 'Unexpected server error.',
    meta: {
      unknownErrorType: typeof error,
    },
  });
}
