# Omega Agent Matrix

This document provides a comprehensive reference of all agents and skills available in the Omega Master ecosystem under the `zeaz-platform` project.

---

## Active Omega Agents

| Agent Name | Description / Primary Role | Key Instructions & Rules |
|:---|:---|:---|
| **omega-master-orchestrator** | Master autonomous coordinator for repo discovery, planning, implementation, validation, and final release. | Inspect before editing; create phased plans; keep changes scoped; run validation and report. |
| **omega-ai-agent-integrator** | Integrates AI models, AI Gateway configurations, Worker AI runtimes, and local inference models. | Enforce structured API responses; validate rate limits and gateway routing; manage prompt safety. |
| **omega-backend-engineer** | Core backend systems implementation including FastAPI, Express, REST APIs, and event workers. | Standard response envelopes; explicit error-handling; model validation (Pydantic/Zod). |
| **omega-compliance-meta-agent** | Monitors regulatory parameters, compliance policies, audit logs, and controls security frameworks. | Strict data residency compliance, verify sanitization checks, enforce RBAC mapping controls. |
| **omega-database-engineer** | Manages database schemas, SQL optimizations, migrations (Prisma/Alembic/Exposed), and caching. | SQL injection mitigation; verify index usage; test migration rollbacks; structure connection pools. |
| **omega-devops-cloudflare** | Automates Cloudflare Zero Trust, access policies, WAF rule sets, Tunnel configs, and DNS. | Zero-secrets in repo; WAF plan tier compliance checks; fallback for non-Enterprise plan limits. |
| **omega-docs-runbook-writer** | Authors system documentation, operation runbooks, DR plans, and architecture codemaps. | Strictly format runbooks; include containment, forensic collection, and communication templates. |
| **omega-frontend-engineer** | Builds beautiful, glassmorphic interfaces following the ZEAZ Design System and Outfit typography. | Mobile-first approach; no inline styles; use central design system CSS tokens; handle loading/idle states. |
| **omega-github-projects-agent** | Handles workspace issues, task status updates, pull requests validation, and release notes integration. | Conventional commits verification; parse issues/PR descriptions; checklist compliance. |
| **omega-local-ai-engineer** | Optimizes local model setups, on-device capabilities, and lightweight edge worker models. | Memory-limit validation; optimized model quantizations; fallback routes when offline. |
| **omega-product-architect** | Aligns specifications, PRDs, user requirements, and technical constraints into actionable plans. | Lean problem-first PRDs; identify cross-application monorepo dependencies. |
| **omega-qa-release-engineer** | Leads end-to-end integration testing, Playwright E2E suites, quality gates, and release candidate validation. | Enforce 80%+ coverage; verify edge cases; simulate network failures; validation gate enforcement. |
| **omega-repo-architect** | Governs apps/* monorepo rules, file hierarchies, shared dependencies, and workspace cleanliness. | Enforce apps/ scope; central environment variables rule; forbid top-level application creations. |
| **omega-security-engineer** | Coordinates threat modeling, static scans (Semgrep, Trivy, Gitleaks), and token separation. | Global API token audits; no credentials in code; safe public error shapes; secure headers checking. |
| **omega-sre-observability** | Configures Prometheus, Grafana, Loki dashboards, and operational alert triggers. | Dashboard schema validation; cost anomaly metrics tracking; auth failure rate thresholds. |

---

## Workspace Customization Rules
Agents must align with the general guidelines in `AGENTS.md` and `GEMINI.md` to ensure zero secrets leakage, strict plan validations, and GPG-finalize commits workflow.
