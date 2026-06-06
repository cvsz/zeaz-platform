# ztrader Platform Operations Makefile

.PHONY: help install-backend install-frontend dev-backend dev-frontend test-backend run-docker stop-docker format lint clean

help:
	@echo "Available commands:"
	@echo "  install-backend   - Install python backend dependencies in virtualenv"
	@echo "  install-frontend  - Install node packages for next.js frontend"
	@echo "  dev-backend       - Run FastAPI backend development server"
	@echo "  dev-frontend      - Run Next.js frontend development server"
	@echo "  test-backend      - Run backend unit tests with pytest"
	@echo "  run-docker        - Orchestrate all services using docker-compose"
	@echo "  stop-docker       - Stop and tear down docker-compose containers"
	@echo "  format            - Format Python files using ruff/black"
	@echo "  lint              - Lint Python code using ruff/flake8"
	@echo "  clean             - Clean python build cache and logs"

install-backend:
	pip install -r backend/requirements.txt

install-frontend:
	cd frontend && pnpm install

dev-backend:
	PYTHONPATH=backend/src uvicorn ztrader.main:app --reload --port 8000

dev-frontend:
	cd frontend && pnpm run dev

test-backend:
	PYTHONPATH=backend/src pytest backend/tests/ -v

run-docker:
	docker compose up --build -d

stop-docker:
	docker compose down

format:
	black backend/src/ backend/tests/

lint:
	ruff check backend/src/ backend/tests/

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -exec rm -rf {} +
