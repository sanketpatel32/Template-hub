# fiber-go-backend

Production-oriented Fiber API template for Go 1.23+.

## Features
- Layered project structure (`cmd`, `internal`, `tests`)
- Typed env config loading
- Structured logs with request/trace correlation
- RFC7807-style errors
- Health/readiness/metrics/docs/openapi endpoints
- Rate limiting, security headers, CORS, compression
- Graceful shutdown + readiness transitions
- Tests, linting, formatting, Docker, pre-commit hooks

## Quick start
```bash
cp .env.example .env
export $(cat .env | xargs)
go mod tidy
go run ./cmd/api
```

## Endpoints
- `GET /health`
- `GET /ready`
- `GET /metrics`
- `GET /api/v1/ping`
- `GET /openapi.json`
- `GET /docs`

See [DETAILS.md](./DETAILS.md) for architecture and operations.
