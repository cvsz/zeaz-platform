# CHANGELOG

## [1.1.0] - 2026-06-21
### Added
- **Human-in-the-Loop Approvals (`zfbauto`):** Approval flow gating AI-generated content to `pending_review` queue status before posting.
- **Notification Hooks (`zfbauto`):** Line Notify and Discord Webhook notifications for new approval queue items.
- **Multi-Page Support (`zfbauto`):** Concurrent posting, page selector interface, and page-specific queues and scheduler.
- **Secure Token Vault (`zfbauto`):** Transparent AES-256-GCM encryption of Page Access Tokens at rest.
- **Role-Based Access Control (`zfbauto`):** Authentication sessions with `admin`, `editor`, and `viewer` roles to protect backend APIs and dynamically adapt UI.

## [1.0.0] - 2026-06-17
### Added
- Canonical Omega Master directory structure (.gemini/).
- Zero Trust infrastructure scaffolding (Gated Free-tier).
- Automated CI/CD security and validation workflows.
- Comprehensive platform documentation and runbooks.
- IaC foundations for Terraform and OpenTofu.
- DNS and Tunnel routing registry.

