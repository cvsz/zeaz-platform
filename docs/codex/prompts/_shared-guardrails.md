# Shared Codex Cloud Guardrails

Use this block at the top of any generated Zeaz platform Codex Cloud task.

- Read `AGENTS.md`, `.codex/context.md`, and `docs/codex/master-meta-cloud-suite.md` before editing.
- Keep the task phase-scoped and reviewable.
- Do not commit secrets, production IDs, private keys, token values, webhook URLs, or production origin IPs.
- Do not run Terraform/OpenTofu apply or destroy.
- Do not run external mutation unless a documented manual workflow and confirmation guard already exist.
- Default to offline validation and document exact command results.
- If validation fails, report the root cause instead of weakening policy or tests.
