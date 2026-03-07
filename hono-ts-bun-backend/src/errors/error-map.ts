import { ZodError } from "zod";
import { AppError } from "./app-error";
import { InternalServerError, RateLimitExceededError, ValidationError } from "./http-errors";

type GenericError = Error & {
  status?: number;
  statusCode?: number;
  code?: string;
};

export function mapToAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ValidationError({
      detail: "Request validation failed.",
      errors: error.issues,
      cause: error,
    });
  }

  if (error instanceof SyntaxError) {
    return new ValidationError({
      detail: "Malformed JSON body.",
      cause: error,
    });
  }

  if (error instanceof Error) {
    const candidate = error as GenericError;
    if (
      candidate.status === 429 ||
      candidate.statusCode === 429 ||
      candidate.code === "RATE_LIMIT"
    ) {
      return new RateLimitExceededError({
        detail: "Too many requests, please try again later.",
        cause: error,
      });
    }

    return new InternalServerError({
      detail: "Unexpected server error.",
      cause: error,
      meta: {
        originalErrorName: error.name,
      },
    });
  }

  return new InternalServerError({
    detail: "Unexpected server error.",
    meta: {
      unknownErrorType: typeof error,
    },
  });
}
