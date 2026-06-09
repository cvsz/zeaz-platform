# zLMS-prod

Last updated: 2026-06-10

`apps/zlms-prod` is the legacy LMS production stack inside `cvsz/zeaz-platform`. It contains ASP.NET Web Forms legacy assets plus migration, security, and modernization documentation for Ubuntu/server deployment planning.

## Stack

| Layer | Stack |
|---|---|
| Legacy app | ASP.NET Web Forms / IIS-era assets |
| Modernization assets | Next/security TypeScript files and middleware assets |
| Security docs | ATTACK_SURFACE, THREAT_MODEL, INCIDENT_RESPONSE, SECURITY reports |
| Deployment docs | INSTALLER, UBUNTU_24_04_MANUAL, migrations, k8s |
| Route intent | `zlms.zeaz.dev` |

## Scope rule

This README documents only `apps/zlms-prod`. Do not mix zOffice, zDash, zWallet, or zTrader commands into this legacy LMS stack.

## Operator notes

Use this app as a migration-controlled production stack. Validate legacy behavior, security patches, deployment scripts, and migration docs before changing runtime behavior.

## Important files

```text
app/
frontend/
db/
migrations/
k8s/
installer.sh
INSTALLER.md
UBUNTU_24_04_MANUAL.md
ATTACK_SURFACE.md
THREAT_MODEL.md
INCIDENT_RESPONSE.md
SECURITY_REPORT.md
SECURITY_PATCHES.md
QUALITY_REPORT.md
```

## Security notes

- Treat this as a high-risk legacy production app.
- Review attack surface and threat model before deployment.
- Do not commit production database credentials.
- Keep security middleware and CSP/trusted-types changes audited.
- Prefer staged migration and rollback planning before public cutover.
