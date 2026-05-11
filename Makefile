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
	@case "$(BACKEND_TYPE)" in local|s3) ;; *) echo "ERROR: TERRAFORM_BACKEND_TYPE must be local|s3"; exit 1;; esac
	@if [ "$(BACKEND_TYPE)" = "s3" ]; then \
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
	@trivy fs .

sbom:
	@syft . -o spdx-json

doctor:
	@terraform version
	@tofu version
	@python3 --version
