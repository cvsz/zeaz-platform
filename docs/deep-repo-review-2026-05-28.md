# zeaz-platform Deep Repo Review — 2026-05-28

## Review scope

This review covers the current `cvsz/zeaz-platform` repository state after the Free/no-cost control-panel upgrade, validation-flow fixes, project-upgrade-report workflow, and Makefile advisory/strict validation split.

Reviewed areas:

- README and operator workflow
- Makefile validation model
- project upgrade report runner
- environment validation model
- GitHub Actions workflows
- AGENTS.md operating guide
- Terraform/OpenTofu environment layout
- Cloudflare token and permission safety posture
- Cloudflare docs context workflow
- Free/no-cost guardrails

## Current status

The repository is now in a better source-health state than before:

- Source-health validation is separated from deployment-secret validation.
- `make validate-env` is advisory and CI-safe.
- `make validate-env-strict` is strict and requires real Cloudflare/identity/SOPS values.
- YAML validation passes for active source files and skips generated Claude Homunculus artifacts.
- Terraform formatting issues in `opentofu/environments/staging/main.tf` and `opentofu/environments/prod/main.tf` were fixed.
- `scripts/project-upgrade-report.sh` now reports source health without failing on missing deployment secrets.
- Cloudflare docs LLM context can be cached locally instead of vendored into Git.
- Free/no-cost defaults are documented and enforced by setup/reporting flows.

## High-priority findings

### 1. AGENTS.md still references the old repository identity

Severity: High

`AGENTS.md` still says:

```text
Repository: cvsz/cloudflare-platform
```

and its example repository tree still uses:

```text
cloudflare-platform/
```

Impact:

Future Codex/agent runs can drift back to the old project name, wrong clone path, wrong docs wording, and outdated assumptions.

Recommended fix:

- Rename the guide title to `zeaz-platform`.
- Change repository identity to `cvsz/zeaz-platform`.
- Change the required tree root from `cloudflare-platform/` to `zeaz-platform/`.
- Add Free/no-cost mode as a first-class operating constraint.
- Add `validate-env` vs `validate-env-strict` distinction.

### 2. AGENTS.md workflow version policy is stale

Severity: Medium

`AGENTS.md` lists older approved action versions such as:

```text
actions/checkout@v4
actions/upload-artifact@v4
actions/setup-python@v5
hashicorp/setup-terraform@v3
opentofu/setup-opentofu@v1
```

Current workflows already use newer versions such as:

```text
actions/checkout@v6
actions/upload-artifact@v7
actions/setup-python@v6
hashicorp/setup-terraform@v4
opentofu/setup-opentofu@v2
```

Impact:

Agent instructions and workflow implementation disagree, causing unnecessary reversions or invalid review comments.

Recommended fix:

- Update AGENTS.md approved action versions to match current workflows.
- Or change wording from a fixed allowlist to “minimum approved versions.”

### 3. Token lifecycle script still relies on embedded permission group IDs

Severity: High

`clean-and-regenerate-tokens.sh` contains embedded Cloudflare permission group IDs.

Impact:

Cloudflare permission group IDs can change or differ by account/API context. Hardcoded IDs can cause broken token generation or over/under-scoped tokens.

Recommended fix:

- Add a permission-group discovery command.
- Resolve permission groups dynamically before token creation.
- Keep `--perm-id` override for emergency/manual use.
- Keep dry-run default.
- Never print generated token values except when intentionally writing a chmod-600 env file.

### 4. Legacy docs still contain `cloudflare-platform` references

Severity: Medium

Search still returns old references in historical docs and environment scripts, including:

- `docs/full-documentation.md`
- `docs/full-detail-review-2026-05-11.md`
- `docs/project-upgrade-report-2026-05-28.md`
- `docs/repo-audit-2026-05-28.md`
- `scripts/environments/setup.sh`
- `scripts/environments/maintenance.sh`
- `scripts/environments/custominstructions.md`

Impact:

Some are historical references and safe to keep, but active scripts/docs should not send operators back to the wrong repo.

Recommended fix:

- Update active scripts and current docs.
- Mark older audit docs as historical if they intentionally mention the old repo.

### 5. `.env.example` is safe but strict validation still requires secrets

Severity: Expected behavior

The template intentionally leaves real values empty:

- `CF_ACCOUNT_ID`
- `CF_ZONE_ID`
- scoped Cloudflare tokens
- identity provider metadata
- `SOPS_AGE_KEY`

Impact:

`make validate-env-strict` will fail until real deployment values are filled.

Recommended operator guidance:

Use:

```bash
make validate
make upgrade-report
```

for source health.

Use:

```bash
make validate-env-strict
```

only after real local deployment values are added.

### 6. Local `/usr/bin/tofu` may not be OpenTofu

Severity: Environment issue

The upgrade report detected `/usr/bin/tofu` as a desktop UFO tool rather than OpenTofu.

Impact:

`make tofu-validate` can be misleading or fail on the local host.

Recommended fix:

Install official OpenTofu and set:

```bash
export TOFU_BIN=/path/to/opentofu
```

or skip OpenTofu locally and rely on Terraform until the correct binary is installed.

## Medium-priority findings

### 7. Free/no-cost mode exists in docs but not yet as a runtime policy library

The repo has Free/no-cost docs, env flags, setup defaults, and report checks. The actual future control panel still needs a central runtime guard such as:

```text
apps/zcf-control/api/app/core/cost_lock.py
```

Recommended next implementation:

- Add a cost-lock policy module.
- Add tests for paid-capable workflow blocking.
- Gate Workers/R2/WAF/Load Balancing/Logpush operations through that module.

### 8. Control panel app is still a blueprint, not implemented source

The docs and prompts exist, but the actual app paths are not yet implemented:

```text
apps/zcf-control/api
apps/zcf-control/web
infra/zcf-control/docker-compose.yml
```

Recommended next implementation:

Start with MVP only:

- FastAPI health endpoint
- SQLite DB
- local auth/RBAC skeleton
- token vault model without real secret return
- DNS read-only client stub
- React/Vite dashboard shell
- Docker Compose local runtime

### 9. `scripts/environments/setup.sh` remains legacy

A safer `scripts/environments/setup-free.sh` now exists, but the old setup script remains.

Recommended fix:

- Make `setup.sh` delegate to `setup-free.sh` by default in Free mode.
- Or mark it explicitly as legacy.

### 10. Reports are generated but not summarized into releases

The project now generates `reports/project-upgrade-report.md`, but there is no release-note automation consuming it.

Recommended fix:

- Add `scripts/release-notes-from-report.sh`.
- Generate `docs/release-notes/<date>.md` from report output.

## What is good now

- README now points to `cvsz/zeaz-platform` and documents Free/no-cost defaults.
- `.env.example` uses canonical `CF_*` variables and cost-lock flags.
- Python env validation supports legacy aliases and local backend mode.
- Test coverage for env validation is present and passing.
- YAML validation excludes generated/broken historical artifacts.
- Project report is repeatable and CI-friendly.
- Terraform root validation was reported passing.
- Cloudflare docs cache fetch was reported passing.

## Recommended next patch order

1. Update `AGENTS.md` repo identity and validation semantics.
2. Update AGENTS.md action-version policy.
3. Patch active `scripts/environments/setup.sh` to delegate to `setup-free.sh` or mark as legacy.
4. Add Cloudflare permission-group discovery for token lifecycle.
5. Implement Free/no-cost control-panel MVP app skeleton.
6. Add cost-lock runtime policy module and tests.
7. Add release-note generation from project report.

## Commands to run after this review

```bash
git pull
make validate
make upgrade-report
cat reports/project-upgrade-report.md
```

For deployment readiness only after real values are filled:

```bash
make validate-env-strict
```
