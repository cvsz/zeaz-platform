# zLMS Production Wiki

Welcome to the zLMS production wiki. This wiki documents the legacy Learning Management System, its security posture, operational runbooks, modernization assets, and maintenance workflows for the `cvsz/zlms-prod` repository.

> **Scope:** zLMS is a legacy ASP.NET Web Forms LMS for police training workflows. It includes course delivery, course-user views, assessments, QA/standards management, certificate/reporting flows, ebooks, multimedia, embedded knowledge/forum assets, SQL Server database backups, and a separate zero-trust GitHub Actions runner fabric.

## Quick navigation

| Page | Use it for |
| --- | --- |
| [Architecture Overview](Architecture-Overview) | System map, runtime stack, repo layout, and high-level request flow. |
| [Application Modules](Application-Modules) | Functional inventory of LMS areas and important Web Forms pages. |
| [Installation and Operations](Installation-and-Operations) | Ubuntu/Mono install path, DevExpress dependencies, readiness checks, and packaging. |
| [Database and Data Model](Database-and-Data-Model) | SQL Server connection model, known data stores, and table families inferred from source. |
| [Security Model and Hardening](Security-Model-and-Hardening) | Current security controls, known legacy risks, and review checklist. |
| [CI/CD and Supply Chain](CI-CD-and-Supply-Chain) | GitHub workflows, CodeQL/Semgrep/Trivy/SBOM expectations, and runner fabric. |
| [Modernization Roadmap](Modernization-Roadmap) | Safe migration path from legacy Web Forms/static assets to hardened runtime architecture. |
| [Troubleshooting](Troubleshooting) | Common build/runtime failures and diagnostic commands. |
| [Contributor Runbooks](Contributor-Runbooks) | Day-to-day commands, change boundaries, and PR expectations. |

## Repository facts

- **Primary app:** `app/lms.csproj`
- **Framework:** ASP.NET Web Forms targeting .NET Framework 4.6.1
- **Database:** SQL Server via the `cdas_conn` connection string
- **Licensed UI/reporting dependency:** DevExpress 16.2 assemblies expected from `../../lms-library` or `app/devexpress`
- **Primary install path:** Ubuntu 24.04 Mono compatibility mode through `./installer.sh --yes`
- **Security additions:** centralized upload validation, login rate limiting, structured security telemetry, strict cookies, secure headers, CSP, and release Web.config posture checks

## Wiki maintenance workflow

The canonical editable wiki source lives in `docs/wiki/`. To publish these pages to GitHub Wiki, copy or synchronize the Markdown files into the repository wiki git remote:

```bash
git clone https://github.com/cvsz/zlms-prod.wiki.git /tmp/zlms-prod.wiki
rsync -av --delete --exclude='.git/' docs/wiki/ /tmp/zlms-prod.wiki/
cd /tmp/zlms-prod.wiki
git add .
git commit -m "Document zLMS production wiki"
git push
```

If the wiki repository is private, run the publish step from an authenticated workstation or CI job with least-privilege write access to the wiki.
