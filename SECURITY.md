# Security Policy

We take the security of the ZeaZ Platform seriously. This document outlines our security policies, including supported versions, how to report vulnerabilities, and security best practices.

## Supported Versions

Only the latest active development branch and release versions are actively supported with security patches:

| Version | Supported |
| ------- | --------- |
| Main (development) | :white_check_mark: Yes |
| < 1.0.0 | :x: No |

We recommend keeping your deployments aligned with the latest stable commit on the `main` branch.

## Scope

The scope of this security policy covers:
- Core platform architecture and configuration (`Makefile`, scripts)
- Infrastructure-as-code configuration (`opentofu`, `terraform`)
- Shared services and Cloudflare setups (`workers`, `zero-trust`, `tunnels`, `waf`)
- Configuration and secrets templates (`.env.example`)
- Monorepo integration code and routing logic in `apps/*`

### Out of Scope
- Third-party dependencies and upstream libraries (unless misconfigured by our implementation)
- Custom local runtime databases and test credentials
- Minor non-exploitable bugs or feature requests

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not disclose it publicly** through GitHub Issues or public pull requests.

Instead, please report it through one of the following methods:
1. **GitHub Security Advisories:** Navigate to the "Security" tab of the repository on GitHub and select "Report a vulnerability" to open a private advisory.
2. **Contacting Maintainers:** If a private advisory cannot be used, please contact the maintainers via the primary contact details found in the project's organization profile.

### Responsible Disclosure Process

Once a report is received:
1. **Triage:** We will acknowledge the receipt of your report within 48 hours and perform a preliminary triage.
2. **Investigation & Fix:** If confirmed, we will work on a patch in a private branch/fork.
3. **Validation:** We will validate the remediation steps.
4. **Release:** We will coordinate the release of the security update and publish a security advisory.

## Secret Handling Guidance

To prevent credentials from leaking into the repository:
- **Never commit secrets:** Do not commit API keys, private keys, database passwords, or session tokens.
- **Use Template Files:** Use the provided `.env.example` templates to configure your local setup. Keep your active `.env` files untracked (safely ignored by `.gitignore`).
- **GPG Signing:** Maintainers are required to sign commits using GPG to ensure author authenticity.
- **Audit Logs:** We periodically run checks to scan for credentials and audit permission models.

## Dependency Security Expectations

- Keep dependencies updated using secure package manager configurations.
- Run `npm audit` or equivalent dependency scanning before submitting PRs.
- Avoid introducing unverified or obsolete libraries to the core platform or application stacks.
