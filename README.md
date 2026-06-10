# ZeaZ Platform

Last updated: 2026-06-10

`cvsz/zeaz-platform` is the ZeaZ monorepo for Cloudflare-first infrastructure, app routing, local/self-hosted services, and imported CVSZ application stacks. Each app under `apps/*` keeps its own stack, commands, ports, security notes, and deployment workflow. Do not merge app-specific stacks into one shared runtime unless a future migration explicitly says so.

## Operating rule

```text
root README = platform map and operator entrypoint
apps/* README = each app's own stack, own commands, own runtime notes
```

## Current repository layout

The repository contains app stacks under `apps/`, shared platform configs under `configs/`, Cloudflare/infra assets under `infra/` and `infrastructure/`, and operational docs under `docs/` and `reports/`.

## App stack inventory

| App | Path | Primary stack | Runtime / purpose | README status |
|---|---|---|---|---|
| ABTPi18n | `apps/ABTPi18n` | Python + pnpm workspace | Auto Bot Trader Pro i18n / strategy support | Updated app README |
| api | `apps/api` | Python FastAPI | Lightweight platform API routers | README generated if missing |
| openwork | `apps/openwork` | Node / pnpm monorepo | Open-source cowork / agent desktop-style platform | Updated app README |
| web | `apps/web` | Next.js / TypeScript | Main ZeaZ public web frontend | Updated app README |
| zAcademy | `apps/zAcademy` | Node / pnpm monorepo | Academy / learning SaaS platform | Updated app README |
| zcino | `apps/zcino` | Go + PostgreSQL + Redis | Game catalog / casino-style service | Updated app README |
| zdash | `apps/zdash` | FastAPI + React/Vite + Docker | Safety-first AI ops and trading dashboard | Updated app README |
| zkbtrader | `apps/zkbtrader` | Python + Node harness | Crypto research / paper trading | Updated app README |
| zLinebot | `apps/zLinebot` | Node/Python/Docker mixed stack | LINE bot automation platform | README generated if missing |
| zlms-prod | `apps/zlms-prod` | ASP.NET legacy + Next/security modernization assets | LMS production migration stack | Updated app README |
| zoffice | `apps/zoffice` | Python static server + OpenClaw/Hermes adapters | AI office dashboard | Updated app README |
| zsp-aitool | `apps/zsp-aitool` | Next.js + Prisma + Vitest | AI tool SaaS / dashboard app | README generated if missing |
| zsticker | `apps/zsticker` | Python automation | LINE sticker/image automation | Updated app README |
| ztrader | `apps/ztrader` | FastAPI + Next.js + Celery/Postgres | Multi-language algo trading platform | Updated app README |
| zveo | `apps/zveo` | Node/pnpm + Python services | AI/video/service platform | README generated if missing |
| zwallet | `apps/zwallet` | Node/pnpm + backend services | Wallet, payments, swap, mobile/admin stack | Updated app README |

## Root platform responsibilities

Root-level files control the platform envelope only:

- Cloudflare routing and tunnel planning
- app port mapping and domain ownership
- shared infrastructure docs and runbooks
- root-level Docker/compose orchestration where explicitly defined
- repo-level audits, reports, prompts, and generated inventories

Do not put app-local runtime data, app-local secrets, app-local generated reports, or app-specific lock files at root unless the app README or a platform migration explicitly requires it.

## Common operator flow

```bash
git pull --ff-only origin main

# inspect repo-level map
sed -n '1,220p' README.md

# operate each app inside its own path
cd apps/<app-name>
cat README.md
```

## Safety and security baseline

- No real secrets in git.
- Keep `.env`, runtime data, generated logs, pid files, and local databases out of commits.
- Use app-local README commands before running a stack.
- Keep live trading, real payments, real posting, SMS, IoT, and external provider actions explicitly gated by the app's own safety controls.
- Prefer dry-run, local, or paper mode by default.
- Use Cloudflare Access / private networking for sensitive dashboards.

## Latest platform updates

- zOffice now has app-local runtime paths, safe feature env generation, license operator helpers, license receipt integrity hardening, and branding migration tooling.
- zDash has safety-first local feature env generation, local port alignment, hardened Docker compose defaults, backend host/CORS alignment, and Makefile operational targets.
- README files are being normalized so each app documents only its own stack and does not copy commands from other apps.

## Quick links

```text
apps/ABTPi18n/README.md
apps/api/README.md
apps/openwork/README.md
apps/web/README.md
apps/zAcademy/README.md
apps/zcino/README.md
apps/zdash/README.md
apps/zkbtrader/README.md
apps/zLinebot/README.md
apps/zlms-prod/README.md
apps/zoffice/README.md
apps/zsp-aitool/README.md
apps/zsticker/README.md
apps/ztrader/README.md
apps/zveo/README.md
apps/zwallet/README.md
```
