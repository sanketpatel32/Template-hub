import { ZodError } from 'zod';
import { AppError } from './app-error';
import { InternalServerError, RateLimitExceededError, ValidationError } from './http-errors';

type FastifyJsonError = Error & {
  statusCode?: number;
  code?: string;
};

function isMalformedJsonError(error: unknown): error is FastifyJsonError {
  if (!(error instanceof Error)) {
    return false;
  }

  const candidate = error as FastifyJsonError;
  return candidate.code === 'FST_ERR_CTP_INVALID_JSON_BODY' || candidate.statusCode === 400;
}

function isFastifyRateLimitError(error: unknown): error is FastifyJsonError {
  if (!(error instanceof Error)) {
    return false;
  }

  const candidate = error as FastifyJsonError;
  return candidate.statusCode === 429 || candidate.code === 'FST_ERR_RATE_LIMIT';
}

export function mapToAppError(error: unknown): AppError {
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

  if (isMalformedJsonError(error)) {
    return new ValidationError({
      detail: 'Malformed JSON body.',
      cause: error,
    });
  }

  if (isFastifyRateLimitError(error)) {
    return new RateLimitExceededError({
      detail: 'Too many requests, please try again later.',
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
