# Security Policy

## Supported Versions

Security updates are provided for the latest commit on the default branch and the latest tagged release.

## Reporting a Vulnerability

If you discover a security vulnerability, report it **privately** using GitHub Security Advisories:

1. Open the repository on GitHub.
2. Go to **Security** → **Advisories**.
3. Click **Report a vulnerability**.
4. Provide reproduction steps, affected scope, and potential impact.

If GitHub private reporting is unavailable, email **security@zeaz.dev** with:

- Vulnerability summary
- Affected paths/modules
- Proof of concept or reproduction steps
- Recommended remediation

Do **not** open public issues for security vulnerabilities.

## Disclosure and Response Targets

- Initial acknowledgment: within 2 business days
- Triage and severity assessment: within 5 business days
- Status updates: at least weekly until resolved
- Coordinated disclosure: after patch validation and deployment

## Hardening Baseline

This repository enforces:

- ShellCheck validation in CI
- Optional local security scanning via Trivy, Gitleaks, Semgrep, and SBOM tooling
- Least-privilege automation tokens
- Drift detection support via Make targets and scripts
