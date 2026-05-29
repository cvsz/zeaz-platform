# zeaz-platform Repo Audit — 2026-05-28

This audit records high-confidence issues found during a repository maintenance pass and the updates applied directly to `main`.

## Scope reviewed

Reviewed core configuration, validation, setup, token lifecycle, YAML validation, Makefile operations, and the new Cloudflare Control Panel FREE NO COST expansion.

Key files inspected:

- `.env.example`
- `README.md`
- `Makefile`
- `python/cfstack_validate_env.py`
- `tests/test_env_validation.py`
- `scripts/common.sh`
- `scripts/lib/env.sh`
- `scripts/cloudflare/load-env.sh`
- `scripts/environments/setup.sh`
- `scripts/cloudflare/clean-and-regenerate-tokens.sh`
- `scripts/add-missing-vars.sh`
- `scripts/validate-yaml.py`
- `docs/CLOUDFLARE_CONTROL_PANEL_FREE.md`
- `docs/prompts/cloudflare-control-panel-free.prompt.md`
- `tunnels/cloudflared/zcf-control-free.template.yml`

## Fixed issues

### 1. Environment variable naming mismatch

Problem:

- `.env.example` used `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID`, and `CLOUDFLARE_*_TOKEN` names.
- Python and shell validators expected canonical `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID`, and `CF_*_TOKEN` names.
- A fresh user following `.env.example` could fill values and still fail validation.

Fix:

- Updated `.env.example` to canonical `CF_*` variables.
- Added compatibility tests for legacy `CLOUDFLARE_*` aliases.
- Updated the Python validator to normalize legacy aliases.
- Updated shell loaders to normalize aliases.

### 2. Free/no-cost mode conflicted with S3 backend defaults

Problem:

- Free/no-cost mode should not require AWS S3 or DynamoDB state locking.
- The old `.env.example` defaulted to `TERRAFORM_BACKEND_TYPE=s3` and required bucket/lock-table names.

Fix:

- Updated `.env.example` to default to `TERRAFORM_BACKEND_TYPE=local`.
- Updated validator logic so `TERRAFORM_STATE_BUCKET` and `TERRAFORM_LOCK_TABLE` are required only for `s3` backend.
- Added regression test for free/local backend behavior.

### 3. Missing cost-lock validation

Problem:

- Free/no-cost control-panel design requires `COST_LOCK=true`, but environment validation did not check cost-lock flags.

Fix:

- Added cost-lock defaults to `.env.example`.
- Added validation tests for paid override warnings.
- Updated validator to warn when Free plan uses paid override flags.
- Updated common shell helper to warn when Free plan is not guarded by cost lock.

### 4. Non-idempotent Terraform helper

Problem:

- `scripts/add-missing-vars.sh` appended variable blocks on every run.
- Re-running it could create duplicate Terraform variables and break validation.

Fix:

- Rewrote the helper to check for existing variable declarations before appending.
- Changed `enable_workers_ai` default to `false` for safer Free-plan behavior.

### 5. YAML validation scanned broken/generated history

Problem:

- YAML validation scanned every YAML file, including `.backup`, generated build output, dependency folders, and Terraform cache folders.
- CI could fail on historical backup artifacts instead of active source.

Fix:

- Updated `scripts/validate-yaml.py` to ignore `.backup`, `.cloudflare-backups`, `.terraform`, `.venv`, `node_modules`, `dist`, `build`, and `coverage`.

### 6. cloudflared template indentation

Problem:

- `tunnels/cloudflared/zcf-control-free.template.yml` initially had invalid indentation before `ingress`.

Fix:

- Corrected `ingress` to top-level YAML.

## Remaining known issues to update next

### README repo-name drift

Current issue:

- README still contains references to `cvsz/cloudflare-platform` and `cd cloudflare-platform` even though this repository is `cvsz/zeaz-platform`.

Recommended update:

```bash
git clone https://github.com/cvsz/zeaz-platform.git
cd zeaz-platform
```

### Setup script defaults

Current issue:

- `scripts/environments/setup.sh` still defaults Terraform backend values to S3-style names in some paths.
- A full rewrite was not applied in this pass because the GitHub connector blocked the large secret-oriented script replacement.

Recommended manual/Codex update:

- Default `TERRAFORM_BACKEND_TYPE=local`.
- Preserve existing S3 values only when the user already uses S3.
- Add `COST_LOCK=true` and paid override flags.
- Normalize legacy `CLOUDFLARE_*` aliases into canonical `CF_*` names.

### Token lifecycle script requires careful verification

Current issue:

- `scripts/cloudflare/clean-and-regenerate-tokens.sh` embeds permission-group IDs.
- Cloudflare permission group IDs can change or vary by API context.

Recommended update:

- Add a discovery mode that lists permission groups from the API.
- Prefer resolving permission group IDs dynamically by name/slug where possible.
- Keep `--perm-id` override for emergency/manual use.
- Keep dry-run as default for all token rotation workflows.

### README paid-plan language

Current issue:

- README and older docs mention Workers AI, R2, WAF, Bot Management, and mTLS as platform layers.
- That is valid for higher tiers but can confuse FREE NO COST deployment mode.

Recommended update:

- Add a prominent Free Mode section near the top.
- Mark paid/overage-prone modules as disabled unless `COST_LOCK=false` and an owner approves.

## Validation commands

Run locally after pulling updates:

```bash
python3 -m pytest -q tests
python3 python/cfstack_validate_env.py --json
python3 scripts/validate-yaml.py
make doctor
make yaml-validate
make shellcheck
```

For Free/no-cost mode:

```bash
cp .env.example .env
chmod 600 .env
# Fill CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ZONE_ID, and scoped token values.
python3 python/cfstack_validate_env.py --strict
```

If warnings fail strict mode because real tokens are not filled yet, validate structure without strict warnings:

```bash
python3 python/cfstack_validate_env.py
```