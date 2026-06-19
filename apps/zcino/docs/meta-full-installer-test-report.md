# Meta Full Installer test report

Date: 2026-05-06 (UTC)

## Scope

This repository does not contain a literal script, binary, package script, or Docker target named `Meta Full Installer` or `Full Installer`. The closest documented full-install path is the Docker full-stack deployment described in `README.md`, which uses `infra/docker-compose.yml` with the Go API gateway/catalog/tracking service, PostgreSQL, Redis, compliance service, and Next.js frontend.

## Real commands executed

| Command | Result | Notes |
| --- | --- | --- |
| `rg -n "Meta Full Installer\|Full Installer\|installer\|install" .` | Pass | No literal `Meta Full Installer` implementation found; only generic install instructions and package metadata references were present. |
| `go test ./...` | Pass | All Go packages and tests completed successfully after the Go 1.25.7 toolchain and module dependencies downloaded. |
| `npm ci` in `frontend/` | Pass with audit findings | Installed 420 packages. npm reported 2 moderate vulnerabilities and suggested `npm audit` / `npm audit fix --force`. |
| `npm run typecheck` in `frontend/` | Pass | TypeScript completed with `tsc --noEmit`. |
| `npm run build` in `frontend/` | Pass | Next.js 15.5.15 production build completed successfully. |
| `npm run lint` in `frontend/` | Pass with deprecation notice | ESLint returned no warnings or errors. Next.js reported `next lint` is deprecated and will be removed in Next.js 16. |
| `npm ci` in `sdk/typescript/` | Pass | Installed 1 package; npm reported 0 vulnerabilities. |
| `npm run build` in `sdk/typescript/` | Pass | TypeScript SDK compiled with `tsc -p tsconfig.json`. |
| `docker --version` | Environment blocked | Docker is not installed in this container (`command not found`). |
| `docker compose version` | Environment blocked | Docker Compose could not be tested because Docker is not installed (`command not found`). |

## Real result

The available backend, frontend, and TypeScript SDK installer/build/test paths pass in this container. The documented full-stack Docker installer path could not be executed here because Docker is unavailable in the environment. The only actionable findings from the run are npm's frontend audit warning for 2 moderate vulnerabilities and the deprecation notice for `next lint`.
