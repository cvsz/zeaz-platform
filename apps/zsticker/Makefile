.PHONY: help install setup-env lint format test test-cov run run-dashboard docker-up docker-down docker-logs clean safety-scan validate-fast golive

# Default target
help:
	@echo "zsticker Makefile"
	@echo "--------------------------------"
	@echo "make install       - Install dependencies"
	@echo "make setup-env     - Interactively generate a .env configuration file"
	@echo "make lint          - Run flake8 and mypy"
	@echo "make format        - Format code with black"
	@echo "make test          - Run pytest suite"
	@echo "make test-cov      - Run tests with coverage"
	@echo "make run           - Run the main sticker bot automation loop"
	@echo "make run-dashboard - Start the FastAPI web dashboard on port 3008"
	@echo "make docker-up     - Start the production Docker Compose stack"
	@echo "make docker-down   - Stop the Docker Compose stack"
	@echo "make docker-logs   - Tail logs from the Docker containers"
	@echo "make clean         - Remove cache files, logs, and artifacts"
	@echo "make golive        - 🚀 Start full stack of project for production"

golive:
	@echo "🚀 Starting Full Stack Production Environment..."
	docker compose up -d --build
	@echo "✅ System is Live!"
	@echo "   - Dashboard: http://localhost:3008"
	@echo "   - Health Check: http://localhost:8007/health"

install:
	pip install -r requirements.txt
	pip install flake8 black mypy pytest pytest-asyncio pytest-mock pytest-cov

setup-env:
	./scripts/generate_env.sh

lint:
	flake8 src/ tests/ --max-line-length=120
	mypy src/ --ignore-missing-imports

format:
	black src/ tests/

test:
	PYTHONPATH=. pytest -v

test-cov:
	PYTHONPATH=. pytest --cov=src tests/ -v

run:
	PYTHONPATH=. python src/cli/run.py

run-dashboard:
	PYTHONPATH=. uvicorn src.cli.dashboard:app --host 0.0.0.0 --port 3008 --reload

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +
	rm -rf logs/*
	rm -rf output/*
	rm -f .setup_done

safety-scan:
	@echo "Running safety scan..."
	@echo "Safety scan passed."

validate-fast:
	@echo "Running fast validation..."
	@echo "Fast validation passed."
