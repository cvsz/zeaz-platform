# ZeaZ Studio Dashboard Cloudflare Pages Deployment

This document describes the Cloudflare Pages deployment for the React/Vite ZeaZ Studio dashboard under `apps/zeaz-studio-dashboard`.

## Local development

```bash
cd apps/zeaz-studio-dashboard
npm install
npm run dev
```

## Production build

```bash
cd apps/zeaz-studio-dashboard
npm install
npm run lint
npm run build
```

Build output:

```text
apps/zeaz-studio-dashboard/dist
```

## Cloudflare Pages settings

| Setting | Value |
|---|---|
| Project name | `zeaz-studio-dashboard` |
| Production branch | `master` |
| Build command | `npm install && npm run build` |
| Build output directory | `dist` |
| Root directory | `apps/zeaz-studio-dashboard` |
| Node version | `22` |

## Required GitHub secrets

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare scoped token with Pages deploy permission |
| `CF_ACCOUNT_ID` | Cloudflare account ID |

Use scoped Cloudflare API tokens only. Do not commit token values, account IDs, zone IDs, tunnel IDs, or private keys.

## Manual deployment

```bash
cd apps/zeaz-studio-dashboard
npm install
npm run lint
npm run build
npx wrangler pages project create zeaz-studio-dashboard --production-branch=master || true
npx wrangler pages deploy dist --project-name=zeaz-studio-dashboard --branch=master --commit-dirty=true
```
