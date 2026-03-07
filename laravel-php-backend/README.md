# laravel-php-backend

API-first Laravel-style PHP 8.3+ backend template with typed errors, request correlation, metrics, and docs.

## Quick start

```bash
cp .env.example .env
composer install
composer dev
```

## Core commands

- `composer dev` — run local dev server
- `composer start` — start server
- `composer test` — run template smoke tests
- `composer lint` — syntax lint
- `composer format` — formatting placeholder
- `composer analyze` — static-analysis placeholder

## Core endpoints

- `GET /health`
- `GET /ready`
- `GET /metrics`
- `GET /api/v1/ping`
- `GET /openapi.json`
- `GET /docs`

See [DETAILS.md](./DETAILS.md) for architecture and runtime behavior, and [AGENTS.md](./AGENTS.md) for contributor/agent workflow.
