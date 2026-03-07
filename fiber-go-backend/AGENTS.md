# AGENTS

## Purpose
Operational guidance for agents modifying this template.

## Rules
- Keep template self-contained under `fiber-go-backend`.
- Preserve middleware and error architecture.
- New endpoints must return typed success or RFC7807 error payloads.
- Add/adjust tests for behavior changes.
- Keep README concise and DETAILS deep.

## Validation checklist
1. `gofmt -w $(find . -name '*.go')`
2. `go test ./...`
3. `golangci-lint run ./...`
4. `docker build -t fiber-go-backend .`
