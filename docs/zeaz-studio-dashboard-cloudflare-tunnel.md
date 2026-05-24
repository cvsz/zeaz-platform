# ZeaZ Studio Dashboard under Cloudflare: `zdash.zeaz.dev`

This runbook publishes the local ZeaZ Studio Dashboard service through Cloudflare Tunnel:

```text
https://zdash.zeaz.dev -> http://127.0.0.1:3006
```

Do not expose port `3006` directly to the internet. Keep the dashboard bound to loopback and let Cloudflare Tunnel proxy the public hostname.

## 1. Run the local dashboard service

```bash
cd ~/zeaz-platform/apps/zeaz-studio-dashboard
npm install
npm run build
npm run preview
```

The app should listen on:

```text
http://127.0.0.1:3006
```

Verify locally:

```bash
curl -I http://127.0.0.1:3006
```

## 2. GitOps tunnel reference

The expected tunnel ingress route is recorded in:

```text
tunnels/cloudflared/zeaz-platform.yml
```

Required route:

```yaml
- hostname: zdash.zeaz.dev
  service: http://127.0.0.1:3006
```

## 3. Load Cloudflare values from env files

The route script auto-loads these files when present:

```text
.env.cloudflare
.env
```

It also accepts an explicit file:

```bash
ops/bin/zeaz-cloudflare-zdash-route --env-file /secure/path/cloudflare.env
```

Required values after loading:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_TUNNEL_ID
```

Legacy fallback names are supported:

```text
CF_API_TOKEN or CF_BOOTSTRAP_TOKEN -> CLOUDFLARE_API_TOKEN
CF_ACCOUNT_ID -> CLOUDFLARE_ACCOUNT_ID
CF_TUNNEL_ID -> CLOUDFLARE_TUNNEL_ID
```

Example `.env.cloudflare` entries:

```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_TUNNEL_ID=your-tunnel-id
CLOUDFLARE_API_TOKEN=your-token-with-tunnel-edit-permission
```

Do not commit `.env.cloudflare`; it is ignored by git.

## 4. Apply route through Cloudflare API

```bash
cd ~/zeaz-platform
ops/bin/zeaz-cloudflare-zdash-route
```

The script preserves existing tunnel ingress routes and upserts only:

```text
zdash.zeaz.dev -> http://127.0.0.1:3006
```

## 5. Manual Cloudflare dashboard route

If API environment values are unavailable:

1. Open Cloudflare Zero Trust dashboard.
2. Go to **Networks > Tunnels**.
3. Select the production tunnel for `zeaz.dev`.
4. Add Public Hostname:
   - Subdomain: `zdash`
   - Domain: `zeaz.dev`
   - Type: `HTTP`
   - URL: `127.0.0.1:3006`
5. Save.

## 6. Open dashboard

Public Cloudflare URL:

```text
https://zdash.zeaz.dev
```

Local/direct URL on the server:

```text
http://127.0.0.1:3006
```

## 7. Health checks

```bash
curl -I http://127.0.0.1:3006
curl -I https://zdash.zeaz.dev
```

## 8. Troubleshooting

If `https://zdash.zeaz.dev` returns a Cloudflare error:

- Confirm the local service is running on `127.0.0.1:3006`.
- Confirm the tunnel connector is healthy.
- Confirm the Public Hostname route points to `http://127.0.0.1:3006`.
- Confirm no firewall blocks cloudflared from connecting to loopback.
- Review cloudflared logs on the origin host.
