# Required Secrets and Runtime Environment Variables
**Repository:** `cvsz/zeaz-platform`  
**Security Tier:** Critical  

This document details the configuration standard and structure of all required environment variables for the platform.

---

## 1. Cloudflare Baseline Config
These variables are required for baseline provisioning, DNS management, and edge routing.

| Variable | Format | Purpose |
| :--- | :--- | :--- |
| `CLOUDFLARE_ACCOUNT_ID` | `^[a-f0-9]{32}$` | Cloudflare developer account identifier |
| `CLOUDFLARE_ZONE_ID` | `^[a-f0-9]{32}$` | DNS primary zone identifier |
| `CLOUDFLARE_API_TOKEN` | `^[A-Za-z0-9_-]{30,}$` | Core API token |
| `PRIMARY_DOMAIN` | `^[a-z0-9.-]+$` | E.g., `zeaz.dev` |

---

## 2. Identity Provider Config
Identity integration for SAML and Single Sign-On (SSO).

* `IDENTITY_PROVIDER_TYPE`: Identity federation architecture (e.g., `SAML`, `OIDC`).
* `IDENTITY_PROVIDER_VENDOR`: Supplier vendor name (e.g., `authentik`, `okta`, `azure`).
* `IDENTITY_PROVIDER_METADATA_URL`: Public HTTPS metadata URL endpoint.
* `SAML_IDP_METADATA_XML`: XML schema contents (highly sensitive; must be stored in secrets vault).

---

## 3. Deployment Environments
* `ENVIRONMENT`: Must be one of `dev`, `staging`, or `prod`.
* `REGION`: Target cloud compute zone (e.g., `ap-southeast-1`).
* `CLOUDFLARE_PLAN_TIER`: Set to `Free`, `Pro`, `Business`, or `Enterprise`. Gated resources (e.g., API Shield) will bypass provisioning if lower plan tiers are detected.

---

## 4. Key Management & Vaulting
* `SOPS_AGE_KEY`: Local decrypter key for age-encrypted YAML variables.
* `JWT_SECRET`: Signing token for Edge Rate Limiting middleware and API Gateways.
* `SECRET_ROTATION_INTERVAL`: Default duration before automated token rotation scripts trigger (e.g., `90d`).

---

## 5. Security Rules
1. Never commit a raw `.env` or `.env.cloudflare` file containing actual values.
2. In local dev environments, copy `.env.example` to `.env` and fill with test credentials.
3. In CI runners, map variables to repository secrets using Actions secrets parameters.
