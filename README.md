# ZeaZ Platform

[![CI](https://github.com/cvsz/zeaz-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/cvsz/zeaz-platform/actions/workflows/ci.yml)
[![Validate](https://github.com/cvsz/zeaz-platform/actions/workflows/validate.yml/badge.svg)](https://github.com/cvsz/zeaz-platform/actions/workflows/validate.yml)
[![CodeQL](https://github.com/cvsz/zeaz-platform/actions/workflows/codeql.yml/badge.svg)](https://github.com/cvsz/zeaz-platform/actions/workflows/codeql.yml)
[![Secret Scanning](https://github.com/cvsz/zeaz-platform/actions/workflows/secret-scanning.yml/badge.svg)](https://github.com/cvsz/zeaz-platform/actions/workflows/secret-scanning.yml)
[![OSS Readiness](https://github.com/cvsz/zeaz-platform/actions/workflows/oss-readiness.yml/badge.svg)](https://github.com/cvsz/zeaz-platform/actions/workflows/oss-readiness.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ZeaZ Platform is a multi-application, Cloudflare-first monorepo designed for infrastructure automation, developer tools, edge deployments, and algorithmic trading systems. It hosts several integrated application stacks, deployment configuration scripts, and centralized operational tools.

## What the Platform Includes

The platform provides a unified workspace containing:
- **Web Frontend:** The main public portal built with Next.js (`apps/web`).
- **Developer Tools & Cockpit:** CloudPanel operations dashboard (`apps/zcloud`).
- **Algo Trading Engine:** Celery/FastAPI trading stack (`apps/ztrader`).
- **Lightweight APIs:** Microservice API routers (`apps/api`).
- **Automation & Daemons:** Chatbot triggers (`apps/zLinebot`) and image manipulation workflows (`apps/zsticker`).
- **Learning SaaS & Enterprise Modernization:** Academic dashboard (`apps/zAcademy`) and modern LMS interfaces (`apps/zlms`).
- **Monitoring Dashboard:** Internal operations and metrics dashboard (`apps/zdash`).
- **Shared Infrastructure:** Core OpenTofu/Terraform infrastructure-as-code files (`opentofu/`, `terraform/`), Cloudflare Tunnels, and Docker orchestration assets.

---

## Architecture Overview

ZeaZ Platform follows a decoupled, application-centric architectural model:
- **Isolated App Runtimes:** Each application under `apps/*` maintains its own standalone runtime environment, dependencies, local port maps, and command workflows. App-specific runtimes are *not* merged into a shared runtime.
- **Root Envelope Infrastructure:** Root-level orchestrations govern global resources—Cloudflare routing parameters, SSL configurations, network tunnels, global WAF rules, and local Docker compose networks.
- **Secured API Layer:** Shared platform APIs connect separate frontend surfaces while preserving permission boundaries.

```
┌────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                     │
│           (Tunnels, WAF, DNS Routing, Access)          │
└───────────────────────────┬────────────────────────────┘
                            │ (Secure Port Mapping)
┌───────────────────────────▼────────────────────────────┐
│                    ZeaZ Platform                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  apps/web    │  │  apps/zcloud │  │ apps/ztrader │  │
│  │ (Next.js)    │  │  (CloudPanel)│  │ (FastAPI/Cel)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  apps/api    │  │   apps/zlms  │  │  apps/zwallet│  │
│  │ (FastAPI)    │  │  (Modern LMS)│  │ (Node/pnpm)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## Repository Structure

```text
.
├── .github/              # CI/CD Workflows & GitHub Templates
├── apps/                 # Application Stacks
│   ├── api/              # Python FastAPI microservices
│   ├── openwork/         # Cowork agent workspace assets
│   ├── web/              # Next.js main web dashboard
│   ├── zAcademy/         # Node/pnpm educational portal
│   ├── zcino/            # Go + Postgres game services
│   ├── zcloud/           # Zeaz-branded CloudPanel cockpit
│   ├── zdash/            # FastAPI + Vite AI ops dashboard
│   ├── zLinebot/         # LINE automation chatbot daemon
│   ├── zlms/             # Modernized LMS interface
│   ├── zoffice/          # AI workspace dashboard
│   ├── zsp-aitool/       # Next.js SaaS automation panel
│   ├── zsticker/         # Image & asset generation script
│   ├── ztrader/          # Unified algo trading platform (merged)
│   ├── zveo/             # Video rendering & processing service
│   └── zwallet/          # Decentralized payments stack
├── configs/              # Global configuration variables & route maps
├── infrastructure/       # Global OpenTofu, Docker & Terraform setup
├── docs/                 # General operator documentation & runbooks
├── scripts/              # Shared deployment and validation scripts
└── Makefile              # Monorepo build and command orchestrator
```

---

## Quick Start

### Prerequisites
Make sure you have the following installed on your machine:
- Node.js (v18+ recommended) and `pnpm` (v8+)
- Python (v3.10+ recommended) and `pip`
- Docker and Docker Compose
- GNU Make

### 1. Clone the Repository
```bash
git clone https://github.com/cvsz/zeaz-platform.git
cd zeaz-platform
```

### 2. Configure Environment Variables
Copy the root example variables template:
```bash
cp .env.example .env
```
Ensure you also populate the application-specific envs if you plan to launch them (e.g., `apps/web/.env`).

### 3. Build the Entire Stack
To verify compiler checks and package dependency integrity across all monorepo applications:
```bash
make build-all-stacks
```

---

## Local Development

Each application can be run independently. Change directories into your target app and follow the local instructions:

```bash
# Run web client
cd apps/web
pnpm install
pnpm dev

# Run platform API
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Refer to the individual `README.md` files located in each `apps/*` subfolder for details on port configurations and script options.

---

## Docker Usage

The root of the repository provides containerized configuration files:
- Build and spin up all local backing services (e.g., PostgreSQL, Redis, local daemons):
  ```bash
  docker compose up -d --build
  ```
- View running containers:
  ```bash
  docker compose ps
  ```

---

## Cloudflare Deployment Notes

This repository is optimized for deployment on the Cloudflare network:
- **Cloudflare Tunnels:** Configured under `infrastructure/tunnels` to route traffic securely from the local container environment to specific hostnames (e.g., `zdash.zeaz.dev`).
- **Cloudflare Workers:** Edge code is deployed via Wrangler configs located in the `workers/` directory.
- **Routing & Domains:** Controlled via configuration maps inside `configs/platform/`.

---

## Security Model

Security is built directly into our operational guidelines:
- **No Committed Secrets:** Secrets are loaded strictly at runtime through `.env` configurations. All credentials must be absent from commits.
- **Strict Verification:** Commits must be GPG signed to verify identity before they are merged.
- **Access Control:** Dashboard user interfaces are protected behind Cloudflare Zero Trust policies.
- For vulnerability reports and disclosure procedures, see [SECURITY.md](SECURITY.md).

---

## Contributing

We welcome contributions to stabilize, improve, and add new features to the platform.
Please read [CONTRIBUTING.md](CONTRIBUTING.md) to understand our branch conventions, commit styling, and pull request testing pipeline.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Maintainer Note

We prioritize absolute separation of concerns. Do not commit test keys, database credentials, or third-party screenshots. Maintain runtime decoupling so that issue triage in one stack does not impact adjacent production components.
