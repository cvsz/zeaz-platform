# Free Claude-Assisted App Builder Workflow

This guide converts the user-provided reference, **"Build Apps Using Free Claude Code"** (`https://www.youtube.com/watch?v=Qb6RG0-8O1k`), into a Zeaz-safe operator workflow. It is intentionally conservative: the repository must not rely on unofficial pricing assumptions, leaked keys, shared tokens, or unreviewed AI-generated infrastructure changes.

## Current access caveat

As of June 10, 2026, Anthropic's official Claude Code setup documentation (`https://code.claude.com/docs/en/installation`) says terminal Claude Code access requires a Pro, Max, Team, Enterprise, or Console/API account, and that the free Claude.ai plan does **not** include Claude Code. Treat any "free Claude Code" workflow as one of these alternatives instead:

- free-tier Claude chat used for planning, requirements, architecture review, and prompt drafting;
- local/offline model workflows used outside this repository's committed files;
- third-party or bring-your-own-key providers configured only in local, ignored environment files;
- educational demo work that does not claim official free Claude Code entitlement.

Do not commit third-party provider keys, local model endpoints containing credentials, API gateway keys, webhook URLs, or generated tunnel credentials.

## Safe app-building pattern for this repo

Use this process when asking an AI coding agent to build or modify a Zeaz app:

1. **Choose one bounded app or platform phase.** Do not ask an agent to rebuild the whole monorepo.
2. **Read local instructions first.** Start with the root `AGENTS.md`, then any app-local `AGENTS.md` under the target path.
3. **Produce a small implementation plan.** Require file paths, validation commands, rollback notes, and security assumptions before edits.
4. **Keep secrets local-only.** Use `.env.example` for documented variable names and ignored `.env` files for local values.
5. **Prefer offline validation.** Cloudflare API checks must be opt-in and must never run by default.
6. **Keep destructive operations manual.** Terraform/OpenTofu apply, token rotation, tunnel mutation, production deploys, payment actions, trading actions, and provider publishing must require explicit human confirmation.
7. **Commit only reviewable changes.** Include docs, tests, and exact validation output in the PR body.

## Prompt template

Copy this template into Claude chat, Claude Code, Codex, or another coding assistant after selecting a target app or phase:

```text
You are working in cvsz/zeaz-platform.

Goal:
- Implement one small, reviewable change: <describe the app feature or platform phase task>.

Required guardrails:
- Read root AGENTS.md and any nested AGENTS.md before editing.
- Do not commit secrets, Cloudflare IDs, tunnel tokens, webhook URLs, production origin IPs, or real provider credentials.
- Do not run Terraform/OpenTofu apply or destroy.
- Keep all external API checks opt-in; default to offline validation.
- Do not weaken MFA, RBAC, JWT, WAF, scanner, workflow, or policy gates to make tests pass.

Implementation scope:
- Allowed paths: <list paths>.
- Forbidden paths: .env, secret-bearing tfvars, tunnel credentials, private keys, generated logs, runtime databases.

Expected output:
- Summary of changed files.
- Tests and validation commands run.
- Security notes.
- Rollback notes.
- Known limitations.
```

## Recommended agent roles

| Role | Use when | Expected output |
| --- | --- | --- |
| Planner | The request is broad or ambiguous. | One phase-scoped plan with risks and validation commands. |
| Implementer | The scope is clear and file paths are bounded. | A local patch with tests/docs. |
| Security reviewer | Access policies, Workers, WAF, tokens, CI, deploy, finance, or tunnel config changed. | Secret-safety and guardrail findings. |
| Validation operator | You need command coverage before handoff. | Exact offline commands and expected interpretation. |

## Local setup checklist

Use local-only configuration for any AI provider experiments:

```bash
# ignored local file only; never commit provider keys
cp .env.example .env
chmod 600 .env

# repository-safe validation before opening a PR
make validate-agent
make validate
```

If a free-tier provider is used outside the repo, configure it through the provider's documented local mechanism and confirm that generated logs do not contain secrets before sharing output.

## Security review questions

Before accepting AI-generated app changes, answer these questions:

- Did the change add or expose secrets, IDs, tokens, URLs with embedded credentials, private keys, or production origin IPs?
- Did the change introduce an allow-all Access policy or wildcard target without justification and tests?
- Did any workflow run apply/destroy/deploy on pull request or push without environment approval?
- Are finance routes stricter than AI/content routes?
- Are lower Cloudflare plan tiers handled without breaking validation?
- Are tests and docs updated for the actual implementation?

If any answer is unsafe or unknown, stop and create a smaller follow-up task instead of broadening the agent's permissions.
