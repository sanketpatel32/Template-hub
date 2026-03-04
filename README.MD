# Backend Templates Hub

Production-ready backend starter templates that are self-contained and easy to extend.

[![Templates Hub](https://img.shields.io/badge/Templates-Hub-1f6feb?style=for-the-badge&logo=github)](#backend-templates-hub)
[![License: MIT](https://img.shields.io/badge/License-MIT-2ea043?style=for-the-badge&logo=open-source-initiative&logoColor=white)](./LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-orange?style=for-the-badge&logo=git&logoColor=white)](./CONTRIBUTING.md)

## What This Repository Is

This repository is a collection of backend templates, not a single app.
Each template lives in its own folder and includes its own runtime scripts, environment setup, and documentation.

## Current Templates

| Template | Primary Stack | Status | Path |
|---|---|---|---|
| `express-ts-bun-backend` | Express 5 + TypeScript + Bun | Active | [`./express-ts-bun-backend`](./express-ts-bun-backend) |
| `fastapi-python-backend` | FastAPI + Python | Active | [`./fastapi-python-backend`](./fastapi-python-backend) |
| `fastify-ts-bun-backend` | Fastify 5 + TypeScript + Bun | Active | [`./fastify-ts-bun-backend`](./fastify-ts-bun-backend) |
| `nest-ts-bun-backend` | NestJS 11 + TypeScript + Bun | Active | [`./nest-ts-bun-backend`](./nest-ts-bun-backend) |


More templates can be added over time without changing this root structure.

## Quick Start (Generic)

1. Choose a template folder from the catalog.
2. Open that template's `README.md`.
3. Run that template's install and start commands.

Example (Express template):

```bash
cd express-ts-bun-backend
bun install
cp .env.example .env
bun run dev
```

## Contribution

- Open an issue/discussion first for major additions or structural changes.
- Add or update a self-contained template folder.
- Update the template catalog table in this root `README.md`.
- Open a pull request with a concise summary and verification notes.

Details:
- Contribution guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Community standards: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

## License

Distributed under the MIT License. See [LICENSE](./LICENSE).
