SHELL := /usr/bin/env bash

.PHONY: bootstrap-agent validate-agent terraform-fmt terraform-validate yaml-validate shell-validate

bootstrap-agent:
	./scripts/ai/bootstrap-agent.sh

validate-agent:
	./scripts/ai/validate-agent-env.sh

terraform-fmt:
	terraform -chdir=terraform fmt -recursive

terraform-validate:
	terraform -chdir=terraform init -backend=false -input=false
	terraform -chdir=terraform validate

yaml-validate:
	python3 - <<'PY'
import sys, pathlib, yaml
for p in pathlib.Path('.').rglob('*.yml'):
    if '.git' in p.parts: continue
    yaml.safe_load(p.read_text())
print('yaml ok')
PY

shell-validate:
	shellcheck scripts/ai/*.sh
