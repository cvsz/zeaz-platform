SHELL := /usr/bin/env bash
.DEFAULT_GOAL := help
ENV ?= dev
TF_DIR := terraform/envs/$(ENV)

help:
	@echo "targets: validate plan apply drift test backup restore"

validate:
	@scripts/validate.sh

plan:
	@scripts/install.sh plan $(ENV)

apply:
	@scripts/install.sh apply $(ENV)

drift:
	@scripts/drift-detect.sh $(ENV)

test:
	@pytest -q tests/pytest || true

backup:
	@scripts/backup.sh

restore:
	@scripts/restore.sh
