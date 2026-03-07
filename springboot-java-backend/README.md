# springboot-java-backend

Production-ready Spring Boot (Java 21+) API template with typed config, structured logging, request correlation, RFC7807 errors, metrics, and Docker.

## Endpoints
- `GET /health`
- `GET /ready`
- `GET /metrics`
- `GET /api/v1/ping`
- `GET /openapi.json`
- `GET /docs`

## Commands
- Dev: `./gradlew bootRun` (or `gradle bootRun`)
- Start: `java -jar build/libs/springboot-java-backend-0.1.0.jar`
- Test: `./gradlew test`
- Lint/format: `./gradlew spotlessCheck` / `./gradlew spotlessApply`
- Build: `./gradlew clean build`

## Environment
Copy `.env.example` and set:
`PORT`, `APP_ENV`, `CORS_ORIGIN`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `LOG_LEVEL`, `LOG_PRETTY`, `TRUST_PROXY`, `SHUTDOWN_TIMEOUT_MS`, `METRICS_ENABLED`, `TRACE_ENABLED`.

## More docs
See [DETAILS.md](./DETAILS.md) for architecture, middleware flow, observability, and testing details.
