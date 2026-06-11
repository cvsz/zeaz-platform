# ZeaZ Platform Development Roadmap

This document outlines the strategic roadmap for the ZeaZ Platform. It is divided into sequential phases focusing on open-source readiness, stabilization, security, deployment, and future features.

---

## Phase 1: Open Source Readiness (Current Phase)
*Goal: Prepare the codebase for secure, maintainable, and contributor-friendly open-source collaboration.*

- [x] Consolidate and clean up application paths (`zkbtrader` and `ABTPi18n` merged into `ztrader`).
- [x] Standardize directory naming conventions (rename `zlms-prod` to `zlms`).
- [x] Establish standard community files:
  - [x] `README.md` (Updated repository map and deployment guides)
  - [x] `LICENSE` (MIT)
  - [x] `SECURITY.md` (Vulnerability disclosure and secret policy)
  - [x] `CONTRIBUTING.md` (Developer workflows, branch conventions)
  - [x] `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1)
  - [x] `ROADMAP.md` (Strategic direction tracker)
- [x] Configure GitHub issue and pull request templates.
- [x] Build local CI-safe verification workflows (`oss-readiness.yml`).

## Phase 2: Platform Stabilization
*Goal: Ensure multi-application stacks run harmoniously with reliable local build processes.*

- [ ] Reconcile overlapping application ports and service allocations across the monorepo.
- [ ] Add unified compiler and lockfile checks via `make build-all-stacks`.
- [ ] Clean up redundant assets in legacy project directories.
- [ ] Stabilize dev server and daemon dependencies (e.g., PM2 / python-venv settings).
- [ ] Standardize local Docker and Docker Compose environment setup.

## Phase 3: Cloudflare Production Deployment
*Goal: Harden cloud infrastructure, access control, and routing using Cloudflare-native features.*

- [ ] Implement robust Zero Trust configurations and Cloudflare Tunnel maps.
- [ ] Optimize edge compute logic for Cloudflare Workers.
- [ ] Hardcode WAF rules for exposed apps and endpoints.
- [ ] Verify static routing configurations for the main `web` application and API interfaces.
- [ ] Document backup and restore routines for Cloudflare KV, D1, and R2 databases.

## Phase 4: Security Hardening
*Goal: Build automated threat detection and secure coding practices directly into the workflow.*

- [ ] Configure automatic secret detection workflows (e.g., git-secrets or Gitleaks).
- [ ] Set up automated dependency vulnerability scanning (Dependabot/Snyk).
- [ ] Build isolated network boundary maps for Docker containers.
- [ ] Refine production-only environment variables generation.
- [ ] Mandate strict GPG commit signatures across all maintainers.

## Phase 5: Developer Experience (DX)
*Goal: Make it easy for developers to spin up applications locally with minimal configuration.*

- [ ] Support Dev Containers for consistent local sandbox workspaces.
- [ ] Build a local diagnostic CLI utility to verify environment health and port mapping.
- [ ] Optimize workspace caches to accelerate local dependency installs (npm, pnpm, yarn, cargo, pip).
- [ ] Enhance log streaming and tracing between concurrent application runtimes.

## Phase 6: Community Growth
*Goal: Scale contributions and onboard new maintainers.*

- [ ] Write comprehensive API references for shared platform microservices.
- [ ] Build automated integration testing suites across services.
- [ ] Launch contributor bounty program for security and architecture stabilization tasks.
