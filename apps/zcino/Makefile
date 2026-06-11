# zcino Go Backend Makefile

.PHONY: build test lint clean docker-up docker-down help

help:
	@echo "Available commands:"
	@echo "  make build       - Build all Go binaries"
	@echo "  make test        - Run unit tests"
	@echo "  make test-int    - Run integration tests (requires Docker)"
	@echo "  make lint        - Run golangci-lint"
	@echo "  make clean       - Clean build artifacts"
	@echo "  docker-up        - Start infra (Postgres, Redis, etc.)"
	@echo "  docker-build     - Build Docker images"
	@echo "  docker-down      - Stop infra"
	@echo ""
	@echo "Legacy PHP dev server: cd legacy/php && php -S 0.0.0.0:8000"

build:
	go build -trimpath -ldflags="-s -w" -o /tmp/zcino-api-gateway .
	go build -trimpath -ldflags="-s -w" -o /tmp/zcino-compliance ./cmd/compliance
	go build -trimpath -ldflags="-s -w" -o /tmp/zcino-analytics ./cmd/analytics
	go build -trimpath -ldflags="-s -w" -o /tmp/zcino-zeaznode ./cmd/zeaznode
	@echo "All binaries built to /tmp/zcino-*"

test:
	go test -vet=all -count=1 -race -shuffle=on ./...

test-int:
	go test -tags=integration -count=1 -v ./internal/repository/... ./internal/service/... ./internal/transport/... ./internal/handler/...

lint:
	golangci-lint run --timeout=5m ./...

clean:
	rm -f /tmp/zcino-*

docker-up:
	docker compose -f infra/docker-compose.yml up -d

docker-build:
	docker build -t zcino-api-gateway --target api-gateway .
	docker build -t zcino-compliance --target compliance .
	docker build -t zcino-analytics --target analytics .
	docker build -t zcino-zeaz-node --target zeaz-node .

docker-down:
	docker compose -f infra/docker-compose.yml down
