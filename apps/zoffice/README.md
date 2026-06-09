# zOffice

Last updated: 2026-06-10

zOffice is the `apps/zoffice` application inside `cvsz/zeaz-platform`. It is a self-hosted AI office dashboard for OpenClaw/Hermes-style agent workspaces with local runtime controls, optional panels, license-aware feature gating, and platform-aligned server commands.

## Stack

| Layer | Stack |
|---|---|
| App runtime | Python static/server runtime |
| UI | Browser HTML/CSS/JavaScript pixel-office dashboard |
| Agent gateway | OpenClaw gateway + Hermes provider adapters |
| Local services | Whisper STT server, PC metrics server |
| Runtime data | `.runtime/data` |
| Local HTTP | `127.0.0.1:8091` |
| Local WebSocket | `127.0.0.1:8092` |
| Public route target | `https://zoffice.zeaz.dev` |

## Scope rule

All zOffice runtime automation stays inside:

```text
apps/zoffice
```

Do not place zOffice runtime files, generated reports, local env files, pid files, or logs outside this app path unless a future platform task explicitly changes scope.

## Latest updates

- App-local runtime paths under `.runtime/`.
- Platform Makefile targets for server start/stop/status/report/logs.
- Safe full-feature local env generator.
- License operator helper commands.
- License receipt integrity hardening.
- Branding migration tooling from legacy office names to `zOffice`.
- Default server start is license-aware normal mode.
- Developer/internal mode is explicit via `make dev-internal-start`.

## Quick start

```bash
cd /home/zeazdev/zeaz-platform/apps/zoffice
make info
make feature-unlock-local
cp .env.full-local.example .env
make validate-local
make server-start
make server-status
make health-check
make smoke-test
```

Open locally:

```text
http://127.0.0.1:8091
```

## Server commands

```bash
make server-start
make server-stop
make server-restart
make server-status
make server-report
make server-logs
make health-check
make smoke-test
make validate-local
make clean
```

## Optional local services

```bash
make start-whisper
make stop-whisper
make start-metrics
make stop-metrics
make stop-all
```

## Feature environment

```bash
make feature-env
make feature-unlock-local
make feature-status
```

Generated file:

```text
.env.full-local.example
```

This enables local optional panels in config form while provider actions remain configuration-gated.

## License commands

```bash
make license-status
make license-activate KEY="<valid-license-key>"
make license-deactivate
make license-agent-limit
make license-feature FEATURE=browserPanel
make license-audit
```

License activation requires a valid key accepted by the configured license provider. The repo does not generate, forge, or bypass license keys.

## Normal mode vs developer mode

Normal license-aware operation:

```bash
make server-start
```

Explicit owner/developer internal mode:

```bash
make dev-internal-start
```

## Branding migration

```bash
make branding-scan
make branding-rename-zoffice
git diff -- apps/zoffice
make validate-local
```

The branding script scans text files inside `apps/zoffice`, excludes binary/runtime/vendor files, and replaces legacy office branding with `zOffice`.

## Configuration defaults

| Variable | Default | Description |
|---|---|---|
| `VO_OFFICE_NAME` | `zOffice` | Office display name |
| `VO_PORT` | `8091` | HTTP server port |
| `VO_WS_PORT` | `8092` | WebSocket proxy port |
| `VO_STATUS_DIR` | `.runtime/data` | Local app runtime data |
| `VO_OPENCLAW_PATH` | `~/.openclaw` | OpenClaw home path |
| `VO_GATEWAY_URL` | `ws://127.0.0.1:18789` | OpenClaw gateway WebSocket URL |
| `VO_GATEWAY_HTTP` | `http://127.0.0.1:18789` | OpenClaw gateway HTTP URL |
| `VO_HERMES_ENABLED` | `true` | Enable Hermes discovery when available |
| `VO_HERMES_HOME` | `~/.hermes` | Hermes profile root |
| `VO_HERMES_BIN` | `~/.local/bin/hermes` | Hermes CLI path |
| `VO_HERMES_TIMEOUT_SEC` | `600` | Hermes CLI timeout |

## Main files

```text
Makefile
.env.example
scripts/feature-local-env.sh
scripts/license-tool.sh
scripts/rename-branding-zoffice.sh
fixer.py
app/server.py
app/license.py
app/gateway_presence.py
```

## Security notes

- Do not commit real license keys, gateway tokens, provider tokens, SMS credentials, or browser passwords.
- Keep `.env`, `.runtime/`, generated pid files, logs, and local status data out of git.
- Use `make server-start` for normal license-aware operation.
- Use `make dev-internal-start` only for owner/developer testing.
- Do not expose zOffice publicly without access controls.
- Prefer Cloudflare Access, private networking, or protected reverse proxy access for remote use.
