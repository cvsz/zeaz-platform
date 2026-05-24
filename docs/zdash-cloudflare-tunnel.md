# zDash under Cloudflare: `zdash.zeaz.dev`

Public route:

```text
https://zdash.zeaz.dev -> http://127.0.0.1:3006
```

Keep port `3006` bound to loopback and let Cloudflare Tunnel publish the hostname.

## Run the local dashboard service

```bash
cd ~/zeaz-platform/apps/zdash
npm install
npm run build
npm run preview
```

Verify locally:

```bash
curl -I http://127.0.0.1:3006
```

## Apply or repair tunnel route

```bash
cd ~/zeaz-platform
ops/bin/zeaz-cloudflare-zdash-route
```

## Health checks

```bash
curl -I http://127.0.0.1:3006
curl -I https://zdash.zeaz.dev
```
