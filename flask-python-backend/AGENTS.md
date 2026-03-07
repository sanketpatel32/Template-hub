# AGENTS.md

This template provides a production-ready Flask API baseline. Start in [`README.md`](./README.md) for setup and commands, then use [`DETAILS.md`](./DETAILS.md) for architecture and runtime behavior.

## Agent Workflow
1. Keep all implementation self-contained in this folder.
2. Maintain layered structure (`routes`, `middleware`, `errors`, `observability`, etc.).
3. Preserve RFC7807 error contract and success contract.
4. Update tests for all behavior changes.
5. Run `ruff check .`, `mypy src tests`, and `pytest` before commit.
