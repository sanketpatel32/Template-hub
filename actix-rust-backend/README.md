# actix-rust-backend

Production-grade Actix Web API template for Rust stable.

## Features
- Layered structure and typed env config
- RFC7807 problem details errors
- Request correlation (`requestId`, `traceId`, `spanId`)
- Health, readiness, metrics, ping, OpenAPI, Swagger docs
- Rate limiting, secure headers, CORS, compression
- Graceful lifecycle helpers and integration tests

## Quick start
```bash
cp .env.example .env
cargo run
```

## Endpoints
- `GET /health`
- `GET /ready`
- `GET /metrics`
- `GET /api/v1/ping`
- `GET /openapi.json`
- `GET /docs`

See [DETAILS.md](./DETAILS.md) for deep architecture notes.
