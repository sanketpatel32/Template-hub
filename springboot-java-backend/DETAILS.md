# DETAILS

## Architecture
- Layered structure with `routes`, `services`, `repositories`, `validators`, and shared modules.
- Typed environment config via `@ConfigurationProperties` (`EnvConfig`).
- Typed success and error contracts:
  - `SuccessResponse<T>` for successful requests.
  - RFC7807-like `ProblemDetails` for errors.

## Middleware / Filter order
1. `RequestIdFilter`
2. `RequestContextFilter` (trace/span + timing + request log)
3. security headers
4. CORS (via `WebConfig`)
5. compression (server setting)
6. request logging
7. `RateLimitFilter`
8. routes
9. not found mapping
10. `ErrorHandlingAdvice`

## Error model
`AppError` base class and concrete errors in `HttpErrors`:
- `ValidationError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ConflictError`,
  `RateLimitExceededError`, `ExternalServiceError`, `ServiceUnavailableError`, `InternalServerError`.

`ErrorMap` normalizes framework/runtime exceptions to these types.

## Observability
- Correlation fields: `requestId`, `traceId`, `spanId`.
- Request logs include path, status, duration.
- Production profile emits JSON logs; non-production uses readable logs.
- Redaction rule masks token/password/authorization-like fields.
- Prometheus-compatible metrics from `/metrics` using Micrometer.

## Runtime hardening
- `ReadinessState` drives `/ready` behavior.
- Graceful shutdown enabled (`server.shutdown=graceful`).
- App marks not-ready on shutdown (`@PreDestroy`).
- Startup event logs include env and major toggles.

## OpenAPI/docs
- OpenAPI JSON at `/openapi.json`.
- Docs redirect endpoint at `/docs` to Swagger UI.

## Testing coverage
- Health/readiness success and not-ready behavior.
- Ping response shape.
- Metrics text output.
- Unknown route 404 and internal 500 normalization.
- Rate limiting 429 behavior.
- Request ID and trace fields.
- OpenAPI/docs reachability.
- Lifecycle/readiness transition logic.
