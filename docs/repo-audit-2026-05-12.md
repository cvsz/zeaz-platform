# Repository Audit (2026-05-12)

## Scope reviewed
- `README.md`
- `.env.example`
- `Makefile`
- `terraform/` and `opentofu/`
- `scripts/`
- `.github/workflows/`

## Key findings and fixes

1. **CI workflow calls undefined Make target (`waf-validate`)**
   - **Evidence:** `.github/workflows/waf-validation.yml` runs `make waf-validate`, but `Makefile` has no `waf-validate` target.
   - **Impact:** WAF validation workflow fails immediately.
   - **Exact fix:** Add a `waf-validate` target (for example: run `scripts/validate.sh --offline --strict` plus WAF policy checks), or update workflow to call an existing command.

2. **Duplicate/overlapping workflows create drift and inconsistent checks**
   - **Evidence:** Duplicate pairs exist with different logic and names:
     - `policy-test.yml` and `policy-testing.yml`
     - `dr-test.yml` and `dr-testing.yml`
     - `sbom.yml` and `sbom-generation.yml`
   - **Impact:** Confusing CI outcomes, duplicated runs, and inconsistent enforcement.
   - **Exact fix:** Keep only one canonical workflow per function and delete/merge duplicates; standardize trigger, permissions, and artifact behavior.

3. **Non-functional placeholder workflows in production CI path**
   - **Evidence:** `tunnel-deploy.yml`, `cloudflared-restart.yml`, and `rotate-secrets.yml` only `echo` placeholder text.
   - **Impact:** False confidence; required controls appear present but do not execute real validation or operations.
   - **Exact fix:** Replace placeholder `echo` steps with concrete script entrypoints (`scripts/tunnel-validate.sh`, `scripts/rotate-secrets.sh`, etc.) and fail the job on command error.

4. **Insecure/sensitive auth guidance mismatch in documentation**
   - **Evidence:** `README.md` says Global API Key is required for token lifecycle; `.env.example` does not include `CF_EMAIL`/`CF_GLOBAL_API_KEY`.
   - **Impact:** Operators may overuse high-privilege credentials and hit setup confusion due to doc/env mismatch.
   - **Exact fix:** Prefer scoped token automation everywhere; remove Global API Key requirement from README and token scripts, or explicitly add gated optional vars in `.env.example` and validation with strict warning banners.

5. **`SECRET_ROTATION_INTERVAL` format mismatch**
   - **Evidence:** `.env.example` sets `SECRET_ROTATION_INTERVAL=30d`; documentation describes interval as days and examples/scripts often expect integer-like values.
   - **Impact:** Runtime parsing ambiguity and potential validation failures.
   - **Exact fix:** Standardize to a single format (recommended integer days, e.g. `30`) and enforce via regex validation in scripts.

6. **Nested duplicate token script path indicates repository hygiene issue**
   - **Evidence:** `scripts/cloudflare/cloudflare/gen-token.sh` duplicates `scripts/cloudflare/gen-token.sh` and violates script baseline header requirements.
   - **Impact:** Unclear execution source, accidental usage of stale code, and inconsistent behavior.
   - **Exact fix:** Remove nested duplicate directory or convert it into a clearly documented archive path excluded from execution/lint targets.

7. **Workflow tooling assumptions not bootstrapped**
   - **Evidence:** `terraform-validate.yml` runs `make validate`, which requires `tofu` via `tofu-validate`, but workflow does not install OpenTofu.
   - **Impact:** CI fails in clean runners.
   - **Exact fix:** Install OpenTofu in workflow before `make validate`, or split Terraform and OpenTofu validation jobs with explicit setup steps.

8. **Shell validation pattern in Makefile is non-portable**
   - **Evidence:** `shell-validate` uses `shellcheck scripts/**/*.sh`; globstar expansion is shell-option dependent.
   - **Impact:** Missing script lint coverage or false negatives on environments without `globstar` enabled.
   - **Exact fix:** Use `find scripts -type f -name '*.sh' -print0 | xargs -0 shellcheck`.

9. **OpenTofu backend examples present but environment backend config not fully mirrored**
   - **Evidence:** `terraform/backend/` has `dev.backend.hcl`; `opentofu/backend/` lacks equivalent per-environment backend example.
   - **Impact:** Divergent operator experience between Terraform and OpenTofu environments.
   - **Exact fix:** Add matching backend config files and document identical backend bootstrap flow for both toolchains.
