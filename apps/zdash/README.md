# zDash

React/Vite dashboard for the zDash AI Agent System, exposed locally at `127.0.0.1:3006` and publicly through Cloudflare Tunnel at `https://zdash.zeaz.dev`.

This app replaces the old `apps/zeaz-studio-dashboard` path. Use `apps/zdash` for all new development.

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

## Production preview

```bash
npm install
npm run build
npm run preview
```

## Environment overrides

```bash
ZDASH_HOST=127.0.0.1 \
ZDASH_PORT=3006 \
npm run preview
```

Legacy names are still supported by Vite config for compatibility:

```text
ZEAZ_STUDIO_DASHBOARD_HOST
ZEAZ_STUDIO_DASHBOARD_PORT
```

## Validation

```bash
npm run lint
npm run build
```

## Integration registry

See:

```text
apps/zdash/integrations.registry.json
docs/zdash-integration-plan.md
```
