# CI/CD and Supply Chain

## CI/CD goals

The repository is configured for security-first maintenance of a legacy LMS. CI/CD should prove that application changes preserve production Web.config posture, do not introduce obvious dependency or code security regressions, and produce traceable artifacts.

## GitHub configuration inventory

| Path | Purpose |
| --- | --- |
| `.github/workflows/ci.yml` | General CI workflow. |
| `.github/workflows/security*.yml` and related hardening workflows | Security scans, hardening, remediation, and control-plane automation. |
| `.github/workflows/build-and-package.yml` | Build/package automation. |
| `.github/workflows/deploy-staging.yml` | Staging deployment workflow. |
| `.github/codeql/codeql-config.yml` | CodeQL configuration. |
| `.github/dependabot*.yml` | Dependency update governance. |
| `.github/pull_request_template.md` | Required PR checklist. |
| `.github/ISSUE_TEMPLATE/*.yml` | Structured issue intake for defects, features, security controls, incidents, and compliance/governance evidence. |
| `.github/agents/*.prompt.yml` and `.github/copilot-instructions.md` | AI/agent guidance for repository work. |

## Mandatory supply-chain rules

- Pin GitHub Actions to immutable SHAs.
- Run CodeQL, Semgrep, Trivy, and dependency review where applicable.
- Generate SBOMs for releasable artifacts.
- Sign artifacts/container images and record provenance.
- Use ephemeral runners when possible.
- Avoid long-lived CI credentials.
- Do not expose secrets in logs, environment dumps, artifacts, or PR comments.
- Reject workflows from untrusted forks when privileged tokens or deployment paths are involved.

## z-runner fabric

`z-runner/` provides a hardened self-hosted GitHub Actions runner platform that uses GitHub App installation tokens rather than PATs.

High-level flow:

```text
GitHub Actions -> GitHub App JWT -> installation token -> ephemeral runner token -> hardened runner -> telemetry/SIEM
```

Key hardening features:

- GitHub App authentication with short-lived tokens.
- Ephemeral/rootless runner design.
- systemd services and watchdog automation.
- Kubernetes manifests with namespace isolation, NetworkPolicy, HPA, RuntimeClass, and PodSecurity controls.
- Falco, Kyverno/OPA, seccomp, AppArmor, and telemetry examples.

## Release artifact expectations

For any production release:

1. Build from a reviewed commit.
2. Validate DevExpress dependencies without downloading untrusted binaries.
3. Run repository readiness checks.
4. Produce SBOM/provenance for packaged artifacts.
5. Sign artifacts where supported.
6. Store artifacts in an approved registry/bucket with immutable retention.
7. Record deployment version and rollback instructions.


## Issue and PR governance

Structured intake is part of the supply-chain control surface because issue content can influence automation, triage, and remediation work.

- Keep issue templates focused on sanitized evidence, severity, affected area, reproduction criteria, validation commands, and rollback expectations.
- Do not allow public issue forms to collect secrets, student data, exploit payloads, production database records, or confidential audit evidence.
- Route vulnerability disclosures and active incidents to private security channels before public work tracking.
- Require PRs to cite the linked issue, tests run, security impact, and rollback notes before merge.
- Treat issue bodies, titles, labels, and comments as untrusted input; never execute them as shell, workflow expressions, or deployment parameters.

## Workflow review checklist

When editing `.github/workflows/*`:

- Actions are pinned to full-length commit SHAs.
- Permissions blocks use least privilege.
- No pull-request metadata is executed as shell.
- No secrets are available to untrusted fork events.
- Artifacts do not include secrets, database files, upload payloads, or full logs with credentials.
- Deployment jobs require protected branches/environments.
- Security scan failures are not ignored without documented risk acceptance.
