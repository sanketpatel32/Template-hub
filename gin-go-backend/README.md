# gin-go-backend

Production-ready Gin API template for Go 1.23+.

## Features
- Layered `internal/` architecture
- Typed env config loading
- Structured logging with request/trace/span correlation
- RFC7807-style error responses
- Health/readiness/metrics/ping endpoints
- OpenAPI JSON + Swagger UI docs
- Prometheus metrics and rate limiting
- Graceful shutdown and readiness state handling
- Tests, gofmt, golangci-lint-ready, Husky pre-commit, Dockerfile

## Quick Start
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

## Quality Checks
```bash
gofmt -w $(find . -name '*.go')
go test ./...
golangci-lint run ./...
```

See `DETAILS.md` for architecture, request flow, error model, and operations guidance.
