# Flask Python Backend Template - Details

## Runtime
- Python `3.11+`
- Flask app with layered folders (`routes`, `middleware`, `errors`, `observability`, `state`)

## Environment Variables
Required runtime variables:
- `PORT`
- `NODE_ENV` (`development|test|production`)
- `CORS_ORIGIN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `LOG_LEVEL`
- `LOG_PRETTY`
- `TRUST_PROXY`
- `SHUTDOWN_TIMEOUT_MS`
- `METRICS_ENABLED`
- `TRACE_ENABLED`
- `FLASK_SECRET_KEY`

Validation is enforced through `pydantic-settings` in `src/config/env.py`.

## Request Flow
1. Request ID middleware (`x-request-id` propagation)
2. Request context middleware (`x-trace-id`, `x-span-id` generation)
3. Security headers
4. CORS headers
5. Compression (`gzip` when accepted)
6. Request logging
7. In-memory rate limiting
8. Route handling
9. Not-found normalization
10. Centralized RFC7807 error handler

## Error Contract
All failures return RFC7807-style payload with:
- `type`
- `title`
- `status`
- `detail`
- `instance`
- `code`
- `requestId`
- `traceId`
- `spanId`
- `errors`

Typed error classes:
- `AppError`
- `ValidationError`
- `AuthenticationError`
- `AuthorizationError`
- `NotFoundError`
- `ConflictError`
- `RateLimitExceededError`
- `ExternalServiceError`
- `ServiceUnavailableError`
- `InternalServerError`

## Observability
- Structured logging via `logging` + `python-json-logger`
- JSON logs in production, pretty logs in development
- Sensitive key redaction
- Prometheus metrics (`/metrics`) including process/default collectors and HTTP counters/histograms
- Trace span logs emitted when `TRACE_ENABLED=true`

## Lifecycle and Readiness
- Readiness state in `src/state/readiness.py`
- Lifecycle helper in `src/server_lifecycle.py`
- Shutdown path marks service as not ready and respects `SHUTDOWN_TIMEOUT_MS`

## API Docs
- OpenAPI JSON at `/openapi.json`
- Swagger UI at `/docs`

## Docker
Build and run:
```bash
docker build -t flask-python-backend .
docker run --rm -p 3000:3000 --env-file .env flask-python-backend
```

## Test Coverage
Tests validate:
- health/readiness success and shutdown behavior
- ping route
- metrics endpoint text output
- request/trace propagation
- RFC7807 responses for 404 and 500
- rate-limit 429 behavior
- openapi/docs availability
- error mapping
- lifecycle helper
