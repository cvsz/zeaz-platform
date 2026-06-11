# Cloudflare Security Headers Inventory

Generated: 2026-06-11T20:39:21Z
Commands: `infra/cloudflare/scripts/scan-security-headers-governance.sh --markdown`

## Purpose
Scanner for Security headers governance.

## Inventory
| File | Header / Control | Owner Signal | Value Signal | Risk | Recommendation |
|---|---|---|---|---|---|
| Repo Wide | Strict-Transport-Security | none | <redacted> | hsts-review-required | Add HSTS evidence |
| Repo Wide | HTTPS Redirect | none | <redacted> | missing-https-redirect | Add HTTPS redirect evidence |
