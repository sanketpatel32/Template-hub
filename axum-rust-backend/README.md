# axum-rust-backend

Production-grade Axum API template for Rust stable.

## Features
- Layered architecture (`config`, `middleware`, `routes`, `errors`, `observability`, `state`, `types`)
- Typed env/config loading
- Structured logging + request correlation (`requestId`, `traceId`, `spanId`)
- RFC7807-style typed problem details
- Health/readiness/metrics/ping/OpenAPI/docs endpoints
- Rate limiting, security headers, CORS, compression
- Graceful shutdown lifecycle helpers
- Integration + lifecycle tests
- Docker support
- Pre-commit hook baseline

## Quick start
```bash
cp .env.example .env
cargo fmt
cargo clippy --all-targets --all-features -- -D warnings
cargo test
cargo run
```

## Endpoints
- `GET /health`
- `GET /ready`
- `GET /metrics`
- `GET /api/v1/ping`
- `GET /openapi.json`
- `GET /docs`

See `DETAILS.md` for full implementation guidance.
