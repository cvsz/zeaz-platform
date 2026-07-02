# ZeaZ Web

Last updated: 2026-07-01

`apps/zeaz-web` is the production public web frontend for ZEAZDEV Company Limited at `zeaz.dev` inside `cvsz/zeaz-platform`.

## Stack

| Layer | Stack |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind/PostCSS project assets |
| Package manager | npm / pnpm lockfiles present |
| Route intent | `zeaz.dev`, Cloudflare Worker directory on `www.zeaz.dev` |

## Scope rule

This README documents only `apps/zeaz-web`. Do not mix commands from `apps/api`, `apps/zoffice`, `apps/zdash`, or other app stacks.

## Local development

```bash
cd /home/zeazdev/zeaz-platform/apps/zeaz-web
npm install
npm run dev
```

Open the local Next.js dev URL printed by the command.

## Build

```bash
cd /home/zeazdev/zeaz-platform/apps/zeaz-web
npm run build
```

## Validation

```bash
cd /home/zeazdev/zeaz-platform/apps/zeaz-web
npm run lint
npm run typecheck
npm run build
```

## Production surfaces

- `/` — ZEAZDEV Company Limited landing page for AI automation, Cloudflare edge operations, SaaS products, and developer platforms.
- `/#apps` — `apps/*` showcase covering current app workspaces as active `*.zeaz.dev` public directory entries.
- `/marketing` — SaaS product and subscription information.
- `/marketing/pricing` — digital service pricing.
- `/marketing/contact` — support and business contact.
- `/marketing/terms`, `/marketing/privacy`, `/marketing/refund` — legal and policy pages.
- `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` — generated Next.js metadata routes for crawler and install metadata.

## Security hardening

- `next.config.ts` applies CSP, HSTS, frame denial, MIME sniffing protection, referrer policy, DNS prefetch control, and restrictive permissions policy.
- `www.zeaz.dev` is currently Worker-owned by `workers/zeaz-loading` and renders the Cloudflare-served apps directory after deployment.
- `/dashboard/` and `/api/` are excluded from crawler indexing through `robots.ts`.
- The app does not require real Cloudflare credentials to build; operational credentials remain outside the public web runtime.

## Apps showcase source

The homepage showcase is aligned to the current repository inventory:

- top-level workspaces under `apps/*`
- public directory hostnames under `*.zeaz.dev`
- canonical URL list in `configs/platform/apps-public-url-list.json`
- published URL list documentation in `docs/apps-public-url-list.md`
- existing canonical hostnames from `configs/platform/apps-port-plan.json`
- route overlays from `configs/platform/apps-routing.json`, `configs/platform/zcfdash-route-overlay.json`, and `configs/platform/ztrader-route-overlay.json`

The showcase marks every current `apps/*` workspace as active in the public directory. This does not perform infrastructure mutation or prove a Cloudflare route is deployed; actual deployment remains governed by repo-level route configs and operator approval.

## Important files

```text
next.config.ts
package.json
src/
public/
tsconfig.json
```

## Security notes

- Do not commit `.env.local` or real provider secrets.
- Keep this app focused on the public web frontend.
- Platform routing and Cloudflare settings live at repo root/config docs, not inside this app unless explicitly required.
- Infrastructure mutation is not performed by this app. Cloudflare or GitOps changes require explicit operator approval through the repo-level workflow.
