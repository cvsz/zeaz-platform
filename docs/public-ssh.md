# Public SSH through Cloudflare Tunnel / Zero Trust

This guide documents the automated SSH origin and Cloudflare Tunnel route helpers for the public hostname:

```text
ssh.zeaz.dev -> ssh://127.0.0.1:22022
```

The design keeps SSH bound to loopback on the origin and exposes it only through the existing Cloudflare Tunnel plus a Cloudflare Access policy. Do not commit tunnel credentials, API tokens, private keys, or generated SSH private keys.

## Files and Make targets

| Purpose | Command |
| --- | --- |
| Configure hardened local OpenSSH origin | `make ssh-origin-setup` |
| Check local OpenSSH origin health | `make ssh-origin-health` |
| Upsert or print Cloudflare route instructions | `make ssh-route` |
| Check client/public Cloudflare Access SSH readiness | `make ssh-public-health` |

The scripts live in `ops/bin/`:

- `ops/bin/zeaz-ssh-origin-setup`
- `ops/bin/zeaz-ssh-origin-health`
- `ops/bin/zeaz-cloudflare-ssh-route`
- `ops/bin/zeaz-ssh-public-health`

## Server setup

Run the origin setup on the SSH server that is reached by the Cloudflare Tunnel connector:

```bash
sudo make ssh-origin-setup
```

The setup script is intentionally conservative:

- backs up `/etc/ssh/sshd_config` before editing;
- prefers `/etc/ssh/sshd_config.d/99-zeaz-public-ssh.conf` when the main config already includes drop-ins;
- otherwise updates a clearly marked managed block in `/etc/ssh/sshd_config`;
- adds `Port 22022` and `ListenAddress 127.0.0.1:22022` without removing existing SSH ports;
- applies these hardening settings:
  - `PermitRootLogin no`
  - `PubkeyAuthentication yes`
  - `PasswordAuthentication no`
  - `KbdInteractiveAuthentication no`
  - `X11Forwarding no`
- runs `sshd -t` before reloading or restarting SSH;
- does not print secrets or private key material.

After setup, verify the local origin:

```bash
make ssh-origin-health
```

Expected successful checks include valid `sshd` syntax, hardened effective settings, an active SSH service, and a listener on port `22022`.

## Cloudflare Tunnel route

The route helper supports two modes.

### Mode 1: Manual dashboard instructions

If Cloudflare API environment variables are not set, the script does not mutate Cloudflare and prints manual steps:

```bash
make ssh-route
```

Manual route values:

- Public hostname: `ssh.zeaz.dev`
- Service type: `SSH`
- Service URL: `127.0.0.1:22022`

In the Cloudflare Zero Trust dashboard:

1. Open **Networks > Tunnels**.
2. Select the existing production tunnel for `zeaz.dev`.
3. Add a public hostname for `ssh.zeaz.dev` with service `ssh://127.0.0.1:22022`.
4. Save without changing existing tunnel routes.
5. Add or verify a Cloudflare Access application for `ssh.zeaz.dev` with least-privilege policy rules.

### Mode 2: API-assisted upsert

When all of these variables are present, the route helper reads the existing remotely-managed tunnel configuration and upserts only the `ssh.zeaz.dev` ingress entry:

```bash
# Set CF_ACCOUNT_ID, CF_TUNNEL_ID, and CF_API_TOKEN from a secure operator shell.
# Do not commit them, echo them, or write them into repository files.
make ssh-route
```

The token must be purpose-scoped for Cloudflare Tunnel configuration. The script preserves existing ingress routes, keeps catch-all routes last, and does not print the token.

> Note: this script updates remotely-managed tunnel ingress configuration through the Cloudflare API. If the tunnel is locally managed by a connector config file, use the manual dashboard process or update the connector configuration through the repository's normal GitOps path instead.

## Client `~/.ssh/config`

Install `cloudflared` on the client machine, then add an SSH host alias:

```sshconfig
Host zeaz-platform
  HostName ssh.zeaz.dev
  User example-admin
  ProxyCommand cloudflared access ssh --hostname %h
  PubkeyAuthentication yes
  IdentitiesOnly yes
  IdentityFile ~/.ssh/id_ed25519
```

Replace `example-admin` with the local Linux account that is authorized on the origin host. Keep private keys in the client user's `~/.ssh/` directory and never commit them.

## Test command

After server setup, Cloudflare Tunnel routing, Access policy configuration, and client config are complete, test with:

```bash
ssh zeaz-platform
```

The first connection may open a Cloudflare Access browser login flow. Complete the login with an identity that is allowed by the Access policy for `ssh.zeaz.dev`.

## Troubleshooting

### Cloudflared status

On the origin server, check connector health:

```bash
cloudflared tunnel info
cloudflared status
systemctl status cloudflared
journalctl -u cloudflared --no-pager -n 100
```

If the tunnel is not connected, restore connector health before debugging SSH. Do not rotate or print tunnel tokens in logs.

### SSH service status

On the origin server:

```bash
make ssh-origin-health
systemctl status ssh
systemctl status sshd
journalctl -u ssh --no-pager -n 100
journalctl -u sshd --no-pager -n 100
```

Only one of `ssh` or `sshd` may exist, depending on the distribution.

### Port `22022` check

On the origin server:

```bash
ss -ltn | grep ':22022'
nc -zv 127.0.0.1 22022
```

If port `22022` is not listening, run `sudo sshd -t -f /etc/ssh/sshd_config` and review the most recent backup created by `zeaz-ssh-origin-setup`.

### Cloudflare Access login issues

On the client:

```bash
make ssh-public-health
cloudflared access ssh --hostname ssh.zeaz.dev --help
ssh -vvv zeaz-platform
```

Common causes:

- `cloudflared` is missing or too old on the client.
- The SSH alias does not use `ProxyCommand cloudflared access ssh --hostname %h`.
- The user is not included in the Cloudflare Access policy for `ssh.zeaz.dev`.
- The Access application is not configured for the SSH hostname.
- The tunnel public hostname route points to the wrong origin or port.

Keep debug logs free of API tokens, tunnel tokens, and private key material.
