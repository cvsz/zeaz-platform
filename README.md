# ZeaZ Platform

ZeaZ Platform is a production-grade, GitOps-ready Cloudflare Zero Trust platform.

## Architecture & Standards
This project follows strict platform engineering standards. Please refer to:
- `GEMINI.md`: Authoritative operating guide.
- `SECURITY.md`: Security policy and alignment.

## Applications
The platform monorepo includes Cloudflare-facing apps under `apps/`, including
`apps/zdash` for the zDash cockpit and Cloudflare operations dashboard.

## Getting Started
See the [Installation Guide](docs/README.md) for environment setup and asset installation.

## Validation
Run platform validation:
```bash
make validate
```
