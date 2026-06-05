bootstrap:
	@echo "bootstrap zAcademy"
	mkdir -p apps services automation infra docs architecture packages templates scripts .github/workflows

generate:
	python scripts/scaffold/generate.py

verify:
	python -m compileall automation || true

lint:
	pnpm lint

test:
	pnpm test

build:
	pnpm build

security:
	@echo "run sast sbom secret scan"

deploy-dev:
	@echo "deploy dev"

deploy-prod:
	@echo "deploy prod"
