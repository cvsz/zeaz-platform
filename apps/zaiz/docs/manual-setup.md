# ZeaZ Platform — Manual Setup Guide

This guide outlines the manual configurations required on Cloudflare and GitHub prior to the first automated deployment.

## 1. Cloudflare Configuration
- **Zero Trust:** Create Access applications for all domains listed in the Networking Guide.
- **Tunnels:** Provision `cloudflared` tunnels for all necessary origins and configure ingress rules with a catch-all 404 rule.
- **RBAC:** Setup SAML provider `zeazdev-ai-saml` and `zeazdev-finance-saml` as specified in the platform requirements.
- **Policies:** Ensure no allow-all Access policies.

## 2. GitHub Configuration
- **Environments:** Setup GitHub Environments (e.g., `production`, `staging`) and enable manual approval rules.
- **Secrets:** Configure the required runtime variables in GitHub Secrets/Variables (refer to Token Scope Checklist).
- **Settings:** Configure repository permissions for GitHub Actions.
