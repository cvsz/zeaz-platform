SHELL := /usr/bin/env bash
.SHELLFLAGS := -Eeuo pipefail -c
.DEFAULT_GOAL := help

ENVIRONMENT ?= dev
BACKEND_TYPE ?= local
TF_ENV_DIR := terraform/environments/$(ENVIRONMENT)
TOFU_ENV_DIR := opentofu/environments/$(ENVIRONMENT)

.PHONY: help validate validate-env fmt fmt-check lint test tf-init tf-validate tf-plan tf-apply tf-destroy tofu-init tofu-validate tofu-plan tofu-apply drift-detect security-scan sbom doctor

help:
	@echo "Targets: validate validate-env fmt fmt-check lint test tf-init tf-validate tf-plan tf-apply tf-destroy tofu-init tofu-validate tofu-plan tofu-apply drift-detect security-scan sbom doctor"

validate: validate-env tf-validate tofu-validate

validate-env:
	@test -n "$(ENVIRONMENT)" || (echo "ERROR: ENVIRONMENT is required" && exit 1)
	@case "$(ENVIRONMENT)" in dev|staging|prod) ;; *) echo "ERROR: ENVIRONMENT must be dev|staging|prod"; exit 1;; esac
	@backend="$${TERRAFORM_BACKEND_TYPE:-$(BACKEND_TYPE)}"; \
	case "$$backend" in local|s3) ;; *) echo "ERROR: TERRAFORM_BACKEND_TYPE must be local|s3"; exit 1;; esac; \
	if [ "$$backend" = "s3" ]; then \
		test -n "$${TERRAFORM_STATE_BUCKET:-}" || (echo "ERROR: TERRAFORM_STATE_BUCKET is required when backend is s3" && exit 1); \
		test -n "$${TERRAFORM_LOCK_TABLE:-}" || (echo "ERROR: TERRAFORM_LOCK_TABLE is required when backend is s3" && exit 1); \
	fi

fmt:
	@terraform fmt -recursive terraform opentofu

fmt-check:
	@terraform fmt -check -recursive terraform opentofu

lint:
	@tflint --recursive terraform || echo "WARN: tflint not installed"

test:
	@if [ -d tests ]; then pytest -q tests; else echo "INFO: tests directory not present; skipping."; fi

tf-init: validate-env
	@terraform -chdir=$(TF_ENV_DIR) init

tf-validate: tf-init
	@terraform -chdir=$(TF_ENV_DIR) validate

tf-plan: validate-env
	@terraform -chdir=$(TF_ENV_DIR) plan

tf-apply: validate-env
	@test "$(CONFIRM_APPLY)" = "yes" || (echo "ERROR: Set CONFIRM_APPLY=yes to continue." && exit 1)
	@terraform -chdir=$(TF_ENV_DIR) apply

tf-destroy: validate-env
	@test "$(CONFIRM_APPLY)" = "yes" || (echo "ERROR: Set CONFIRM_APPLY=yes to continue." && exit 1)
	@terraform -chdir=$(TF_ENV_DIR) destroy

tofu-init: validate-env
	@tofu -chdir=$(TOFU_ENV_DIR) init

tofu-validate: tofu-init
	@tofu -chdir=$(TOFU_ENV_DIR) validate

tofu-plan: validate-env
	@tofu -chdir=$(TOFU_ENV_DIR) plan

tofu-apply: validate-env
	@test "$(CONFIRM_APPLY)" = "yes" || (echo "ERROR: Set CONFIRM_APPLY=yes to continue." && exit 1)
	@tofu -chdir=$(TOFU_ENV_DIR) apply

drift-detect:
	@terraform -chdir=$(TF_ENV_DIR) plan -detailed-exitcode || test $$? -eq 2

security-scan:
	@scripts/security-scan.sh

sbom:
	@scripts/generate-sbom.sh

doctor:
	@terraform version
	@tofu version
	@python3 --version


validate-f1:
	@bash scripts/validate.sh --offline --strict


# Agent and documentation compatibility aliases
validate-agent: validate-env
	@bash scripts/ai/validate-agent-env.sh

bootstrap-agent:
	@bash scripts/ai/bootstrap-agent.sh

terraform-validate: tf-validate
terraform-fmt: fmt
yaml-validate:
	@python3 scripts/validate-yaml.py

shell-validate:
	@find scripts -type f -name '*.sh' -print0 | xargs -0 shellcheck

# WAF policy and platform validation
waf-validate:
	@bash scripts/validate.sh --offline --strict
	@bash scripts/tunnel-validate.sh --offline

token-clean:
	@bash scripts/cloudflare/clean-and-regenerate-tokens.sh --dry-run --cleanup-only

token-rotate-dry:
	@bash scripts/cloudflare/clean-and-regenerate-tokens.sh --dry-run --regenerate --types all --backup

token-rotate:
	@bash scripts/cloudflare/clean-and-regenerate-tokens.sh --yes --regenerate --types all --backup --write .env.cloudflare


.PHONY: phase-f1 phase-f2 phase-f3 phase-f4 phase-f5 phase-f6

phase-f1:
	@bash scripts/validate.sh --offline --strict

phase-f2: tf-validate tofu-validate
	@echo "F2 validation complete."

phase-f3:
	@echo "F3 requires configured identity provider and Cloudflare Zero Trust tokens."
	@echo "Run: terraform -chdir=$(TF_ENV_DIR) plan"

phase-f4:
	@bash scripts/tunnel-validate.sh --offline

phase-f5:
	@echo "Run Workers tests and deploy workflows for edge services."

phase-f6: drift-detect security-scan sbom
	@echo "F6 monitoring, DR, and security checks complete."
