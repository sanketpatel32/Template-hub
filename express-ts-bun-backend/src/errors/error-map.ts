import { ZodError } from 'zod';
import { AppError } from './app-error';
import { InternalServerError, ValidationError } from './http-errors';

type JsonSyntaxError = SyntaxError & {
  status?: number;
  body?: unknown;
  type?: string;
};

function isMalformedJsonError(error: unknown): error is JsonSyntaxError {
  if (!(error instanceof SyntaxError)) {
    return false;
  }

  const candidate = error as JsonSyntaxError;
  return candidate.type === 'entity.parse.failed' || candidate.status === 400;
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
