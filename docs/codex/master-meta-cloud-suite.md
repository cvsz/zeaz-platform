# Zeaz Master Meta Codex Cloud Suite

This suite is the repository-local Codex Cloud operating pack for `cvsz/cloudflare-platform`. It turns broad platform requests into small, phase-scoped, reviewable tasks that honor the root `AGENTS.md` safety model.

## What the suite provides

- A machine-readable suite manifest at `.codex/suite/master-meta-cloud-suite.json`.
- Additional read-only Codex roles for phase planning, security review, and validation planning.
- Phase prompt templates under `docs/codex/prompts/` for F0 through F12.
- An offline validator at `docs/codex/scripts/validate_codex_suite.py`.

## Operating principles

1. Keep one active implementation phase per pull request unless the repository owner explicitly narrows a safe cross-phase change.
2. Default to offline validation; Cloudflare API checks require an explicit `--api-check` style switch in the relevant tool.
3. Do not run Terraform/OpenTofu apply or destroy from Codex Cloud tasks.
4. Do not create, rotate, reveal, or print secrets from Codex Cloud tasks.
5. Treat plan-gated Cloudflare capabilities as conditional and non-breaking for Free, Pro, and Business tiers.
6. Require a security pass before handoff when Access policies, tokens, Workers, WAF, tunnel ingress, workflows, or deployment automation change.

## Suggested Codex Cloud task flow

| Step | Role | Purpose | Output |
| --- | --- | --- | --- |
| 1 | `explorer` | Read relevant files and identify the active AGENTS.md phase. | File evidence and phase recommendation. |
| 2 | `phase_planner` | Convert the request into one small task with validation and rollback notes. | Phase execution plan. |
| 3 | implementation agent | Apply only the approved phase-scoped edits. | Local patch. |
| 4 | `validation_operator` | Map the patch to offline validation commands. | Validation checklist and interpretation. |
| 5 | `security_guardian` | Review secret safety, token separation, plan gates, and mutating guards. | Security findings. |
| 6 | `reviewer` | Review correctness, regressions, docs, and test coverage. | Final review findings. |

## Safety boundaries for generated tasks

Generated Codex Cloud tasks must not ask an agent to:

- commit real Cloudflare identifiers, tokens, private keys, provider secrets, webhook URLs, or origin IPs;
- enable allow-all Access policies;
- remove MFA, RBAC, JWT verification, WAF, scanner, or validation protections to make checks pass;
- run apply, destroy, live token rotation, production tunnel mutation, or GitHub auto-merge;
- upload `.env`, secret-bearing `.tfvars`, SOPS private keys, tunnel credentials, or token audit logs as artifacts.

## Phase prompt index

| Phase | Prompt |
| --- | --- |
| F0 | `docs/codex/prompts/f0-repository-audit.md` |
| F1 | `docs/codex/prompts/f1-context-and-variables.md` |
| F2 | `docs/codex/prompts/f2-terraform-opentofu-foundation.md` |
| F3 | `docs/codex/prompts/f3-zero-trust-identity.md` |
| F4 | `docs/codex/prompts/f4-dns-tunnels-networking.md` |
| F5 | `docs/codex/prompts/f5-workers-edge-ai-gateway.md` |
| F6 | `docs/codex/prompts/f6-monitoring-dr-security.md` |
| F7 | `docs/codex/prompts/f7-gitops-orchestration.md` |
| F8 | `docs/codex/prompts/f8-release-candidate-hardening.md` |
| F9 | `docs/codex/prompts/f9-first-apply-readiness.md` |
| F10 | `docs/codex/prompts/f10-controlled-deployment.md` |
| F11 | `docs/codex/prompts/f11-maintenance-review.md` |
| F12 | `docs/codex/prompts/f12-ownership-handoff.md` |

## Validation

Run the suite validator after editing Codex suite files:

```bash
python3 docs/codex/scripts/validate_codex_suite.py
```

The validator checks that every phase lane has a prompt, every referenced agent config exists, and the manifest keeps dangerous mutation flags disabled.
