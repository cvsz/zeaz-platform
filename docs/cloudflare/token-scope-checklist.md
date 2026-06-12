# Cloudflare API Token Scope Checklist
**Repository:** `cvsz/zeaz-platform`  
**Security Tier:** Critical  

This document details the minimal permission scopes required for each specialized Cloudflare API token. Do not create global API keys or combine these scopes into a single token.

---

## 1. CLOUDFLARE_DNS_TOKEN
Used by dynamic DNS tools (like external-dns, ddclient) or deployment runners to manage zone records.
* **Permissions:**
  * `Zone` -> `DNS` -> `Edit`
* **Resources:**
  * `Include` -> `Specific Zone` -> `zeaz.dev`

---

## 2. CLOUDFLARE_WORKERS_TOKEN
Used by Wrangler and CI/CD pipelines to build, upload, and update Cloudflare Workers and associated KV/D1 databases.
* **Permissions:**
  * `Account` -> `Workers Scripts` -> `Edit`
  * `Account` -> `Workers KV Storage` -> `Edit`
  * `Account` -> `D1` -> `Edit`
  * `Account` -> `Queue` -> `Edit`
* **Resources:**
  * `Include` -> `All Accounts` (or specific account id)

---

## 3. CLOUDFLARE_ZT_TOKEN
Used to manage Cloudflare Zero Trust components, identity providers, and access policies.
* **Permissions:**
  * `Account` -> `Access: Apps and Policies` -> `Edit`
  * `Account` -> `Access: Device Posture` -> `Edit` (Enterprise only)
  * `Account` -> `Access: Organizations` -> `Edit`
* **Resources:**
  * `Include` -> `All Accounts`

---

## 4. CLOUDFLARE_WAF_TOKEN
Used to configure custom WAF rule-sets, rate-limiting rules, and Bot Management triggers.
* **Permissions:**
  * `Zone` -> `Zone WAF` -> `Edit`
  * `Zone` -> `Firewall Services` -> `Edit`
* **Resources:**
  * `Include` -> `Specific Zone` -> `zeaz.dev`

---

## 5. CLOUDFLARE_TUNNEL_TOKEN
Used by local/server daemons to authenticate and establish secure Cloudflared ingress tunnels.
* **Permissions:**
  * `Account` -> `Cloudflare Tunnel` -> `Edit`
* **Resources:**
  * `Include` -> `All Accounts`

---

## 6. CLOUDFLARE_R2_TOKEN
Used to manage object storage buckets, upload policies, and lifecycle rules.
* **Permissions:**
  * `Account` -> `R2 Storage` -> `Edit`
* **Resources:**
  * `Include` -> `All Accounts`

---

## 7. Audit & Validation Rules
1. Check token validity using the baseline check: `make token-verify`.
2. Do not log token variables in cleartext.
3. Rotate tokens every 90 days. Preserve tokens that match: `(^|[-_.])(zeaz[.]dev|bootstrap|audit|admin|ai[-_]?gateway)([-_.]|$)`.
