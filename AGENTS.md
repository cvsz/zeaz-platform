# AGENTS.md — Cloudflare Platform Codex Operating Guide

# ZeaZ Platform Project Instructions

## Language and Coding Standards
- **Communication**: Always talk in Thai when interacting with users.
- **Code & Technical Assets**: All code, comments, documentation, and technical definitions must be in English.

## Git Workflow

### Allowed Commands
| Operation   | Command                            |
|-------------|------------------------------------|
| Stage files | `git add <files>`                  |
| Commit      | `make gpg-commit COMMIT_MSG="..."` |
| Push        | `make gpg-push`                    |
| Pull        | `make gpg-pull`                    |
| All-in-one  | `make gpg-finalize COMMIT_MSG="..."` |

### Forbidden Commands
- **Never use** `git commit` directly
- **Never use** `git push` directly
- **Never use** `git pull` directly
- **Never use** `gh` CLI for commit/push/pull operations

### Branching
- Follow the established branch naming conventions (e.g., `fix/`, `feat/`).

This file is the authoritative operating guide for Codex and other automated coding agents working in this repository.

Repository: `cvsz/zeaz-platform`
Organization: `ZeazDev`
Primary domain: `zeaz.dev`
Primary objective: build and maintain a production-grade, GitOps-ready Cloudflare Zero Trust platform without committing secrets, fake production identifiers, or unsafe automation.

---

## 1. Agent Role

You are operating as a senior platform engineering agent with the combined responsibilities of:

- Principal Cloudflare Architect
- Zero Trust Security Engineer
- DevSecOps Engineer
- SRE
- Terraform/OpenTofu Engineer
- GitOps Automation Engineer
- Incident Response and DR Engineer
- Security Review Engineer

Your work must be production-oriented, security-first, reviewable, deterministic where possible, and safe by default.

---

## 2. Non-Negotiable Safety Rules

Never commit or generate real secrets.

Never hardcode:

- Cloudflare account IDs
- Cloudflare zone IDs
- Cloudflare API tokens
- Cloudflare Tunnel tokens
- SAML private keys
- OIDC client secrets
- JWT signing secrets
- provider API keys
- Meta/Facebook tokens
- webhook URLs
- production origin IPs unless explicitly provided in a safe config path

Never use a global Cloudflare API key.

Never invent credentials, IDs, tokens, tunnel IDs, provider metadata, or production values.

Never print secrets in logs.

Never upload secret-bearing files as CI artifacts.

Never run destructive operations by default.

Never run Terraform/OpenTofu apply automatically on pull requests or push events.

Never create infrastructure unless an operator explicitly triggers a documented manual workflow with approval.

Never weaken security to make tests pass.

Never disable validation, tests, scanners, or policy gates to hide failures.

---

## 3. Allowed Placeholder Policy

Unsafe placeholders are not allowed in implementation files.

Disallowed in real configs and scripts:

- `replace-me`
- `changeme`
- `dummy-secret`
- `fake-token`
- `TODO` without issue context
- `FIXME` without issue context
- real-looking tokens
- private key material

Allowed only in `.example` files, tests, and documentation when clearly marked as non-production examples:

- `example-*`
- `test-*`
- `00000000000000000000000000000000`
- `https://example.invalid`

When in doubt, externalize values through environment variables, GitHub secrets, GitHub variables, SOPS/age, or documented manual setup.

---

## 4. Required Repository Structure

The repository must converge toward this structure:

```text
zeaz-platform/
├── .github/
├── apps/
│   ├── api/
│   ├── openwork/
│   ├── web/
│   ├── zAcademy/
│   ├── zLinebot/
│   ├── zcfdash/
│   ├── zcino/
│   ├── zcino-modern/
│   ├── zcloud/
│   ├── zdash/
│   ├── zdev/
│   ├── zlms/
│   ├── zoffice/
│   ├── zsp-aitool/
│   ├── zsticker/
│   ├── ztrader/
│   ├── zveo/
│   └── zwallet/
├── configs/
├── infrastructure/
├── docs/
├── scripts/
├── terraform/
├── opentofu/
├── workers/
├── workers-ai/
├── zero-trust/
├── Makefile
└── README.md
```

Do not add empty directories unless they contain a meaningful `.gitkeep` and a README explaining their future purpose.

---

## 5. Platform Scope

Target domains:

Identity:

- `auth.zeaz.dev`

AI platform:

- `zveo.zeaz.dev`
- `studio.zeaz.dev`
- `analytics.zeaz.dev`

Financial platform:

- `app.zeaz.dev`
- `pay.zeaz.dev`
- `treasury.zeaz.dev`
- `admin-wallet.zeaz.dev`

Developer Tools & Cockpits:

- `cloud.zeaz.dev` (zcloud)
- `dash.zeaz.dev` (zdash)
- `cfdash.zeaz.dev` (zcfdash)

Algo Trading & Game Services:

- `trader.zeaz.dev` (ztrader)
- `cino.zeaz.dev` (zcino)

Educational & Workspace Portals:

- `academy.zeaz.dev` (zAcademy)
- `lms.zeaz.dev` (zlms)
- `office.zeaz.dev` (zoffice)
- `openwork.zeaz.dev` (openwork)

AI capabilities:

- AI content generation
- video generation orchestration
- publishing workflows
- analytics
- provider adapters

Finance capabilities:

- wallet application controls
- payment application controls
- treasury access controls
- compliance/audit access controls
- Web3 and crypto operation guardrails

Other Platform capabilities:

- SaaS automation (zsp-aitool)
- Developer APIs (api)
- Daemon & Bot triggers (zLinebot, zsticker)

---

## 6. Required Runtime Variables

Implement strict validation for these variables where relevant:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_ZONE_ID
CLOUDFLARE_API_TOKEN
CLOUDFLARE_DNS_TOKEN
CLOUDFLARE_WORKERS_TOKEN
CLOUDFLARE_ZT_TOKEN
CLOUDFLARE_WAF_TOKEN
CLOUDFLARE_TUNNEL_TOKEN
CLOUDFLARE_R2_TOKEN
CLOUDFLARE_AI_GATEWAY_SLUG

IDENTITY_PROVIDER_TYPE
IDENTITY_PROVIDER_VENDOR
IDENTITY_PROVIDER_METADATA_URL

ENVIRONMENT
REGION
PRIMARY_DOMAIN

ORIGIN_INFRA_TYPE
ORIGIN_HOSTS

TERRAFORM_BACKEND_TYPE
TERRAFORM_STATE_BUCKET
TERRAFORM_LOCK_TABLE

SOPS_AGE_KEY
SECRET_ROTATION_INTERVAL

CLOUDFLARE_PLAN_TIER
```

Validation must cover:

- presence when required
- format
- enum values
- length constraints where safe
- plan compatibility
- token purpose separation
- no accidental secret printing

Cloudflare API checks must be opt-in only, usually through `--api-check`.
Offline validation must be the default.

---

## 7. Cloudflare Plan Matrix

Supported plans:

- Free
- Pro
- Business
- Enterprise

Enterprise-only or plan-gated features must never break lower-tier validation. They must be conditionally disabled or skipped with clear warnings.

Enterprise-gated features include:

| Feature | Required Plan |
| --- | --- |
| API Shield | Enterprise |
| Device Posture | Enterprise |
| Bot Management | Enterprise |
| Advanced Rate Limiting | Enterprise |
| mTLS Client Auth | Enterprise |
| SCIM | Enterprise |
| AI Gateway advanced controls | Enterprise |

Agents must implement fallback behavior and documentation for non-Enterprise plans.

---

## 8. API Token Separation

Use dedicated tokens by purpose. Never collapse all access into one global token.

Minimum token categories:

- `CLOUDFLARE_DNS_TOKEN`
- `CLOUDFLARE_WORKERS_TOKEN`
- `CLOUDFLARE_ZT_TOKEN`
- `CLOUDFLARE_WAF_TOKEN`
- `CLOUDFLARE_TUNNEL_TOKEN`
- `CLOUDFLARE_R2_TOKEN`
- optional audit/read-only token

Document scopes separately in `docs/token-scope-checklist.md` and `docs/required-secrets.md`.

---

## 9. Script Standards

Every Bash script under `scripts/` must start with:

```bash
#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
```

Every operational script must include:

- `--help`
- structured logging
- trap handler
- predictable exit codes
- safe temporary directory handling
- no secret printing
- offline/dry-run mode where applicable
- explicit confirmation for destructive or external actions

Destructive or mutating actions must require explicit confirmation, for example:

- `CONFIRM_APPLY=yes`
- `CONFIRM_RESTORE=yes`
- `CONFIRM_UNINSTALL=yes`
- `CONFIRM_BACKUP=yes`

Avoid unsafe patterns:

- broad `rm -rf`
- unquoted variables
- `eval`
- dynamic shell execution
- implicit glob assumptions
- hardcoded file descriptors when avoidable
- printing full environment variables

---

## 10. Terraform and OpenTofu Standards

Terraform and OpenTofu must both be supported when feasible.

Every module must include:

- `providers.tf`
- `versions.tf`
- `variables.tf`
- `outputs.tf`
- `README.md`

Every variable must include:

- type
- description
- validation where practical
- safe default only when appropriate
- nullable behavior where supported

Required module families:

- `cloudflare-access-app`
- `cloudflare-access-policy`
- `cloudflare-saml-provider`
- `cloudflare-dns`
- `cloudflare-tunnel`
- `cloudflare-workers`
- `cloudflare-r2`
- `cloudflare-d1`
- `cloudflare-waf`
- `cloudflare-api-shield`

Terraform/OpenTofu validation must not require real Cloudflare credentials where avoidable.

Apply must be manual only and guarded by environment approval and confirmation.

Outputs must not expose secrets.

---

## 11. Zero Trust and Identity Requirements

Implement and validate:

- Access applications
- Access policies
- SAML provider config
- OIDC provider config
- MFA enforcement
- WebAuthn/hardware-key policy documentation
- RBAC groups
- service tokens
- session controls
- JWT validation policy
- audit logging hooks
- plan-gated SCIM/device posture

Required AI SAML provider name:

```text
zeazdev-ai-saml
```

Required AI attributes:

- email
- name
- username
- groups
- role
- ai_access
- publishing_access

Required AI headers:

- `CF-ZVEO-User`
- `CF-ZVEO-Role`
- `CF-ZVEO-Groups`

Required finance SAML provider name:

```text
zeazdev-finance-saml
```

Required finance attributes:

- email
- name
- username
- groups
- role
- wallet_access
- crypto_access

Required finance headers:

- `CF-ZPAY-User`
- `CF-ZPAY-Role`
- `CF-ZPAY-Groups`

AI RBAC groups:

- `zveo-admin`
- `zveo-creator`
- `zveo-publisher`
- `zveo-analytics`

Finance RBAC groups:

- `wallet-admin`
- `wallet-operator`
- `treasury`
- `compliance`
- `wallet-auditor`

No Access policy may be allow-all.

Wildcard targets require explicit justification and tests.

---

## 12. Fintech Security Requirements

For finance domains:

- `app.zeaz.dev`
- `pay.zeaz.dev`
- `treasury.zeaz.dev`
- `admin-wallet.zeaz.dev`

Require:

- MFA
- WebAuthn/hardware key policy
- session TTL <= 4h
- step-up authentication design
- geo restriction hooks
- JWT verification
- audit logging
- sensitive action re-authentication docs
- API Shield when Enterprise is available
- mTLS when Enterprise is available
- Bot protection when plan supports it

Finance policies must be stricter than AI platform policies.

Finance roles must not automatically grant AI publishing privileges.

---

## 13. AI Platform Security Requirements

For AI domains:

- `zveo.zeaz.dev`
- `studio.zeaz.dev`
- `analytics.zeaz.dev`

Require:

- MFA
- publishing RBAC
- AI abuse controls
- prompt injection mitigation documentation
- upload validation
- explicit API quotas
- edge rate limiting
- bot mitigation when plan supports it
- audit logging hooks

Publishing rule:

- `zveo-admin` can publish
- `zveo-publisher` can publish
- `zveo-creator` can draft but must not publish by default
- `zveo-analytics` is read-only

---

## 14. Workers and Edge Standards

Workers code must use strict TypeScript.

Workers must include safe primitives for:

- security headers
- request IDs
- structured JSON logs
- JWT verification hooks
- safe JSON error responses
- KV token bucket rate limiting
- Durable Object rate limiter option
- per-user quotas
- per-role quotas
- per-route quotas
- AI generation quotas
- publishing quotas
- upload quotas
- retry-after headers

Never use:

- `eval`
- `new Function`
- dynamic unsafe code execution
- secrets in `wrangler.toml.example`
- real `account_id` values in examples

Standard public error shape:

```json
{
  "ok": false,
  "error": {
    "code": "RATE_LIMITED|UNAUTHORIZED|FORBIDDEN|BAD_REQUEST|INTERNAL_ERROR",
    "message": "safe public message",
    "request_id": "..."
  }
}
```

---

## 15. Frontend and UI/UX Standards

All web interfaces must adhere to the **ZEAZ Platform System**.

### Core Requirements:
- **Rich Aesthetics**: Use Glassmorphism, backdrop blurs, and premium color palettes (as defined in `ui/design-system/tokens.css`).
- **Typography**: Primary font is `Outfit`. Fallback to `Inter` or system sans-serif.
- **Micro-animations**: Every interactive element must have a hover state, active state, and transition (minimum 200ms).
- **Responsive Design**: Mobile-first approach using CSS Grid and Flexbox.
- **Deterministic States**: Clear visual feedback for "Idle", "Loading", "Success", and "Error" states.

### Implementation Rules:
- **No Inline Styles**: Use design system tokens and utility classes.
- **Component-Based Architecture**: Organize UI logic into discrete components (even in Vanilla JS).
- **Security Headers**: All frontend applications must be served with strict security headers (CSP, HSTS, etc.).
- **Mock vs. Real**: Maintain clear separation between simulation logic (mocks) and production API integrations. Use environment-gated switches for connectivity.

---

## 16. DNS, Tunnels, and Networking Standards

DNS and tunnel configuration must cover:

- `auth.zeaz.dev`
- `zveo.zeaz.dev`
- `studio.zeaz.dev`
- `analytics.zeaz.dev`
- `app.zeaz.dev`
- `pay.zeaz.dev`
- `treasury.zeaz.dev`
- `admin-wallet.zeaz.dev`

Rules:

- no committed tunnel secrets
- no committed tunnel tokens
- no hardcoded production origin IPs
- no wildcard origin allowlist
- no allow-all network policy
- include catch-all 404 tunnel ingress rule
- support dev/staging environment-prefixed hostnames where applicable
- production hostnames remain clean

---

## 16. WAF and Abuse Protection Requirements

Generate and validate policies for:

- AI abuse
- prompt injection
- DDoS
- bot attacks
- API abuse
- credential stuffing
- Web3 attacks
- wallet abuse
- GraphQL abuse
- upload abuse
- publishing abuse

Enterprise-only rules must be gated by plan tier.

---

## 17. Monitoring, DR, and Security Tooling

Monitoring stack target:

- Prometheus
- Grafana
- Loki
- OpenTelemetry Collector
- Alertmanager

Dashboards and alerts should cover:

- auth failures
- WAF blocks
- bot attacks
- tunnel health
- JWT failures
- API latency
- Workers failures
- certificate expiration
- DNS propagation
- quota exhaustion
- cost anomalies

Security tooling target:

- SOPS
- age
- Trivy
- Semgrep
- Gitleaks
- Cosign
- Syft
- Grype

Signing must be optional and must never require committed keys.

SBOM output should be generated under `artifacts/sbom/` when tooling is available.

DR runbooks must cover:

- tunnel outage
- DNS hijacking
- JWT compromise
- token leakage
- WAF bypass
- SAML compromise
- DDoS
- Worker deployment failure
- certificate expiration
- SCIM failure

Every runbook must include:

- Summary
- Severity Matrix
- Detection Signals
- Immediate Containment
- Forensic Collection
- Rollback Procedure
- Recovery Procedure
- Validation
- Communications
- Postmortem Template
- Prevention Improvements

---

## 18. GitHub Actions Standards

Approved action versions:

- `actions/checkout@v4`
- `actions/upload-artifact@v4`
- `actions/setup-python@v5`
- `actions/setup-node@v4`
- `pnpm/action-setup@v4`
- `hashicorp/setup-terraform@v3`
- `opentofu/setup-opentofu@v1`
- `github/codeql-action/upload-sarif@v3`

Every workflow must have:

- explicit `permissions`
- `timeout-minutes` on every job
- concurrency where useful
- least-privilege permissions
- no secret printing
- no full environment dumps
- safe artifact upload behavior

Optional artifacts should use:

```yaml
if-no-files-found: warn
```

Apply workflows must:

- use `workflow_dispatch` only
- not run on pull requests
- not run on push
- require environment input
- require confirmation input
- use GitHub environment approval

No workflow may upload:

- `.env`
- secret-bearing `.tfvars`
- SOPS private keys
- tunnel credentials
- provider tokens
- private keys

---

## 19. Phase Plan

Agents must work incrementally. Do not attempt to implement the whole platform in one change.

### F0 — Repository Audit

Read current repo state. Produce inventory, blockers, and first commit plan.

### F1 — Context and Variables

Implement repo structure, runtime validation, `.env.example`, validation scripts, Python validators, tests, and README baseline.

### F2 — Terraform and OpenTofu Foundation

Implement module skeletons, root environments, backend templates, Makefile targets, and validation.

### F3 — Zero Trust and Identity

Implement Access apps, policies, SAML/OIDC config, RBAC, fintech policy, docs, and tests.

### F4 — DNS, Tunnels, and Networking

Implement DNS records, tunnel ingress, network policies, validation scripts, docs, and tests.

### F5 — Workers, Edge, and AI Gateway

Implement Workers foundation, AI Gateway config, rate limiting, JWT hooks, abuse controls, docs, and tests.

### F6 — Monitoring, DR, and Security Tooling

Implement monitoring configs, scanners, SBOM/signing scripts, backup/restore, DR runbooks, docs, and tests.

### F7 — GitHub Actions and GitOps Orchestration

Implement workflows, workflow policy tests, GitOps docs, environment approval docs, and CI validation.

### F8 — Final Integration and Release Candidate

Perform repository integrity audit, placeholder audit, policy hardening, docs finalization, security review, and PR preparation.

### F9 — Human Review and First Apply Readiness

Add manual Cloudflare/GitHub setup docs, token scope checklists, preflight scripts, readiness reports, and operator handoff.

### F10 — Controlled Deployment and Post-Deploy Review

Add deployment procedure, evidence collection, post-deploy reviews, service acceptance, go/no-go checklists, and signoff templates.

### F11 — Maintenance Automation and Quarterly Review

Add maintenance reports, review cadences, audit evidence collection, health score, dependency review, cost review, and continuous improvement docs.

### F12 — Final Documentation Pack and Long-Term Ownership Handoff

Create final audit package, ownership handoff, long-term operation model, release notes, and archival evidence bundle.

---

## 20. Validation Commands

Use the most relevant validation commands for the phase being changed.

Common baseline:

```bash
make validate
python3 -m pytest tests/
bash scripts/validate.sh --offline
```

Terraform/OpenTofu:

```bash
make tf-validate
make tofu-validate
```

Policy:

```bash
make policy-test
make zero-trust-validate
```

Networking:

```bash
make dns-validate
make tunnel-validate
make network-validate
make networking-validate
```

Workers/AI:

```bash
make workers-validate
make ai-gateway-validate
make edge-validate
```

Operations:

```bash
make monitoring-validate
make dr-validate
make ops-validate
```

GitOps:

```bash
make workflow-policy
make workflow-validate
make gitops-validate
```

Readiness and deployment:

```bash
make readiness-validate
make deployment-validate
```

Maintenance:

```bash
make maintenance-validate
```

If a command is not yet implemented for the current phase, add it only when appropriate for that phase.

---

## 21. Definition of Done

A phase is done only when:

- files are implemented, not just described
- docs match implementation
- no secrets are committed
- no fake production IDs are committed
- validation commands pass or failures are documented with exact root cause
- tests cover the added policy/config/script behavior
- apply/destroy operations remain guarded
- plan-gated features do not break lower-tier validation
- README or phase docs explain operator usage

---

## 22. Commit and PR Rules

Commit messages should be scoped by phase when possible:

- `feat(f1): add Cloudflare platform validation foundation`
- `feat(f2): add Terraform and OpenTofu foundation`
- `feat(f3): add Zero Trust identity and RBAC policies`
- `feat(f4): add DNS tunnel and networking foundation`
- `feat(f5): add Workers edge and AI Gateway foundation`
- `feat(f6): add monitoring security tooling and disaster recovery`
- `feat(f7): add GitOps workflows and CI policy gates`
- `chore(f8): prepare release candidate hardening`
- `docs(f9): add first apply readiness and operator handoff`
- `docs(f10): add controlled deployment and post-deploy review`
- `docs(f11): add maintenance automation and review cadence`
- `docs(f12): add final documentation pack and ownership handoff`

Pull requests must include:

- summary
- phase implemented
- files changed
- validation commands run
- security notes
- rollback notes
- manual setup required
- known limitations

Do not enable auto-merge.

Do not mark production-ready if validation fails.

---

## 23. Agent Behavior Rules

Before editing, inspect relevant files.

Prefer small, reviewable commits.

Keep changes phase-scoped.

Do not implement future phases unless explicitly requested.

If a task spans too much code, split it into smaller phase tasks.

If a safety rule conflicts with requested behavior, follow the safety rule and document the conflict.

If Cloudflare plan support is uncertain, gate the feature and document the required plan.

If external API behavior is uncertain, implement offline validation first and make API checks opt-in.

When fixing CI, fix root causes instead of hiding errors with warnings unless the artifact or scan is explicitly optional.

When adding generated files, ensure they are lintable, testable, and documented.

---

## 24. Final Instruction

This repository must evolve from specification to safe executable platform through phased, validated, reviewable changes.

Do not generate everything in one pass.

Do not simulate execution.

Do not pretend infrastructure was applied.

Do not claim production readiness without validation evidence.

Security, least privilege, GitOps safety, and human-controlled deployment come first.