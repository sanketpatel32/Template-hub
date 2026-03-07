package com.example.template.errors;

public final class HttpErrors {
  private HttpErrors() {}

  public static class ValidationError extends AppError {
    public ValidationError(String message) {
      super("VALIDATION_ERROR", 400, "https://example.com/errors/validation", message);
    }
  }

  public static class AuthenticationError extends AppError {
    public AuthenticationError(String message) {
      super("AUTHENTICATION_ERROR", 401, "https://example.com/errors/authentication", message);
    }
  }

  public static class AuthorizationError extends AppError {
    public AuthorizationError(String message) {
      super("AUTHORIZATION_ERROR", 403, "https://example.com/errors/authorization", message);
    }
  }

  public static class NotFoundError extends AppError {
    public NotFoundError(String message) {
      super("NOT_FOUND", 404, "https://example.com/errors/not-found", message);
    }
  }

  public static class ConflictError extends AppError {
    public ConflictError(String message) {
      super("CONFLICT", 409, "https://example.com/errors/conflict", message);
    }
  }

  public static class RateLimitExceededError extends AppError {
    public RateLimitExceededError(String message) {
      super("RATE_LIMIT_EXCEEDED", 429, "https://example.com/errors/rate-limit", message);
    }
  }

  public static class ExternalServiceError extends AppError {
    public ExternalServiceError(String message) {
      super("EXTERNAL_SERVICE_ERROR", 502, "https://example.com/errors/external-service", message);
    }
  }

  public static class ServiceUnavailableError extends AppError {
    public ServiceUnavailableError(String message) {
      super("SERVICE_UNAVAILABLE", 503, "https://example.com/errors/service-unavailable", message);
    }
  }

  public static class InternalServerError extends AppError {
    public InternalServerError(String message) {
      super("INTERNAL_SERVER_ERROR", 500, "https://example.com/errors/internal", message);
    }
  }
}
