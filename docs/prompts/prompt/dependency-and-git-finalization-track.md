# Dependency and Git Finalization Track

This document records the repository-safe implementation track from the uploaded continuation prompt that covered validation logs, the `google-genai` / `websockets` dependency conflict, and the universal signed commit + GitHub push rule.

## Current validated baseline from uploaded log

The uploaded log showed these checks passing before the remaining blockers:

```bash
make validate
make validate-agent
make ci
make validate-env
make validate-env-strict
make env-format-validate
make env-format-validate-local
make env-normalize-local
make maintenance
make test
```

Known remaining blockers captured by the upload:

- TFLint strict mode warning: missing Terraform `required_version` in `terraform/cloudflare/main.tf`.
- TFLint warning: unused Terraform variable `account_id` in `terraform/cloudflare/main.tf`.
- History-level gitleaks findings remain advisory unless strict mode is enabled.
- `google-genai==0.6.0` requires `websockets>=13.0,<15.0`, so `websockets==12.0` must not be used with it.

## Dependency fix track

If the API dependency resolver fails because `google-genai==0.6.0` conflicts with `websockets==12.0`, update dependency files so the websocket package satisfies the provider constraint.

Allowed final dependency forms:

```text
websockets==13.1
```

or:

```text
websockets>=13.0,<15.0
```

Do not keep this combination:

```text
google-genai==0.6.0
websockets==12.0
```

Recommended implementation target:

```text
scripts/fixers/fix-google-genai-websockets.sh
```

The fixer should:

- scan tracked dependency files only
- update requirements and pyproject dependency formats safely
- skip `.venv`, `.git`, `node_modules`, caches, and generated artifacts
- create no secret files
- validate with an isolated temporary venv
- clean up temporary dependency-check virtualenvs

Recommended Make targets:

```makefile
zaiz-fix-google-genai
zaiz-deps-check
```

## Universal GitHub finalization rule

After implementation, validation, docs, scripts, Makefile updates, Terraform changes, Cloudflare changes, runtime changes, and test execution, use this finalization pattern:

```bash
git status --short
git add .
bash gpg-loopback.sh commit -m "detail commit"
git push
git status --short
```

Rules:

- Do not use plain `git commit` for local release work.
- Do not claim completion until the push succeeds.
- Do not commit real secrets.
- Do not commit `.env`, `.env.cloudflare`, generated state, caches, Wrangler caches, or token audit logs.
- Do not hide validation failures.
- Use a feature branch for large changes unless the owner explicitly requests direct `main` updates.

## Validation sequence

Use this sequence after dependency or Makefile changes:

```bash
make env-normalize-local
make env-format-validate-local
make validate
make ci
make lint
make security-scan
```

For hard scanner gates only after all tools are installed and findings are remediated:

```bash
STRICT_SECURITY_SCAN=true make security-scan
```

## Final response requirements for autonomous agents

Final output must include:

- commit message used
- whether push succeeded
- validation summary
- files changed summary
- remaining warnings
- exact next commands
