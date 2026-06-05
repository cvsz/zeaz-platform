# zAcademy Enterprise Architecture

## Vision

Enterprise multi-tenant academy platform supporting learning, certification, automation, AI and competency systems.

## Domains

- learning-domain
- assessment-domain
- certification-domain
- ai-domain
- automation-domain
- blockchain-domain

## Principles

- Modular Monolith First
- Domain Isolation
- Event Driven Integration
- OIDC + RBAC
- Observability First
- Zero Trust
- Least Privilege

## Service Topology

platform-core
learning-domain
assessment-domain
certification-domain
analytics-domain
ai-domain

## Deployment

GitHub Actions
-> Artifact
-> ArgoCD
-> Kubernetes

## Security

- OWASP ASVS
- Secret Rotation
- Audit Trail
- SBOM
- SAST

## Future Expansion

- Competency Graph
- RAG Platform
- Skill Engine
- Multi Region Deployment
