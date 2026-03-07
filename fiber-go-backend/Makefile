.PHONY: fmt lint test run

fmt:
	gofmt -w $(shell find . -name '*.go')

lint:
	golangci-lint run ./...

test:
	go test ./...

run:
	go run ./cmd/api
