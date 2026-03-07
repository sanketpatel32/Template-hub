# DETAILS

## Architecture
- `config`: typed environment loading and OpenAPI config.
- `middleware`: request ID, request context, rate limit, not found, error normalization.
- `routes`: health/readiness/metrics/ping handlers.
- `errors`: typed errors and RFC7807 problem payloads.
- `observability`: tracing/log setup and Prometheus registry.
- `state`: readiness state and lifecycle state.

## Error contract
All failures return Problem Details JSON:
- `type`
- `title`
- `status`
- `detail`
- `instance`
- `traceId`

## Runtime hardening
- Readiness state for drain windows.
- Lifecycle helper (`server_lifecycle.rs`) for graceful stop orchestration.
- Rate-limit middleware and secure headers baseline.

## Tooling
- `cargo fmt --check`
- `cargo clippy -- -D warnings`
- `cargo test`
- Husky pre-commit hook running all checks.

## Docker
Build and run:
```bash
docker build -t actix-rust-backend .
docker run --rm -p 8080:8080 --env-file .env actix-rust-backend
```
