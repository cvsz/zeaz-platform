# META OS Rebalance Prompt

This document records the safe Codex prompt track for the ZEAZ META OS Cloudflare, Terraform/OpenTofu, runtime port federation, zero-trust, validation, and documentation refactor.

Use this prompt track only after the repository baseline passes:

```bash
make env-normalize-local
make env-format-validate-local
make validate
```

Rules:

- Keep Free/no-cost mode as the default.
- Use canonical `CLOUDFLARE_*` environment names.
- Do not commit local environment files, generated state, caches, or credentials.
- Do not print sensitive values.
- Prefer additive migrations over breaking rewrites.
- Keep runtime execution disabled or dry-run by default until risk controls are reviewed.
- Do not push automatically; commit for review only.

Primary deliverables:

- `docs/audit/meta-os-refactor-readiness.md`
- `docs/audit/runtime-port-conflicts.md`
- `docs/architecture/PORT_FEDERATION.md`
- `docs/architecture/CLOUDFLARE_EDGE_TOPOLOGY.md`
- `docs/architecture/META_OS_TOPOLOGY.md`
- `docs/architecture/META_OS_PORTS.md`
- `docs/migrations/META_OS_REBALANCE_MIGRATION.md`
- `docs/security/META_OS_HARDENING.md`
- `scripts/full_validation.sh`

Final validation:

```bash
make env-normalize-local
make env-format-validate-local
make validate
bash scripts/full_validation.sh || true
git status --short
```
