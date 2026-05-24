# ZeaZ Studio Dashboard on `zdash.zeaz.dev:3006`

This runbook exposes the ZeaZ Studio Dashboard on the local service endpoint:

```text
http://127.0.0.1:3006
http://zdash.zeaz.dev:3006
```

## Run locally

```bash
cd ~/zeaz-platform/apps/zeaz-studio-dashboard
npm install
npm run dev
```

For production-like preview:

```bash
cd ~/zeaz-platform/apps/zeaz-studio-dashboard
npm install
npm run build
npm run preview
```

## DNS / hosts entry

If `zdash.zeaz.dev` should resolve locally on the server or workstation, add a hosts entry:

```bash
printf '%s\n' '127.0.0.1 zdash.zeaz.dev' | sudo tee -a /etc/hosts
```

Verify:

```bash
getent hosts zdash.zeaz.dev
curl -I http://127.0.0.1:3006
curl -I http://zdash.zeaz.dev:3006
```

## systemd service

Create a service file:

```bash
sudo tee /etc/systemd/system/zeaz-studio-dashboard.service >/dev/null <<'EOF'
[Unit]
Description=ZeaZ Studio Dashboard local service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=zeazdev
WorkingDirectory=/home/zeazdev/zeaz-platform/apps/zeaz-studio-dashboard
Environment=NODE_ENV=production
Environment=ZEAZ_STUDIO_DASHBOARD_HOST=127.0.0.1
Environment=ZEAZ_STUDIO_DASHBOARD_PORT=3006
ExecStartPre=/usr/bin/npm install
ExecStartPre=/usr/bin/npm run build
ExecStart=/usr/bin/npm run preview
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=false

[Install]
WantedBy=multi-user.target
EOF
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now zeaz-studio-dashboard
sudo systemctl status zeaz-studio-dashboard --no-pager
```

Check logs:

```bash
journalctl -u zeaz-studio-dashboard -f
```

## Cloudflare Tunnel ingress example

If using `cloudflared`, route the hostname to the local service without exposing port `3006` publicly:

```yaml
ingress:
  - hostname: zdash.zeaz.dev
    service: http://127.0.0.1:3006
  - service: http_status:404
```

With this mode, the public URL is normally:

```text
https://zdash.zeaz.dev
```

The explicit port URL remains local/direct:

```text
http://zdash.zeaz.dev:3006
```

## Firewall note

For loopback-only operation, do not open port `3006` publicly. If direct LAN access is required, run `npm run preview:lan` and allow the port only from trusted source IPs.
