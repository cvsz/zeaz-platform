# ZeaZ Platform — Networking & Connectivity Guide

This guide outlines the standards for DNS and Tunnel configuration within the ZeaZ Platform, ensuring adherence to Cloudflare Zero Trust principles.

## 1. Core Principles
- **Least Privilege:** Tunnels must only expose necessary origins.
- **Security First:** No wildcard allow-all policies.
- **GitOps Ready:** All configurations should be deterministic and managed via code where possible.
- **Placeholder Policy:** No real production secrets or origin IPs committed to code.

## 2. Supported Hostnames
The platform currently services the following domains:
- `auth.zeaz.dev`
- `zveo.zeaz.dev`
- `studio.zeaz.dev`
- `analytics.zeaz.dev`
- `app.zeaz.dev`
- `pay.zeaz.dev`
- `treasury.zeaz.dev`
- `admin-wallet.zeaz.dev`

## 3. Tunnel Configuration Standards
- Every tunnel must include a catch-all 404 rule at the end of the ingress rules.
- Tunnel credentials and tokens must **NEVER** be committed to the repository.
- Use environment-prefixed hostnames for non-production environments (e.g., `dev.app.zeaz.dev`).

## 4. Validation Procedure
Before any network configuration change:
1. Verify the configuration using offline validation scripts (`make network-validate`).
2. Ensure no hardcoded secrets or production IPs are present.
3. Validate against the Cloudflare plan matrix (Free/Pro/Business/Enterprise).

---
*Refer to the primary project GEMINI.md for full operational directives.*
