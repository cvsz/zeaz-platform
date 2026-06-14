# Final Release Validation Track

This document records the safe repository track for the uploaded ZEAZ META OS final-release prompt.

The uploaded source requests a full platform validation and release-evolution pass across runtime, edge, infrastructure, observability, AI routing, UI, API, and governance layers. In this repository, that request is handled as a reviewable validation and planning track, not as an automatic production deployment.

## Baseline commands

Run before and after any implementation work:

```bash
make env-normalize-local
make env-format-validate-local
make validate
```

## Safety rules

- Keep Free/no-cost mode as the default.
- Keep single-VPS compatibility.
- Use canonical `CLOUDFLARE_*` environment names.
- Do not commit `.env`, `.env.cloudflare`, generated state, caches, or credentials.
- Do not print secret values.
- Do not enable production runtime actions by default.
- Require explicit confirmation for destructive, production, firewall, deploy, or release actions.
- Commit for review only; do not push automatically.

## Final-release review areas

- Repository validation
- Compose and runtime topology
- Cloudflare and Terraform/OpenTofu configuration
- Port and domain federation
- Websocket routing
- Observability
- Security hardening
- API gateway
- Web dashboard
- Runtime governance
- Self-healing and rollback readiness
- Release operations

## Required report outputs

Create or update these docs during the implementation pass:

```text
docs/final-release/full-runtime-audit.md
docs/final-release/cloudflare-audit.md
docs/final-release/security-audit.md
docs/final-release/observability-audit.md
docs/final-release/runtime-convergence-audit.md
docs/final-release/production-readiness-report.md
```

## Required validation gate

The implementation is not complete until these pass locally:

```bash
make env-normalize-local
make env-format-validate-local
make validate
bash scripts/full_validation.sh || true
git status --short
```

## Review-only git flow

```bash
git add .
bash gpg-loopback.sh commit -m "docs(final-release): add validation track"
```

The user reviews and pushes manually.
