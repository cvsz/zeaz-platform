# zeaz-platform Full Project Upgrade Report — 2026-05-28

## Executive summary

The repository was upgraded from a Cloudflare-platform-oriented control plan into a clearer `zeaz-platform` project with Free/no-cost guardrails, current Cloudflare docs-context workflow, repeatable upgrade reporting, cleaned repo hygiene, and safer defaults for local validation.

This report summarizes what changed, what was fixed, what remains to verify locally, and the next implementation steps.

## Upgrade objectives

- Correct repo drift from `cloudflare-platform` to `zeaz-platform`.
- Keep Free/no-cost deployment as the default operating mode.
- Add repeatable project upgrade reporting.
- Add Cloudflare docs context cache workflow for agents.
- Harden repo hygiene around generated reports, caches, and secrets.
- Preserve scoped-token-first Cloudflare operations.
- Avoid committing large upstream docs, generated state, or secret material.

## Applied upgrades

### 1. README refresh

`README.md` was rewritten to reflect the current repository identity and workflow.

Key improvements:

- clone path now uses `https://github.com/cvsz/zeaz-platform.git`
- project title now reflects `zeaz-platform`
- Free/no-cost mode is documented near the top
- `COST_LOCK=true` is the safe default
- `TERRAFORM_BACKEND_TYPE=local` is the safe default
- Cloudflare docs cache workflow is documented
- Makefile target list is aligned to current project tasks
- old `cloudflare-platform/` repo tree references were removed from the main docs path

### 2. Free/no-cost safety defaults

The repo now documents and validates these guardrails:

```bash
CLOUDFLARE_PLAN_TIER=Free
COST_LOCK=true
ALLOW_PAID_CLOUDFLARE_FEATURES=false
ALLOW_R2_WRITE=false
ALLOW_WORKERS_DEPLOY=false
ALLOW_LOAD_BALANCING=false
ALLOW_ADVANCED_WAF=false
ALLOW_LOGPUSH=false
```

These defaults are intended to prevent accidental usage of paid or overage-prone Cloudflare features.

### 3. Cloudflare LLM docs context workflow

Added:

- `docs/CLOUDFLARE_LLM_CONTEXT.md`
- `scripts/cloudflare/fetch-cloudflare-llms-context.sh`

The workflow caches Cloudflare docs locally under `.cache/cloudflare-docs/` instead of committing the full upstream docs corpus.

### 4. Project upgrade report runner

Added:

- `scripts/project-upgrade-report.sh`

The script generates:

```text
reports/project-upgrade-report.md
```

It checks:

- tool availability
- git state
- Python environment validation
- pytest
- YAML validation
- shell syntax
- shellcheck when installed
- Terraform formatting and validation when installed
- OpenTofu validation when available
- Cloudflare docs cache fetch workflow

The generated `reports/` directory is intentionally ignored by Git.

### 5. CI workflow for upgrade reports

Added:

- `.github/workflows/project-upgrade-report.yml`

It runs on pull requests touching docs, scripts, tests, tunnel templates, `.env.example`, README, or Makefile, and uploads the generated report as a workflow artifact.

### 6. Git hygiene cleanup

`.gitignore` was cleaned and normalized.

Key changes:

- removed the incorrect `.gitignore` self-ignore entry
- added `reports/`
- kept `.cache/` ignored for Cloudflare docs cache
- kept `.env`, `.env.cloudflare`, state files, generated tunnel config, backups, local agents, and dependency folders ignored

## Previously fixed issues included in this upgrade line

This upgrade builds on the prior repo audit pass that fixed:

- env var mismatch between `.env.example` and validators
- local backend validation for Free/no-cost mode
- cost-lock validation warnings
- shell env alias normalization
- idempotent Terraform variable helper
- YAML validation excluding backup/generated folders
- cloudflared template indentation

See:

- `docs/repo-audit-2026-05-28.md`
- `docs/CLOUDFLARE_CONTROL_PANEL_FREE.md`

## Current validation commands

Run after pulling the latest `main`:

```bash
git pull
python3 -m pip install -r requirements-dev.txt
python3 python/cfstack_validate_env.py
python3 scripts/validate-yaml.py
python3 -m pytest -q tests
bash scripts/project-upgrade-report.sh
```

For IaC validation:

```bash
make tf-fmt-check
make tf-init
make tf-validate
make tofu-validate
```

For Cloudflare docs context:

```bash
bash scripts/cloudflare/fetch-cloudflare-llms-context.sh
```

## Known limitations

### 1. Setup script still needs a safer full rewrite

`script/environments/setup.sh` still needs a follow-up patch to fully align generated `.env` defaults with Free/no-cost mode.

Required follow-up:

- default backend to `local`
- emit cost-lock flags
- normalize legacy aliases
- avoid defaulting to remote state names unless S3 backend is explicitly selected

A large replacement was not applied during this pass because the connector blocked the secret-oriented script rewrite.

### 2. Token permission group IDs need API discovery

`clean-and-regenerate-tokens.sh` still uses embedded permission group IDs. This should be upgraded to discover permission groups dynamically from Cloudflare API before creating tokens.

Required follow-up:

- add permission-group discovery command
- map permission groups by API response
- keep manual `--perm-id` override
- keep dry-run first

### 3. Terraform/OpenTofu validation still requires local runtime check

The repo has been updated, but actual `terraform validate`, `tofu validate`, and provider behavior still need to run in the user's local or CI environment.

## Recommended next implementation phases

### Phase U1 — Setup script safe rewrite

Patch `scripts/environments/setup.sh` to generate Free/no-cost `.env` defaults safely.

### Phase U2 — Token permission discovery

Add API-backed permission group discovery to token lifecycle workflows.

### Phase U3 — Control panel app skeleton

Start implementing the actual Free/no-cost control panel app paths:

```text
apps/zcf-control/api
apps/zcf-control/web
infra/zcf-control/docker-compose.yml
```

### Phase U4 — Runtime hardening

Add Docker Compose healthchecks, local SQLite/Postgres persistence, and cloudflared config rendering tests.

### Phase U5 — Release tag

After all checks pass:

```bash
git tag v1.1.0-free-control-panel
```

## Final status

Status: upgraded and report workflow added.

The repository now has clearer identity, safer defaults, Free/no-cost controls, Cloudflare docs refresh support, generated upgrade reports, and CI artifact support for future project-level audits.
