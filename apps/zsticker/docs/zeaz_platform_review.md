# Zeaz Platform Architecture & Code Review Overview

The `zeaz-platform` is a massive, enterprise-grade monorepo containing multiple full-stack applications, microservices, AI runtime components, and comprehensive Infrastructure-as-Code (IaC). 

Given the sheer scale of the repository (18+ applications, hundreds of services, and thousands of files), a full code review requires breaking down the system into its core domains. Below is the high-level review of the current ecosystem.

---

## 🏗️ 1. Core Platform Applications (`apps/`)

The repository hosts several major independent products and services:

*   **Fintech & Trading**:
    *   `zwallet`: Comprehensive digital wallet platform (Mobile + Backend + Admin Dashboard).
    *   `ztrader` / `zkbtrader`: Trading platforms with Python-based backends (`alembic`, `pytest`) and modern frontends.
    *   `zdash`: Centralized dashboard / operations portal.
*   **AI & Operations**:
    *   `zveo`: Full-stack application utilizing Drizzle ORM and Python microservices.
    *   `zsp-aitool`: Next.js & Prisma based AI tool management.
    *   `zoffice`: Complex environment management (features Kasm browser integrations and multiple bot scripts).
*   **Content & LMS**:
    *   `zlms`: Next.js Learning Management System with strict TypeScript configurations.
    *   `zAcademy`: Monorepo (Turborepo) for academy infrastructure.
*   **Microservices & Utilities**:
    *   `zcino`: High-performance Go-based API backend (`main.go`, `go.mod`).
    *   `zLinebot`: LINE Official Account integration services.
    *   `ABTPi18n`, `zsticker`: Standalone utility microservices (Python).
    *   `openwork`: A sprawling TS/JS Turborepo workspace.

## ⚙️ 2. Platform Infrastructure & Ops

The project strictly adheres to GitOps and Infrastructure-as-Code principles.

*   **Cloudflare Zero Trust (Terraform/OpenTofu)**: 
    *   Under `terraform/` and `opentofu/`, the platform provisions WAF, Access Policies, Tunnels, D1, R2, and Workers.
    *   Strict segregation of environments (`dev`, `staging`, `prod`).
*   **Security & Policies**:
    *   Located in `policies/` (Rego, YAML).
    *   The `AGENTS.md` strictly enforces no hardcoded secrets, no wildcard networks, and strict SAML/OIDC compliance for AI/Finance domains.
*   **CI/CD Pipeline**:
    *   Managed by an extensive `Makefile` (+700 lines) with specific release gates (e.g., Phase 50, Phase 51, Phase 60).
    *   Robust validation workflows (`make validate`, `make security-scan`, SBOM generation via `syft` and `cosign`).

## 🧠 3. AI Runtime Controller (`runtime/`)

A highly sophisticated, custom Python-based AI orchestration engine runs natively in the repository:
*   **Engines**: `convergence_engine.py`, `correlation_engine.py`, `predictive_failure_engine.py`.
*   **Governance**: Sandbox mutations (`mutation_sandbox.py`), replay engines, and action journals.
*   **LLM Routing**: `token_budget_engine.py` and `langgraph_integration.py` handle cost-aware model routing and execution.

---

## 🔍 Recommended Next Steps for Deep-Dive Reviews

Because reviewing the entire codebase in one pass is impossible to do thoroughly, I recommend we target specific areas. **Please let me know which area you would like to deep-dive into:**

1.  **Security & Infrastructure Audit**: 
    *   Review Cloudflare Terraform configurations, WAF rules, and Access Policies.
2.  **App-Specific Code Review**: 
    *   Choose a specific app (e.g., `apps/zwallet`, `apps/zcino`, or `apps/zlms`) and I will run specialized code reviewers for its language (Go, Python, TypeScript).
3.  **Run Automated Harness Audit**:
    *   Type `/harness-audit` in the chat to run the deterministic repository harness audit and get a prioritized scorecard.
4.  **Run Quality Gates**:
    *   Type `/quality-gate` to run the ECC quality pipeline on specific project scopes.
