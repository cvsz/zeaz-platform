# INSTALLER & OS REQUIREMENTS

> What you need to run zLM-CLI, on which operating systems, and how to install it.

## Minimum requirements

| Requirement | Minimum | Recommended |
| --- | --- | --- |
| **OS** | macOS 12+, Ubuntu 20.04+, Windows 10+ (WSL2) | macOS 14+, Ubuntu 22.04+, Windows 11 (WSL2) |
| **RAM** | 2 GB free | 4 GB+ free |
| **Disk** | 500 MB (without node_modules) | 2 GB (with deps + build cache) |
| **Node.js** | 18+ (bundled via Bun) | 20+ |
| **Bun** | 1.1+ | Latest |
| **Internet** | Required (z.ai API access) | Broadband |

## Supported operating systems

### macOS ✅ (primary)
- **Tested on**: macOS 14 (Sonoma), 15 (Sequoia)
- **Architecture**: Apple Silicon (M1/M2/M3/M4) and Intel
- **Install Bun**: `curl -fsSL https://bun.sh/install | bash`
- **Notes**: Homebrew users can also `brew install bun`. The Makefile uses `setsid`, `ss`, and standard POSIX tools — all available on macOS.

### Linux ✅ (primary)
- **Tested on**: Ubuntu 22.04, 24.04; Debian 12; Fedora 39
- **Architecture**: x86_64 and ARM64
- **Install Bun**: `curl -fsSL https://bun.sh/install | bash`
- **Notes**: Requires `make`, `grep`, `ss` (from `iproute2`), and a POSIX shell. All present on standard distros. On minimal images: `apt install iproute2 make` or `dnf install iproute make`.

### Windows ✅ (via WSL2)
- **Tested on**: Windows 11 + WSL2 (Ubuntu 22.04)
- **Not supported**: Native Windows (the Makefile uses POSIX shell features, `setsid`, `ss`)
- **Setup**:
  1. Install WSL2: `wsl --install -d Ubuntu-22.04` (in PowerShell as admin)
  2. Open the WSL terminal
  3. Install Bun: `curl -fsSL https://bun.sh/install | bash`
  4. Install make: `sudo apt update && sudo apt install -y make iproute2`
  5. Clone and run zLM-CLI inside WSL

### Cloud / containers ✅
- **Docker**: Use any Node 18+ or Bun image. The app runs on port 3000.
- **CI**: GitHub Actions with `oven-sh/setup-bun@v2` (see `.github/workflows/ci.yml`)
- **Sandbox**: The development environment uses a Caddy gateway on port 81 → 3000

## Prerequisites

### 1. Bun (runtime + package manager)

zLM-CLI uses [Bun](https://bun.sh) as its runtime and package manager.

```bash
# macOS / Linux / WSL
curl -fsSL https://bun.sh/install | bash

# Verify
bun --version   # should be 1.1+
```

### 2. Git (for cloning)

```bash
# macOS (with Xcode command line tools)
xcode-select --install

# Linux
sudo apt install git        # Debian/Ubuntu
sudo dnf install git        # Fedora

# Verify
git --version
```

### 3. z.ai configuration

The `z-ai-web-dev-sdk` reads configuration from `.z-ai-config` in one of:
- `<project-root>/.z-ai-config`
- `~/.z-ai-config`
- `/etc/.z-ai-config`

The file must contain:
```json
{
  "baseUrl": "https://api.z.ai/api/paas/v4",
  "apiKey": "<your-z-ai-api-key>"
}
```

> If you're running in the z.ai sandbox environment, this is pre-configured. Otherwise, get an API key from [chat.z.ai](https://chat.z.ai).

## Installation

### Quick start (Makefile)

```bash
git clone <repo-url> zlm-cli
cd zlm-cli
make install   # bun install + prisma generate + prisma db push
make start     # start dev server (background, port 3000)
make status    # verify it's running
```

Then open `http://localhost:3000` (or the Preview Panel in the sandbox).

### Manual install (without Make)

```bash
git clone <repo-url> zlm-cli
cd zlm-cli
bun install
bun run db:generate
bun run db:push
bun run dev      # starts on port 3000
```

### Verify the install

```bash
make status
# Expected:
#   dev server     ● running  PID 12345  port 3000

curl http://localhost:3000/
# Expected: HTTP 200

curl http://localhost:3000/api
# Expected: {"message":"Hello, world!"}
```

## Makefile targets

The Makefile is **cross-platform** — it auto-detects macOS (`Darwin`), Linux, and WSL (via the `/proc/version` Microsoft check) and uses platform-appropriate port-check commands (`lsof` on macOS, `ss` on Linux/WSL). Run `make check-os` to see what was detected.

**17 user-facing targets** (plus internal `mini-start` / `mini-stop` / `mini-status` / `ensure-dev-dir`):

| # | Target | What it does |
| --- | --- | --- |
| 1 | `make install` | `bun install` + `prisma generate` + `prisma db push` (cross-platform; also seeds default RBAC roles) |
| 2 | `make start` | Start dev server in background (idempotent — won't start a duplicate) |
| 3 | `make stop` | Stop dev server (graceful SIGTERM → SIGKILL after 5s) |
| 4 | `make restart` | Stop + start |
| 5 | `make status` | Show running state, PID, port, platform |
| 6 | `make logs` | `tail -f dev.log` |
| 7 | `make lint` | `bun run lint` (ESLint) |
| 8 | `make clean` | Remove `.next` cache + build artifacts |
| 9 | `make db-push` | `prisma db push` |
| 10 | `make db-generate` | `prisma generate` |
| 11 | `make db-reset` | Reset DB and re-push schema (destructive — `prisma db push --force-reset`) |
| 12 | `make check-os` | Detect and report OS + arch + bun/node/git versions (macOS / Linux / WSL) |
| 13 | `make check-deps` | Verify required tools (`bun`, `git`) are installed |
| 14 | `make build` | Cross-platform production build (Next.js standalone) |
| 15 | `make package` | Create a distributable source zip at `download/zlm-cli-source.zip` |
| 16 | `make security` | Run the OWASP security scanner via `POST /api/security` |
| 17 | `make test` | Pre-commit quality gate: `lint` + `tsc --noEmit` type-check |

Run `make help` to list all targets with descriptions.

## Validation scripts (`scripts/`)

zLM-CLI ships with **4 shell scripts** under `scripts/` that validate the dev environment from different angles. Run them after `make install` (or any time the dev environment feels off):

| Script | What it validates |
| --- | --- |
| `scripts/tech-stack-scaner.sh` | Scans the runtime, dependencies, framework, routes, and components — a one-shot inventory of what's in the project. |
| `scripts/validate-env.sh` | Validates `.env`, `.z-ai-config`, `node_modules`, the DB file, and the Prisma client. Catches missing config and broken installs. |
| `scripts/validate-network.sh` | Tests localhost reachability, the z.ai API endpoint, npm registry, GitHub, and DNS resolution. Catches sandbox networking issues. |
| `scripts/validate-workers.sh` | Checks the dev server, any mini-services, PID files, and running processes. Catches orphaned or zombie processes. |

All scripts are POSIX shell — they run on macOS, Linux, and WSL without modification.

## Port configuration

| Service | Default port | Config |
| --- | --- | --- |
| Next.js dev server | 3000 | Hardcoded in `package.json` (`next dev -p 3000`) |
| Caddy gateway | 81 | `Caddyfile` |
| Mini-services | 3001+ | Per-service `package.json` |

> The sandbox only exposes one external port. Caddy (port 81) reverse-proxies to 3000 and supports `?XTransformPort=<port>` for mini-services.

## Troubleshooting

### `make start` says "failed to start"
- Read the tail of `dev.log`: `tail -30 dev.log`
- Common causes: missing `.z-ai-config`, port 3000 in use, syntax error in a route

### Port 3000 already in use
```bash
make stop        # stop any existing instance
# or manually find and kill:
ss -tlnp | grep :3000
kill <PID>
make start
```

### Prisma "table does not exist"
```bash
make db-push     # creates/migrates the schema
```

### `z-ai-web-dev-sdk` errors with "Configuration file not found"
- Ensure `.z-ai-config` exists in the project root, home dir, or `/etc/`
- It must be valid JSON with `baseUrl` and `apiKey`

### Streaming returns empty responses
- This was a known issue (SDK returns SSE bytes, not parsed objects). Fixed by `parseSseStream()` in `glm.ts`. If it recurs, check that `glm.ts` hasn't been modified to skip SSE parsing.

### `Module not found: fs/promises` in browser
- A client component is importing `src/lib/glm.ts` (server-only). Move the import to a client-safe file (`zlm-modes.ts`, `skills.ts`, etc.).

### Rate limit (429) on every request
- Check if "Require API key" is toggled on without a valid active key. Open the Keys panel (`/keys`) and either disable the gate or set an active key.

### Make commands not found on Windows
- Use WSL2. Native Windows isn't supported (the Makefile uses `setsid`, `ss`, POSIX shell).

## Development environment

The sandbox/dev environment includes:
- **Caddy gateway** (port 81) → reverse proxy to Next.js (port 3000)
- **PostgreSQL** at `postgresql://localhost:5432/glm_cli`
- **Prisma Studio** available via `bunx prisma studio`
- **ESLint** via `make lint`
- **Hot reload** via Next.js Fast Refresh

## Uninstall

```bash
make stop                    # stop the server
rm -rf node_modules .next    # remove deps + build cache
rm -rf postgresql://localhost:5432/glm_cli          # remove database
rm -rf .dev                  # remove pid files + key config
```

---

For the full technology list, see [TECH-STACK.md](TECH-STACK.md). For how to contribute, see [CONTRIBUTING.md](CONTRIBUTING.md).
