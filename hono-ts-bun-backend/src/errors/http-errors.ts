import { AppError } from "./app-error";

type HttpErrorOptions = {
  detail: string;
  errors?: unknown[];
  meta?: Record<string, unknown>;
  cause?: unknown;
};

export class ValidationError extends AppError {
  constructor(options: HttpErrorOptions) {
    super({
      status: 400,
      code: "VALIDATION_ERROR",
      title: "Bad Request",
      detail: options.detail,
      errors: options.errors,
      meta: options.meta,
      cause: options.cause,
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(options: HttpErrorOptions) {
    super({
      status: 401,
      code: "AUTHENTICATION_REQUIRED",
      title: "Unauthorized",
      detail: options.detail,
      errors: options.errors,
      meta: options.meta,
      cause: options.cause,
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(options: HttpErrorOptions) {
    super({
      status: 403,
      code: "FORBIDDEN",
      title: "Forbidden",
      detail: options.detail,
      errors: options.errors,
      meta: options.meta,
      cause: options.cause,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(options: HttpErrorOptions) {
    super({
      status: 404,
      code: "NOT_FOUND",
      title: "Not Found",
      detail: options.detail,
      errors: options.errors,
      meta: options.meta,
      cause: options.cause,
    });
  }
}

export class ConflictError extends AppError {
  constructor(options: HttpErrorOptions) {
    super({
      status: 409,
      code: "CONFLICT",
      title: "Conflict",
      detail: options.detail,
      errors: options.errors,
      meta: options.meta,
      cause: options.cause,
    });
  }
}

export class RateLimitExceededError extends AppError {
  constructor(options: HttpErrorOptions) {
    super({
      status: 429,
      code: "RATE_LIMIT_EXCEEDED",
      title: "Too Many Requests",
      detail: options.detail,
      errors: options.errors,
      meta: options.meta,
      cause: options.cause,
    });
  }
}

export class ExternalServiceError extends AppError {
  constructor(options: HttpErrorOptions) {
    super({
      status: 502,
      code: "EXTERNAL_SERVICE_ERROR",
      title: "Bad Gateway",
      detail: options.detail,
      errors: options.errors,
      meta: options.meta,
      cause: options.cause,
      isOperational: true,
    });
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(options: HttpErrorOptions) {
    super({
      status: 503,
      code: "SERVICE_UNAVAILABLE",
      title: "Service Unavailable",
      detail: options.detail,
      errors: options.errors,
      meta: options.meta,
      cause: options.cause,
      isOperational: true,
    });
  }
}

export class InternalServerError extends AppError {
  constructor(options: HttpErrorOptions) {
    super({
      status: 500,
      code: "INTERNAL_SERVER_ERROR",
      title: "Internal Server Error",
      detail: options.detail,
      errors: options.errors,
      meta: options.meta,
      cause: options.cause,
      isOperational: false,
    });
  }
}
