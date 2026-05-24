# ZeaZ Studio Dashboard

React/Vite dashboard for ZeaZ Studio AI Agent System, prepared for local `zdash.zeaz.dev` service access and Cloudflare Pages deployment under `cvsz/zeaz-platform`.

## Local development

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3006
http://zdash.zeaz.dev:3006
```

The default Vite dev server binds to loopback only:

```text
127.0.0.1:3006
```

For LAN access while testing, use:

```bash
npm run dev:lan
```

## Production preview on local service port

```bash
npm install
npm run build
npm run preview
```

Open:

```text
http://127.0.0.1:3006
http://zdash.zeaz.dev:3006
```

## Environment overrides

```bash
ZEAZ_STUDIO_DASHBOARD_HOST=127.0.0.1 \
ZEAZ_STUDIO_DASHBOARD_PORT=3006 \
npm run preview
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
| Production branch | `main` |
| Root directory | `apps/zeaz-studio-dashboard` |
| Build command | `npm install && npm run build` |
| Output directory | `dist` |

Required Cloudflare environment names:

| Name | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare token for Pages deployment |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
