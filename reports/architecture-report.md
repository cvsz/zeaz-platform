# ZEAZ PLATFORM OMEGA - Architecture Report

## Current State Analysis
The repository currently contains a monolithic blend of apps, infrastructure, and runtime logic. Key architectural observations:

1. **Monorepo Complexity**: The repository houses numerous independent applications (`apps/ABTPi18n`, `apps/openwork`, `apps/zLinebot`, `apps/zdash`, etc.) alongside global infrastructure configurations.
2. **Infrastructure Fragmentation**: Infrastructure definition is fragmented across:
   - `terraform/`
   - `opentofu/`
   - `infra/`
   - `infrastructure/`
   - `configs/cloudflare/`
3. **Container Orchestration**: Docker Compose is heavily used, but definitions are scattered (`compose/`, `docker-compose.yml` in root, within `apps/`, and within `infra/`).
4. **Agentic Control**: The `runtime/` and `controllers/` directories suggest a custom Python-based execution and convergence engine (LangGraph/LLM based).

## Target Architecture (OMEGA)
The future state standardizes on a modular, Terraform-first GitOps architecture with autonomous agentic control:

```
zeaz-platform/
├── ai/              # AI providers and LLM routing
├── agents/          # Autonomous DevSecOps agents
├── apps/            # Application source code
├── docs/            # Architecture and runbooks
├── infra/           # Terraform/OpenTofu root (Single Source of Truth)
├── monitoring/      # Prometheus, Grafana, Loki stacks
├── scripts/         # Utility scripts
├── security/        # OPA, Rego policies, and compliance scanning
├── tests/           # Integration and E2E tests
├── .github/         # Reusable CI/CD workflows
├── Makefile         # Standardized entrypoint
└── README.md
```

## Key Transitions
1. **Infrastructure as Code**: Consolidate `opentofu` and `terraform` into `infra/`. Ensure single source of truth.
2. **Cloudflare Management**: Transition from `scripts/` and duplicate YAML files into a unified `terraform/cloudflare` module.
3. **Identity Provider**: Replace scattered auth configurations with a unified `Authentik` stack deployed via Terraform/Kubernetes.
4. **Observability Pipeline**: Standardize on Prometheus, Loki, Tempo, and OpenTelemetry.
