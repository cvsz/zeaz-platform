# ZeaZ Studio Dashboard

React/Vite dashboard for ZeaZ Studio AI Agent System, prepared for Cloudflare Pages deployment under `cvsz/zeaz-platform`.

## Local development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Validation

```bash
npm run lint
npm run build
```

## Cloudflare Pages

This app is configured with `wrangler.toml`, `_headers`, and `_redirects` for Cloudflare Pages.

Recommended project settings:

| Setting | Value |
|---|---|
| Project name | `zeaz-studio-dashboard` |
| Production branch | `master` |
| Root directory | `apps/zeaz-studio-dashboard` |
| Build command | `npm install && npm run build` |
| Output directory | `dist` |

Required GitHub secrets:

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Scoped Cloudflare token for Pages deployment |
| `CF_ACCOUNT_ID` | Cloudflare account ID |
