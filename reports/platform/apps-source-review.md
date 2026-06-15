# Apps source review

Generated: `2026-06-15T14:28:59Z`
Apps scanned: `19`

This report is read-only. It excludes dependency, cache, build, runtime, vendor, and local tooling directories.

## Summary

| App | Stack | Files | Source | Ports | Domains | Critical | Warnings |
|---|---|---:|---:|---|---|---:|---:|
| api | `docker, python` | 16 | 15 | `6379, 8000` | `api.zeaz.dev, zcfdash.zeaz.dev` | 0 | 0 |
| openwork | `docker, node, pnpm` | 1766 | 1283 | `443, 587, 1234, 3000, 3001, 3005, 3306, 3333, 3978, 4096, 4321, 5173, 5432, 6000, 6080, 6379, 8000, 8080, 8090, 8787, 8788, 8789, 8790, 8791, 8799, 9222, 9223, 9823, 9825, 9830, 11434, 18801, 19876, 48123, 49999, 52431, 54235, 59673, 59674, 59675` | `mcp.zeaz.dev, openwork.zeaz.dev` | 0 | 6 |
| web | `node, pnpm` | 60 | 49 | `4101, 4102, 4103, 4104, 4105, 4106, 4107, 4108, 4109, 4110, 4111, 4112, 4113, 5432, 8000` | `api-zcfdash.zeaz.dev, api-zdash.zeaz.dev, api.zeaz.dev, app.zeaz.dev, auth.zeaz.dev, release.zeaz.dev, ssh.zeaz.dev, www.zeaz.dev, zcfdash.zeaz.dev, zcino.zeaz.dev, zdash.zeaz.dev, zveo.zeaz.dev` | 0 | 1 |
| zAcademy | `node, terraform` | 133 | 65 | `443, 3009, 4317, 8084, 8443, 9090` | `auth.zeaz.dev` | 0 | 4 |
| zLinebot | `docker, node, python, terraform` | 977 | 937 | `587, 3000, 3001, 3002, 3100, 5173, 5432, 6333, 6379, 8000, 8080, 9090, 9092, 9100, 9300, 9400, 9500, 9600, 9700, 26257` | `admin.zeaz.dev, admin.zlttbots.zeaz.dev, ai.zeaz.dev, api.zeaz.dev, api.zlttbots.zeaz.dev, arb.zlttbots.zeaz.dev, asia.zeaz.dev, auth.zeaz.dev, backup.zlinebot.zeaz.dev, crawl.zeaz.dev, crawler.zlttbots.zeaz.dev, eu.zeaz.dev, gpu.zeaz.dev, grafana.zeaz.dev, grafana.zlinebot.zeaz.dev, jaeger.zlinebot.zeaz.dev, kafka.zeaz.dev, logs.zlinebot.zeaz.dev, predict.zeaz.dev, us.zeaz.dev, video.zlttbots.zeaz.dev, worker.zeaz.dev, zlinebot.zeaz.dev, zlttbots.zeaz.dev` | 0 | 1 |
| zai-factory | `npm` | 1 | 1 | `-` | `-` | 0 | 0 |
| zcfdash | `docker` | 2 | 2 | `-` | `api-zdash.zeaz.dev, api-zveo.zeaz.dev, api.zeaz.dev, app.zeaz.dev, openwork.zeaz.dev, www.zeaz.dev, zaiz.zeaz.dev, zcfdash.zeaz.dev, zcino.zeaz.dev, zdash.zeaz.dev, zlms.zeaz.dev, zoffice.zeaz.dev, zsticker.zeaz.dev, ztrader.zeaz.dev, zveo.zeaz.dev` | 0 | 0 |
| zcino | `docker` | 3150 | 364 | `3000, 4222, 5432, 6379, 6443, 8000, 8080, 8082, 8090, 8123, 8222, 9000` | `zcino.zeaz.dev` | 0 | 1 |
| zcloud | `node, npm` | 28 | 25 | `4177, 5000, 11434, 18789` | `-` | 0 | 0 |
| zdash | `docker, python, terraform` | 1116 | 1025 | `443, 587, 3000, 5173, 5432, 5436, 6379, 8000, 8005, 9009, 9090, 16379, 16380` | `api-zdash.zeaz.dev, release.zeaz.dev, zdash.zeaz.dev` | 0 | 3 |
| zdev | `node` | 7 | 6 | `4181` | `-` | 0 | 0 |
| zlms | `docker, node, pnpm` | 28475 | 11599 | `131, 135, 155, 443, 3000, 4318, 5432, 6379, 8000, 8080, 8888, 9000, 9080, 9102, 11211` | `pgadmin.zeaz.dev, zlms.zeaz.dev` | 0 | 0 |
| zoffice | `docker` | 189 | 175 | `6901, 6902, 8087, 8090, 8091, 8092, 8093, 8099, 9222, 18090, 18091, 18789` | `zoffice.zeaz.dev` | 0 | 1 |
| zquest | `unknown` | 5 | 5 | `8080` | `-` | 0 | 0 |
| zsp-aitool | `docker, node, npm` | 813 | 757 | `3000, 3001, 5173, 5174, 5175, 5432, 5433, 5435, 8005` | `api-zdash.zeaz.dev, api-zveo.zeaz.dev, app.zeaz.dev, release.zeaz.dev, studio.zeaz.dev, tunnel.zeaz.dev, www.zeaz.dev, zaiz.zeaz.dev, zdash.zeaz.dev, zveo.zeaz.dev` | 0 | 5 |
| zsticker | `docker, python` | 94 | 71 | `3008, 8000, 8007, 8080` | `zsticker.zeaz.dev` | 0 | 1 |
| ztrader | `docker, python` | 376 | 362 | `375, 768, 1920, 3000, 3001, 3016, 3017, 5432, 6379, 8000, 8016` | `api-ztrader.zeaz.dev, ztrader.zeaz.dev` | 0 | 1 |
| zveo | `docker, node, pnpm, python, terraform` | 244 | 217 | `443, 3000, 3019, 3100, 3200, 4317, 4318, 4319, 5432, 5436, 6379, 6382, 8000, 8080, 9000, 9005, 9006, 9090, 9093, 9095, 9100, 9464, 13133` | `zveo.zeaz.dev` | 0 | 4 |
| zwallet | `docker, node, pnpm, python, terraform` | 473 | 397 | `3000, 3002, 4173, 4222, 5432, 5601, 6379, 8080, 8090, 8091, 8092, 8093, 8094, 8095, 8096, 8097, 8098, 8099, 8100, 8200, 8332, 8545, 8546, 8899, 9090, 9092, 9200, 25432, 26380` | `app.zeaz.dev` | 0 | 3 |

## `api`

- Path: `apps/api`
- Stack: `docker, python`
- Root tracked files: `16`
- Nested git: `False`
- Files scanned: `16`
- Source-like files scanned: `15`

### Ports

- `6379` from `apps/api/routers/scheduler.py, apps/api/routers/swarm.py`
- `8000` from `apps/api/docker-compose.yml`

### Domains

- `api.zeaz.dev` from `apps/api/README.md, apps/api/docker-compose.yml, apps/api/routers/cloudflare_control.py`
- `zcfdash.zeaz.dev` from `apps/api/routers/cloudflare_control.py`

### Env files

- none detected

## `openwork`

- Path: `apps/openwork`
- Stack: `docker, node, pnpm`
- Root tracked files: `1737`
- Nested git: `False`
- Files scanned: `1766`
- Source-like files scanned: `1283`

### Package

- Name: `@different-ai/openwork-workspace`
- Version: `0.0.0`
- Scripts: `build, build:ui, build:web, bump:major, bump:minor, bump:patch, bump:set, dev, dev:den, dev:den-docker, dev:den-local, dev:den:api, dev:den:db-push, dev:den:inference, dev:den:mysql, dev:den:mysql:down, dev:den:seed-demo, dev:den:web, dev:electron, dev:headless-web, dev:sandbox, dev:ui, dev:ui-demo, dev:web, dev:web-local, dev:windows, dev:windows:x64, email:dev, preview, release:prepare, release:prepare:dry, release:review, release:ship, release:ship:watch, test:e2e, test:events, test:fs-engine, test:health, test:orchestrator, test:permissions, test:refactor, test:session-error-recovery, test:session-scope, test:session-switch, test:sessions, test:todos, typecheck`

### Ports

- `443` from `apps/openwork/ee/apps/den-web/proxy.ts`
- `587` from `apps/openwork/ee/apps/den-api/.env, apps/openwork/ee/apps/den-api/.env.example`
- `1234` from `apps/openwork/apps/app/tests/session-sync-permissions.test.ts, apps/openwork/apps/app/tests/session-sync-tool-parts.test.ts`
- `3000` from `apps/openwork/apps/app/scripts/open-target.test.ts, apps/openwork/apps/app/tests/env-context.test.ts, apps/openwork/ee/apps/den-api/.env, apps/openwork/ee/apps/den-api/.env.example, apps/openwork/ee/apps/inference/.env, apps/openwork/ee/apps/inference/.env.example, apps/openwork/ee/apps/landing/app/api/_lib/security.ts, apps/openwork/scripts/harness/agents/gan-evaluator.md, apps/openwork/scripts/harness/agents/gan-generator.md`
- `3001` from `apps/openwork/ee/apps/den-api/.env, apps/openwork/ee/apps/den-api/.env.example`
- `3005` from `apps/openwork/.devcontainer/README.md, apps/openwork/.devcontainer/docker-compose.yml, apps/openwork/.devcontainer/start-services.sh, apps/openwork/.opencode/skills/daytona-cloud-instance/SKILL.md, apps/openwork/.opencode/skills/daytona-electron-test/SKILL.md, apps/openwork/apps/opencode-router/.env, apps/openwork/apps/opencode-router/.env.example, apps/openwork/apps/orchestrator/src/cli.ts, apps/openwork/ee/apps/den-api/.env, apps/openwork/ee/apps/den-api/.env.example, apps/openwork/ee/apps/den-web/README.md, apps/openwork/ee/apps/landing/app/api/_lib/security.ts`
- `3306` from `apps/openwork/.devcontainer/start-daytona-server.sh, apps/openwork/.opencode/skills/daytona-electron-test/SKILL.md, apps/openwork/.opencode/skills/daytona-seeded-cloud-demo/SKILL.md, apps/openwork/ee/apps/den-api/.env, apps/openwork/ee/apps/den-api/.env.example, apps/openwork/ee/apps/den-api/package.json, apps/openwork/ee/apps/den-api/test/github-webhook.test.ts, apps/openwork/ee/apps/den-api/test/internal-mcp-principal.test.ts, apps/openwork/ee/apps/den-api/test/org-invitations.test.ts, apps/openwork/ee/apps/den-api/test/plugin-system-access.test.ts, apps/openwork/ee/apps/den-api/test/plugin-system-cross-org-idor.test.ts, apps/openwork/ee/apps/inference/.env`
- `3333` from `apps/openwork/apps/ui-demo/vite.config.ts`
- `3978` from `apps/openwork/evals/daytona-flows.md`
- `4096` from `apps/openwork/apps/app/src/react-app/shell/providers.tsx, apps/openwork/apps/opencode-router/.env, apps/openwork/apps/opencode-router/.env.example, apps/openwork/apps/opencode-router/README.md, apps/openwork/apps/opencode-router/install.sh, apps/openwork/apps/opencode-router/src/config.ts, apps/openwork/apps/opencode-router/test/bridge-e2e.test.js, apps/openwork/apps/opencode-router/test/bridge-multiworkspace.test.js, apps/openwork/apps/opencode-router/test/health-send.test.js, apps/openwork/apps/orchestrator/src/cli.ts, apps/openwork/apps/server/README.md, apps/openwork/packaging/docker/Dockerfile`
- `4321` from `apps/openwork/apps/server/src/artifact-files.e2e.test.ts`
- `5173` from `apps/openwork/.devcontainer/docker-compose.yml, apps/openwork/.devcontainer/start-services.sh, apps/openwork/.opencode/skills/browser-automation/SKILL.md, apps/openwork/.opencode/skills/daytona-dev/SKILL.md, apps/openwork/.opencode/skills/daytona-electron-test/SKILL.md, apps/openwork/apps/app/scripts/open-target.test.ts, apps/openwork/apps/orchestrator/src/cli.ts, apps/openwork/apps/server/README.md, apps/openwork/apps/server/src/env-routes.e2e.test.ts, apps/openwork/packaging/docker/docker-compose.den-dev.yml, apps/openwork/packaging/docker/docker-compose.dev.yml, apps/openwork/packaging/systemd/openwork.env`
- `5432` from `apps/openwork/ee/apps/inference/src/env.ts, apps/openwork/ee/packages/den-db/.env, apps/openwork/ee/packages/den-db/.env.example, apps/openwork/ee/packages/den-db/drizzle.config.ts, apps/openwork/scripts/harness/agents/opensource-forker.md`
- `6000` from `apps/openwork/apps/server/src/opencode-connection.test.ts`
- `6080` from `apps/openwork/.devcontainer/start-services.sh, apps/openwork/.devcontainer/test-on-daytona.sh`
- `6379` from `apps/openwork/scripts/harness/agents/opensource-forker.md`
- `8000` from `apps/openwork/zeaz/installer/mcp-fix-phase2.sh`
- `8080` from `apps/openwork/apps/server/src/validators.test.ts, apps/openwork/scripts/harness/agents/opensource-forker.md, apps/openwork/scripts/harness/commands/rust-test.md`
- `8090` from `apps/openwork/.devcontainer/test-on-daytona.sh, apps/openwork/.opencode/skills/daytona-recording-artifacts/SKILL.md`
- `8787` from `apps/openwork/apps/app/scripts/remote-workspace-diagnostics.test.ts, apps/openwork/apps/app/src/app/lib/openwork-server.ts, apps/openwork/apps/app/tests/openwork-env-runtime.test.ts, apps/openwork/apps/orchestrator/src/cli.ts, apps/openwork/apps/server/src/config.ts, apps/openwork/apps/server/src/extensions/google-workspace.test.ts, apps/openwork/apps/server/src/tokens.test.ts, apps/openwork/ee/apps/den-worker-proxy/.env, apps/openwork/ee/apps/den-worker-proxy/.env.example, apps/openwork/packaging/docker/Dockerfile, apps/openwork/packaging/docker/README.md, apps/openwork/packaging/docker/docker-compose.dev.yml`
- `8788` from `apps/openwork/.devcontainer/docker-compose.yml, apps/openwork/.devcontainer/start-services.sh, apps/openwork/.opencode/skills/daytona-seeded-cloud-demo/SKILL.md, apps/openwork/evals/cloud-admin-to-member-assignment-flows.md, apps/openwork/packaging/docker/docker-compose.den-dev.yml`
- `8789` from `apps/openwork/ee/apps/den-worker-proxy/.env, apps/openwork/ee/apps/den-worker-proxy/.env.example, apps/openwork/packaging/docker/docker-compose.den-dev.yml`
- `8790` from `apps/openwork/ee/apps/den-api/.env, apps/openwork/ee/apps/den-api/.env.example, apps/openwork/ee/apps/den-api/test/github-webhook.test.ts, apps/openwork/ee/apps/den-api/test/internal-mcp-principal.test.ts, apps/openwork/ee/apps/den-api/test/org-invitations.test.ts, apps/openwork/ee/apps/den-api/test/plugin-system-access.test.ts, apps/openwork/ee/apps/den-api/test/plugin-system-cross-org-idor.test.ts, apps/openwork/packaging/docker/README.md, apps/openwork/packaging/systemd/openwork.env, apps/openwork/packaging/systemd/openwork.env.example, apps/openwork/zeaz/docs/rollback.md`
- `8791` from `apps/openwork/apps/server/src/embedded.ts, apps/openwork/ee/apps/den-api/src/env.ts, apps/openwork/ee/apps/inference/.env, apps/openwork/ee/apps/inference/.env.example, apps/openwork/ee/apps/inference/src/models/openwork-dev.json, apps/openwork/packaging/systemd/openwork.env, apps/openwork/packaging/systemd/openwork.env.example`
- `8799` from `apps/openwork/zeaz/docs/deployment.md, apps/openwork/zeaz/docs/migration-guide.md, apps/openwork/zeaz/docs/operations.md, apps/openwork/zeaz/installer/docker-compose.yml`
- `9222` from `apps/openwork/.opencode/skills/daytona-chrome-cdp/SKILL.md`
- `9223` from `apps/openwork/evals/browser-extension-flows.md`
- `9823` from `apps/openwork/.opencode/skills/browser-automation/SKILL.md, apps/openwork/evals/openable-items-flow.md, apps/openwork/evals/react-session-flows.md, apps/openwork/packaging/systemd/openwork.env, apps/openwork/packaging/systemd/openwork.env.example, apps/openwork/scripts/openwork-debug.sh`
- `9825` from `apps/openwork/.devcontainer/README.md, apps/openwork/.devcontainer/docker-compose.yml, apps/openwork/.devcontainer/start-services.sh, apps/openwork/.devcontainer/test-on-daytona.sh, apps/openwork/.opencode/skills/daytona-dev/SKILL.md, apps/openwork/.opencode/skills/daytona-electron-test/SKILL.md, apps/openwork/.opencode/skills/run-evals/SKILL.md, apps/openwork/evals/README.md, apps/openwork/evals/daytona-flows.md`
- `9830` from `apps/openwork/.opencode/skills/browser-automation/SKILL.md`
- `11434` from `apps/openwork/apps/app/src/app/extensions.ts, apps/openwork/apps/app/src/react-app/domains/settings/openai-image-extension.ts, apps/openwork/apps/server/src/jsonc.test.ts, apps/openwork/ee/apps/den-api/src/routes/org/plugin-system/store.ts, apps/openwork/zeaz/docs/deployment.md, apps/openwork/zeaz/providers/router.ts`
- `18801` from `apps/openwork/scripts/install-openwork.sh`
- `19876` from `apps/openwork/apps/app/src/i18n/locales/ca.ts, apps/openwork/apps/app/src/i18n/locales/en.ts, apps/openwork/apps/app/src/i18n/locales/es.ts, apps/openwork/apps/app/src/i18n/locales/fr.ts, apps/openwork/apps/app/src/i18n/locales/ja.ts, apps/openwork/apps/app/src/i18n/locales/pt-BR.ts, apps/openwork/apps/app/src/i18n/locales/ru.ts, apps/openwork/apps/app/src/i18n/locales/th.ts, apps/openwork/apps/app/src/i18n/locales/vi.ts, apps/openwork/apps/app/src/i18n/locales/zh.ts`
- `48123` from `apps/openwork/apps/server/src/embedded.ts`
- `49999` from `apps/openwork/apps/server/src/workspace-activate.e2e.test.ts`
- `52431` from `apps/openwork/docs/mcp-ui-control-profile.md`
- `54235` from `apps/openwork/apps/server/src/opencode-connection.test.ts`
- `59673` from `apps/openwork/evals/browser-extension-flows.md`
- `59674` from `apps/openwork/evals/browser-extension-flows.md`
- `59675` from `apps/openwork/evals/browser-extension-flows.md`

### Domains

- `mcp.zeaz.dev` from `apps/openwork/zeaz/mcp/server.ts`
- `openwork.zeaz.dev` from `apps/openwork/README.md`

### Env files

- `apps/openwork/apps/app/.env.migration-release.example` `example` keys=7: `VITE_OPENWORK_MIGRATION_LINUX_ARM64_URL, VITE_OPENWORK_MIGRATION_LINUX_X64_URL, VITE_OPENWORK_MIGRATION_MAC_ARM64_URL, VITE_OPENWORK_MIGRATION_MAC_X64_URL, VITE_OPENWORK_MIGRATION_RELEASE, VITE_OPENWORK_MIGRATION_VERSION, VITE_OPENWORK_MIGRATION_WINDOWS_X64_URL`
- `apps/openwork/apps/opencode-router/.env` `local-only` keys=19: `GROUPS_ENABLED, LOG_LEVEL, OPENCODE_DIRECTORY, OPENCODE_ROUTER_CONFIG_PATH, OPENCODE_ROUTER_DATA_DIR, OPENCODE_ROUTER_DB_PATH, OPENCODE_ROUTER_HEALTH_PORT, OPENCODE_SERVER_PASSWORD, OPENCODE_SERVER_USERNAME, OPENCODE_URL, PERMISSION_MODE, PORT, SLACK_APP_TOKEN, SLACK_BOT_TOKEN, SLACK_ENABLED, TELEGRAM_BOT_TOKEN, TELEGRAM_ENABLED, TOOL_OUTPUT_LIMIT, TOOL_UPDATES_ENABLED`
- `apps/openwork/apps/opencode-router/.env.example` `example` keys=19: `GROUPS_ENABLED, LOG_LEVEL, OPENCODE_DIRECTORY, OPENCODE_ROUTER_CONFIG_PATH, OPENCODE_ROUTER_DATA_DIR, OPENCODE_ROUTER_DB_PATH, OPENCODE_ROUTER_HEALTH_PORT, OPENCODE_SERVER_PASSWORD, OPENCODE_SERVER_USERNAME, OPENCODE_URL, PERMISSION_MODE, PORT, SLACK_APP_TOKEN, SLACK_BOT_TOKEN, SLACK_ENABLED, TELEGRAM_BOT_TOKEN, TELEGRAM_ENABLED, TOOL_OUTPUT_LIMIT, TOOL_UPDATES_ENABLED`
- `apps/openwork/ee/apps/den-api/.env` `local-only` keys=41: `BETTER_AUTH_SECRET, BETTER_AUTH_URL, CORS_ORIGINS, DATABASE_URL, DAYTONA_API_KEY, DAYTONA_API_URL, DEN_BETTER_AUTH_TRUSTED_ORIGINS, DEN_DB_ENCRYPTION_KEY, EMAIL_FROM, LOOPS_API_KEY, OPENROUTER_MANAGEMENT_API_KEY, OPENROUTER_WORKSPACE_ID, OPENWORK_DEV_MODE, POLAR_ACCESS_TOKEN, POLAR_API_BASE, POLAR_BENEFIT_ID, POLAR_FEATURE_GATE_ENABLED, POLAR_PRODUCT_ID, POLAR_RETURN_URL, POLAR_SUCCESS_URL, PORT, PROVISIONER_MODE, RENDER_API_KEY, RENDER_OWNER_ID, RENDER_WORKER_PUBLIC_DOMAIN_SUFFIX, RESEND_API_KEY, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_SECURE, SMTP_USER, STRIPE_BILLING_CANCEL_URL, STRIPE_BILLING_SUCCESS_URL, STRIPE_INFERENCE_PRICE_ID, STRIPE_SEAT_PRICE_ID, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, VERCEL_DNS_DOMAIN, VERCEL_TOKEN, WORKER_ACTIVITY_BASE_URL, WORKER_URL_TEMPLATE`
- `apps/openwork/ee/apps/den-api/.env.example` `example` keys=41: `BETTER_AUTH_SECRET, BETTER_AUTH_URL, CORS_ORIGINS, DATABASE_URL, DAYTONA_API_KEY, DAYTONA_API_URL, DEN_BETTER_AUTH_TRUSTED_ORIGINS, DEN_DB_ENCRYPTION_KEY, EMAIL_FROM, LOOPS_API_KEY, OPENROUTER_MANAGEMENT_API_KEY, OPENROUTER_WORKSPACE_ID, OPENWORK_DEV_MODE, POLAR_ACCESS_TOKEN, POLAR_API_BASE, POLAR_BENEFIT_ID, POLAR_FEATURE_GATE_ENABLED, POLAR_PRODUCT_ID, POLAR_RETURN_URL, POLAR_SUCCESS_URL, PORT, PROVISIONER_MODE, RENDER_API_KEY, RENDER_OWNER_ID, RENDER_WORKER_PUBLIC_DOMAIN_SUFFIX, RESEND_API_KEY, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_SECURE, SMTP_USER, STRIPE_BILLING_CANCEL_URL, STRIPE_BILLING_SUCCESS_URL, STRIPE_INFERENCE_PRICE_ID, STRIPE_SEAT_PRICE_ID, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, VERCEL_DNS_DOMAIN, VERCEL_TOKEN, WORKER_ACTIVITY_BASE_URL, WORKER_URL_TEMPLATE`
- `apps/openwork/ee/apps/den-worker-proxy/.env` `local-only` keys=12: `DATABASE_HOST, DATABASE_PASSWORD, DATABASE_URL, DATABASE_USERNAME, DAYTONA_API_KEY, DAYTONA_API_URL, DAYTONA_OPENWORK_PORT, DAYTONA_SIGNED_PREVIEW_EXPIRES_SECONDS, DAYTONA_TARGET, DB_MODE, OPENWORK_DAYTONA_ENV_PATH, PORT`
- `apps/openwork/ee/apps/den-worker-proxy/.env.example` `example` keys=12: `DATABASE_HOST, DATABASE_PASSWORD, DATABASE_URL, DATABASE_USERNAME, DAYTONA_API_KEY, DAYTONA_API_URL, DAYTONA_OPENWORK_PORT, DAYTONA_SIGNED_PREVIEW_EXPIRES_SECONDS, DAYTONA_TARGET, DB_MODE, OPENWORK_DAYTONA_ENV_PATH, PORT`
- `apps/openwork/ee/apps/inference/.env` `local-only` keys=13: `CORS_ORIGINS, DATABASE_HOST, DATABASE_PASSWORD, DATABASE_URL, DATABASE_USERNAME, DB_MODE, DEN_DB_ENCRYPTION_KEY, INFERENCE_ADMIN_TOKEN, INFERENCE_CREDITS_PER_DOLLAR, INFERENCE_PROXY_BASE_URL, INFERENCE_WEBHOOK_SECRET, OPENROUTER_UPSTREAM_URL, PORT`
- `apps/openwork/ee/apps/inference/.env.example` `example` keys=13: `CORS_ORIGINS, DATABASE_HOST, DATABASE_PASSWORD, DATABASE_URL, DATABASE_USERNAME, DB_MODE, DEN_DB_ENCRYPTION_KEY, INFERENCE_ADMIN_TOKEN, INFERENCE_CREDITS_PER_DOLLAR, INFERENCE_PROXY_BASE_URL, INFERENCE_WEBHOOK_SECRET, OPENROUTER_UPSTREAM_URL, PORT`
- `apps/openwork/ee/packages/den-db/.env` `local-only` keys=2: `DATABASE_URL, DEN_DB_ENCRYPTION_KEY`
- `apps/openwork/ee/packages/den-db/.env.example` `example` keys=2: `DATABASE_URL, DEN_DB_ENCRYPTION_KEY`
- `apps/openwork/packaging/systemd/openwork.env` `local-only` keys=3: `DISPLAY, OPENWORK_DEV_MODE, OPENWORK_MODE`
- `apps/openwork/packaging/systemd/openwork.env.example` `example` keys=3: `DISPLAY, OPENWORK_DEV_MODE, OPENWORK_MODE`

### Findings

- `warn` `local_env_file`: Local env file exists: apps/openwork/ee/apps/den-api/.env
- `warn` `local_env_file`: Local env file exists: apps/openwork/ee/apps/den-worker-proxy/.env
- `warn` `local_env_file`: Local env file exists: apps/openwork/ee/apps/inference/.env
- `warn` `local_env_file`: Local env file exists: apps/openwork/ee/packages/den-db/.env
- `warn` `local_env_file`: Local env file exists: apps/openwork/apps/opencode-router/.env
- `warn` `local_env_file`: Local env file exists: apps/openwork/packaging/systemd/openwork.env

### TODO/FIXME/HACK hits

- `apps/openwork/SUPPORT.md:8` `- **Bug reports**: use the Bug issue template.`
- `apps/openwork/ee/apps/landing/app/privacy/privacy-policy.md:43` `The Desktop App does not collect, track, or transmit any data during normal use. The only instance in which information is gathered is when you explicitly choose to report a bug. W`
- `apps/openwork/ee/apps/landing/app/privacy/privacy-policy.md:64` `The Cloud Service does not track or profile user behavior. Like the Desktop App, the Cloud Service supports voluntary bug reporting with the same diagnostic data described above. I`
- `apps/openwork/ee/apps/landing/app/privacy/privacy-policy.md:70` `- **Directly from you:** when you create an account, subscribe to a paid plan, subscribe to our newsletter, submit a bug report, or otherwise contact us.`
- `apps/openwork/ee/apps/landing/app/privacy/privacy-policy.md:82` `- To diagnose and resolve software defects using bug report diagnostic data`
- `apps/openwork/ee/apps/landing/app/privacy/privacy-policy.md:143` `- **Bug report diagnostic data:** retained temporarily and deleted once the related issue is resolved.`
- `apps/openwork/ee/apps/landing/app/terms/terms-of-use.md:101` `We do not collect analytics or telemetry data during normal use of the Desktop App. The Cloud Service collects limited operational telemetry (such as service availability, error ra`
- `apps/openwork/ee/apps/landing/app/terms/terms-of-use.md:151` `If you provide us with any feedback, suggestions, ideas, bug reports, or other information relating to the Services or our business ("Feedback"), you agree that we may use, copy, m`
- `apps/openwork/apps/orchestrator/README.md:199` `--paths "README.md,notes/todo.md" \`
- `apps/openwork/apps/orchestrator/README.md:206` `--path notes/todo.md \`
- `apps/openwork/apps/app/src/app/utils/index.ts:698` `if (lower.includes("task") || lower.includes("agent") || lower.includes("todo")) return "task";`
- `apps/openwork/apps/app/src/app/utils/index.ts:826` `return "Update todo list";`
- `apps/openwork/apps/app/src/app/utils/index.ts:830` `return "Read todo list";`
- `apps/openwork/apps/app/src/app/lib/openwork-server.ts:1` `import type { Message, Part, Session, Todo } from "@opencode-ai/sdk/v2/client";`
- `apps/openwork/apps/app/src/app/lib/openwork-server.ts:120` `todos: Todo[];`
- `apps/openwork/apps/app/src/app/lib/opencode.ts:1` `import { createOpencodeClient, type Message, type Part, type Session, type Todo } from "@opencode-ai/sdk/v2/client";`
- `apps/openwork/apps/app/src/app/lib/opencode.ts:379` `// TODO(2026-04-12): remove the old-server compatibility path here once all`
- `apps/openwork/apps/app/src/app/lib/opencode.ts:385` `todo: (parameters: SessionLookupParameters, options?: { throwOnError?: boolean }) => Promise<FieldsResult<Todo[]>>;`
- `apps/openwork/apps/app/src/app/lib/opencode.ts:442` `const todoOriginal = sessionOverrides.todo.bind(session);`
- `apps/openwork/apps/app/src/app/lib/opencode.ts:443` `sessionOverrides.todo = (parameters: SessionLookupParameters, options?: { throwOnError?: boolean }) => {`
- `apps/openwork/apps/app/src/i18n/locales/es.ts:284` `"den.import_all": "Importar todo",`
- `apps/openwork/apps/app/src/i18n/locales/es.ts:360` `"extensions.filter_all": "Todo",`
- `apps/openwork/apps/app/src/i18n/locales/es.ts:1011` `"settings.nuke_hint": "Úsalo solo si quieres restablecer del todo la app de escritorio y el estado del runtime de OpenCode.",`
- `apps/openwork/apps/app/src/i18n/locales/es.ts:1240` `"skills.filter_all": "Todo",`
- `apps/openwork/apps/app/src/i18n/locales/es.ts:1333` `"status.limited_mcp_hint": "{count} MCP conectado · vuelve a conectarte para tenerlo todo",`
- `apps/openwork/apps/app/src/i18n/locales/en.ts:851` `"session.permission_kind_todowrite": "Todo write",`
- `apps/openwork/apps/app/src/i18n/locales/ru.ts:681` `"session.permission_kind_todowrite": "Запись todo",`
- `apps/openwork/apps/app/src/react-app/kernel/global-sdk-provider.tsx:136` `if (payload.type === "todo.updated")`
- `apps/openwork/apps/app/src/react-app/kernel/global-sdk-provider.tsx:137` `return `todo.updated:${directory}:${payload.properties.sessionID}`;`
- `apps/openwork/apps/app/src/react-app/kernel/global-sync-provider.tsx:42` `todo: Record<string, TodoItem[]>;`
- `apps/openwork/apps/app/src/react-app/kernel/global-sync-provider.tsx:106` `todo: {},`
- `apps/openwork/apps/app/src/react-app/domains/session/sync/session-sync.ts:2` `import type { FilePart, Part, PermissionRequest, QuestionRequest, SessionStatus, Todo } from "@opencode-ai/sdk/v2/client";`
- `apps/openwork/apps/app/src/react-app/domains/session/sync/session-sync.ts:608` `if (event.type === "todo.updated") {`
- `apps/openwork/apps/app/src/react-app/domains/session/sync/session-sync.ts:609` `const props = (event.properties ?? {}) as { sessionID?: string; todos?: Todo[] };`
- `apps/openwork/apps/app/src/react-app/domains/session/surface/session-surface.tsx:217` `const todos = props.todos.filter((todo) => todo.content.trim());`
- `apps/openwork/apps/app/src/react-app/domains/session/surface/session-surface.tsx:218` `const completedTodos = todos.filter((todo) => todo.status === "completed").length;`
- `apps/openwork/apps/app/src/react-app/domains/session/surface/session-surface.tsx:238` `{todos.map((todo, index) => {`
- `apps/openwork/apps/app/src/react-app/domains/session/surface/session-surface.tsx:239` `const done = todo.status === "completed";`
- `apps/openwork/apps/app/src/react-app/domains/session/surface/session-surface.tsx:240` `const cancelled = todo.status === "cancelled";`
- `apps/openwork/apps/app/src/react-app/domains/session/surface/session-surface.tsx:241` `const active = todo.status === "in_progress";`
- `apps/openwork/apps/app/src/react-app/domains/session/surface/session-surface.tsx:243` `<div key={todo.id} className="flex items-start gap-2.5 pt-2.5 first:pt-2.5">`
- `apps/openwork/apps/app/src/react-app/domains/session/surface/session-surface.tsx:261` `{todo.content}`
- `apps/openwork/apps/app/src/react-app/domains/session/surface/session-surface.tsx:1288` `compactTopSpacing={Boolean(props.activeQuestion || (props.todos ?? []).some((todo) => todo.content.trim()) || props.activePermission || queuedMessages.length > 0)}`
- `apps/openwork/apps/app/src/react-app/domains/session/surface/session-surface.tsx:1290` `props.activeQuestion || (props.todos ?? []).some((todo) => todo.content.trim()) || props.activePermission || queuedMessages.length > 0 ? (`
- `apps/openwork/apps/app/src/react-app/domains/session/surface/session-surface.tsx:1305` `) : (props.todos ?? []).some((todo) => todo.content.trim()) ? (`
- `apps/openwork/apps/app/src/react-app/domains/session/surface/composer/composer.tsx:1504` `{/* TODO: Decide what to do with agent selection before showing this control again.`
- `apps/openwork/apps/app/src/react-app/domains/settings/pages/recovery-view.tsx:73` `// TODO: Restore the conditional disabled state once this action is wired into the React settings route.`
- `apps/openwork/apps/app/src/react-app/domains/settings/pages/recovery-view.tsx:115` `// TODO: Restore the conditional disabled state once this action is wired into the React settings route.`
- `apps/openwork/apps/app/src/react-app/domains/settings/pages/recovery-view.tsx:144` `// TODO: Restore the conditional disabled state once this action is wired into the React settings route.`
- `apps/openwork/apps/app/src/react-app/domains/settings/shell/settings-page.tsx:5` `Bug,`

### Large files

- `apps/openwork/apps/desktop/resources/sidecars/opencode-x86_64-unknown-linux-gnu` `145238144` bytes
- `apps/openwork/apps/desktop/resources/sidecars/opencode` `145238144` bytes
- `apps/openwork/apps/desktop/resources/sidecars/openwork-orchestrator-bun-linux-x64-baseline` `102770816` bytes
- `apps/openwork/apps/desktop/resources/sidecars/openwork-orchestrator` `102770816` bytes
- `apps/openwork/apps/desktop/resources/sidecars/openwork-orchestrator-x86_64-unknown-linux-gnu` `102770816` bytes
- `apps/openwork/packages/docs/images/improved-skills-march11th.gif` `4250321` bytes
- `apps/openwork/ee/apps/landing/public/enterprise-showcase-bg.png` `3145631` bytes
- `apps/openwork/ee/apps/inference/src/models/base.json` `3110941` bytes
- `apps/openwork/packages/docs/images/10thMarch-better-mcp-auth.gif` `2147493` bytes
- `apps/openwork/packages/docs/images/deprecated/new-worker-empty-session.mov` `1796896` bytes
- `apps/openwork/app-demo.gif` `1564937` bytes
- `apps/openwork/packages/docs/images/control-chrome-setup-modal.png` `1398028` bytes
- `apps/openwork/packages/docs/images/deprecated/image-6.png` `1383042` bytes
- `apps/openwork/ee/apps/landing/public/app-demo.mp4` `1381643` bytes
- `apps/openwork/packages/docs/images/chatgpt-new-session-cta.png` `1234999` bytes
- `apps/openwork/packages/docs/images/10thMarch-model-picker.gif` `1190891` bytes
- `apps/openwork/packages/docs/images/get-started-add-remote-workspace.png` `1176240` bytes
- `apps/openwork/packages/docs/images/extensions-control-chrome-app.png` `1162681` bytes
- `apps/openwork/ee/apps/landing/public/enterprise-showcase-bg.jpg` `1108255` bytes
- `apps/openwork/packages/docs/images/exa-search-toggle.png` `1042555` bytes

## `web`

- Path: `apps/web`
- Stack: `node, pnpm`
- Root tracked files: `57`
- Nested git: `False`
- Files scanned: `60`
- Source-like files scanned: `49`

### Package

- Name: `@zeaz/web`
- Version: `0.2.0`
- Scripts: `build, dev, lint, start`

### Ports

- `4101` from `apps/web/.env`
- `4102` from `apps/web/.env`
- `4103` from `apps/web/.env`
- `4104` from `apps/web/.env`
- `4105` from `apps/web/.env`
- `4106` from `apps/web/.env`
- `4107` from `apps/web/.env`
- `4108` from `apps/web/.env`
- `4109` from `apps/web/.env`
- `4110` from `apps/web/.env`
- `4111` from `apps/web/.env`
- `4112` from `apps/web/.env`
- `4113` from `apps/web/.env`
- `5432` from `apps/web/.env`
- `8000` from `apps/web/src/app/dashboard/swarm-runtime/page.tsx, apps/web/src/lib/api.ts`

### Domains

- `api-zcfdash.zeaz.dev` from `apps/web/src/app/dashboard/agents/page.tsx, apps/web/src/app/dashboard/deployments/page.tsx, apps/web/src/app/dashboard/services/page.tsx`
- `api-zdash.zeaz.dev` from `apps/web/.env, apps/web/src/app/dashboard/reports/page.tsx`
- `api.zeaz.dev` from `apps/web/src/app/dashboard/page.tsx, apps/web/src/app/dashboard/services/page.tsx`
- `app.zeaz.dev` from `apps/web/src/app/dashboard/reports/page.tsx`
- `auth.zeaz.dev` from `apps/web/.env`
- `release.zeaz.dev` from `apps/web/.env`
- `ssh.zeaz.dev` from `apps/web/src/app/dashboard/reports/page.tsx`
- `www.zeaz.dev` from `apps/web/README.md, apps/web/next.config.ts, apps/web/src/app/dashboard/reports/page.tsx, apps/web/src/app/marketing/contact/page.tsx, apps/web/src/app/marketing/layout.tsx`
- `zcfdash.zeaz.dev` from `apps/web/next.config.ts`
- `zcino.zeaz.dev` from `apps/web/src/app/dashboard/reports/page.tsx`
- `zdash.zeaz.dev` from `apps/web/.env, apps/web/src/app/dashboard/reports/page.tsx`
- `zveo.zeaz.dev` from `apps/web/src/app/dashboard/reports/page.tsx`

### Env files

- `apps/web/.env` `local-only` keys=106: `ALLOW_ADVANCED_WAF, ALLOW_LOAD_BALANCING, ALLOW_LOGPUSH, ALLOW_PAID_CLOUDFLARE_FEATURES, ALLOW_R2_WRITE, ALLOW_WORKERS_DEPLOY, API_PORT, AUTHENTIK_SECRET_KEY, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_AI_GATEWAY_SLUG, CLOUDFLARE_API_TOKEN, CLOUDFLARE_BOOTSTRAP_TOKEN, CLOUDFLARE_D1_TOKEN, CLOUDFLARE_DNS_TOKEN, CLOUDFLARE_PAGES_TOKEN, CLOUDFLARE_PLAN_TIER, CLOUDFLARE_R2_TOKEN, CLOUDFLARE_TUNNEL_ID, CLOUDFLARE_TUNNEL_NAME, CLOUDFLARE_TUNNEL_TOKEN, CLOUDFLARE_WAF_TOKEN, CLOUDFLARE_WORKERS_TOKEN, CLOUDFLARE_ZONE_ID, CLOUDFLARE_ZT_TOKEN, CONFIRM_TOKEN_DELETE, COST_LOCK, DATABASE_URL, DB_NAME, DB_PASS, DB_USER, DOCKER_API_KEY, DOCKER_LOCATION, DOCKER_REGISTRY_URL, DOCKER_USERNAME, ENVIRONMENT, GH_PAT_KEY, GPG_PASSPHRASE, GRAFANA_PASSWORD, HOSTNAME, IDENTITY_PROVIDER_METADATA_URL, IDENTITY_PROVIDER_TYPE, IDENTITY_PROVIDER_VENDOR, INCLUDE_RESERVED, LINE_CHANNEL_ACCESS_TOKEN, LINE_CHANNEL_SECRET, LINE_WEBHOOK_SECRET, MINIO_ROOT_PASSWORD, MINIO_ROOT_USER, NODE_ENV, NVIDIA_NIM_API_KEY`

### Findings

- `warn` `local_env_file`: Local env file exists: apps/web/.env
- `info` `expected_port_not_detected`: Expected port 3003 from apps-port-plan not detected in source text
- `info` `expected_hostname_not_detected`: Expected hostname zeaz.dev from apps-port-plan not detected in source text

## `zAcademy`

- Path: `apps/zAcademy`
- Stack: `node, terraform`
- Root tracked files: `133`
- Nested git: `False`
- Files scanned: `133`
- Source-like files scanned: `65`

### Package

- Name: `None`
- Version: `None`
- Scripts: `build`

### Ports

- `443` from `apps/zAcademy/infra/kubernetes/payment/networkpolicy.yaml, apps/zAcademy/infra/terraform/payment/network.tf`
- `3009` from `apps/zAcademy/services/payment-domain/payment-service/config/payment.yaml`
- `4317` from `apps/zAcademy/infra/kubernetes/payment/networkpolicy.yaml`
- `8084` from `apps/zAcademy/infra/kubernetes/payment/deployment.yaml, apps/zAcademy/infra/kubernetes/payment/networkpolicy.yaml, apps/zAcademy/tests/platform/load/payment_load.js`
- `8443` from `apps/zAcademy/infra/terraform/payment/network.tf`
- `9090` from `apps/zAcademy/infra/kubernetes/payment/deployment.yaml, apps/zAcademy/infra/kubernetes/payment/service.yaml`

### Domains

- `auth.zeaz.dev` from `apps/zAcademy/services/payment-domain/payment-service/config/payment.yaml`

### Env files

- none detected

### Findings

- `warn` `local_tooling_or_vendor_dir`: .agent exists; excluded from review and should not be committed
- `warn` `local_tooling_or_vendor_dir`: .codex exists; excluded from review and should not be committed
- `warn` `local_tooling_or_vendor_dir`: .gemini exists; excluded from review and should not be committed
- `warn` `local_tooling_or_vendor_dir`: .claude exists; excluded from review and should not be committed
- `info` `expected_port_not_detected`: Expected port 3013 from apps-port-plan not detected in source text
- `info` `expected_hostname_not_detected`: Expected hostname academy.zeaz.dev from apps-port-plan not detected in source text

### TODO/FIXME/HACK hits

- `apps/zAcademy/prompts/codex/enterprise-platform.md:82` `- TODO`
- `apps/zAcademy/prompts/backend/service-generator.md:47` `No TODO.`
- `apps/zAcademy/prompts/backend/enterprise-service.md:75` `No TODO.`
- `apps/zAcademy/prompts/payment/payment-platform.md:61` `No TODO.`
- `apps/zAcademy/tests/platform/artifacts/govulncheck.json:455` `"details": "Int.Exp Montgomery mishandled carry propagation and produced an incorrect output, which makes it easier for attackers to obtain private RSA keys via unspecified vectors`
- `apps/zAcademy/tests/platform/artifacts/govulncheck.json:3176` `"details": "When a Go program running on a Unix system is out of file descriptors and calls syscall.ForkExec (including indirectly by using the os/exec package), syscall.ForkExec c`
- `apps/zAcademy/tests/platform/artifacts/govulncheck.json:6249` `"name": "Guido Vranken, via the Ethereum Foundation bug bounty program"`

## `zLinebot`

- Path: `apps/zLinebot`
- Stack: `docker, node, python, terraform`
- Root tracked files: `961`
- Nested git: `False`
- Files scanned: `977`
- Source-like files scanned: `937`

### Package

- Name: `@zeaz/zlinebot`
- Version: `0.1.0`
- Scripts: `build, dev, health, start`

### Ports

- `587` from `apps/zLinebot/.env.example`
- `3000` from `apps/zLinebot/.env, apps/zLinebot/.env.example, apps/zLinebot/CONTRIBUTING.md, apps/zLinebot/app/src/dr/health.ts, apps/zLinebot/app/src/utils/env.ts, apps/zLinebot/apps/api/src/server.ts, apps/zLinebot/docs/CONTRIBUTING_th.md, apps/zLinebot/docs/INSTALL_FULL.md, apps/zLinebot/docs/MANUAL.md, apps/zLinebot/docs/README_th.md, apps/zLinebot/docs/install_manual_en.md, apps/zLinebot/docs/install_manual_th.md`
- `3001` from `apps/zLinebot/deploy.sh, apps/zLinebot/nginx/default.conf`
- `3002` from `apps/zLinebot/deploy.sh`
- `3100` from `apps/zLinebot/k8s/observability.yaml`
- `5173` from `apps/zLinebot/app/src/services/stripe.ts, apps/zLinebot/docs/INSTALL_FULL.md`
- `5432` from `apps/zLinebot/k8s/postgres.yaml, apps/zLinebot/scripts/legacy_zltt/install-zlttbots-platform.sh, apps/zLinebot/zlinebot-master.sh`
- `6333` from `apps/zLinebot/app/src/services/vector.search.ts, apps/zLinebot/app/src/services/vector.ts`
- `6379` from `apps/zLinebot/app/src/queue/producer.ts, apps/zLinebot/app/src/utils/env.ts, apps/zLinebot/k8s/redis.yaml, apps/zLinebot/scripts/legacy_zltt/generate-enterprise-v8.sh, apps/zLinebot/scripts/legacy_zltt/install-zlttbots-platform.sh, apps/zLinebot/services/ai-orchestrator/src/main.py, apps/zLinebot/services/gpu-renderer/src/api/server.py, apps/zLinebot/services/gpu-renderer/src/core/queue.py, apps/zLinebot/services/market-crawler/src/api/server.py, apps/zLinebot/services/market-crawler/src/core/queue.py, apps/zLinebot/zlinebot-master.sh`
- `8000` from `apps/zLinebot/cloud/worker/consumer.py, apps/zLinebot/services/billing-service/src/main.py, apps/zLinebot/services/budget-allocator/src/main.py, apps/zLinebot/services/capital-allocator/src/main.py, apps/zLinebot/services/feature-store/src/main.py, apps/zLinebot/services/federation/src/main.py, apps/zLinebot/services/landing-service/src/main.py, apps/zLinebot/services/market-orchestrator/src/main.py, apps/zLinebot/services/model-registry/src/main.py, apps/zLinebot/services/model-service/src/main.py, apps/zLinebot/services/payment/main.py, apps/zLinebot/services/product-generator/src/main.py`
- `8080` from `apps/zLinebot/k8s/cockroach.yaml, apps/zLinebot/k8s/deploy.yaml, apps/zLinebot/tests/test_network_egress_client.py`
- `9090` from `apps/zLinebot/k8s/prometheus.yaml`
- `9092` from `apps/zLinebot/docker-compose.yml, apps/zLinebot/k8s/redpanda.yaml`
- `9100` from `apps/zLinebot/scripts/legacy_zltt/start-zlttbots-platform.sh, apps/zLinebot/scripts/legacy_zltt/start-zlttbots.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-doctor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-monitor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-restart-service.sh`
- `9300` from `apps/zLinebot/scripts/legacy_zltt/start-zlttbots-platform.sh, apps/zLinebot/scripts/legacy_zltt/start-zlttbots.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-doctor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-monitor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-restart-service.sh, apps/zLinebot/services/gpu-renderer/src/main.py`
- `9400` from `apps/zLinebot/scripts/legacy_zltt/start-zlttbots-platform.sh, apps/zLinebot/scripts/legacy_zltt/start-zlttbots.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-doctor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-monitor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-restart-service.sh, apps/zLinebot/services/market-crawler/src/main.py`
- `9500` from `apps/zLinebot/scripts/legacy_zltt/start-zlttbots-platform.sh, apps/zLinebot/scripts/legacy_zltt/start-zlttbots.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-doctor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-monitor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-restart-service.sh`
- `9600` from `apps/zLinebot/services/execution-engine/src/main.py`
- `9700` from `apps/zLinebot/services/affiliate-webhook/src/main.py`
- `26257` from `apps/zLinebot/k8s/cockroach.yaml`

### Domains

- `admin.zeaz.dev` from `apps/zLinebot/services/admin-panel/app/page.js, apps/zLinebot/tests/test_safe_edge_pack.py`
- `admin.zlttbots.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/generate-cloudflare-devops-toolkit.sh, apps/zLinebot/scripts/legacy_zltt/repair-platform.sh`
- `ai.zeaz.dev` from `apps/zLinebot/tests/test_safe_edge_pack.py`
- `api.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/deploy-zlttbots-production.sh, apps/zLinebot/scripts/legacy_zltt/install-zeaz-edge-stack.sh, apps/zLinebot/scripts/legacy_zltt/migrate-edge-domain.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-doctor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-monitor.sh, apps/zLinebot/services/admin-panel/app/page.js, apps/zLinebot/tests/test_safe_edge_pack.py`
- `api.zlttbots.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/generate-cloudflare-devops-toolkit.sh, apps/zLinebot/scripts/legacy_zltt/repair-platform.sh`
- `arb.zlttbots.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/generate-cloudflare-devops-toolkit.sh`
- `asia.zeaz.dev` from `apps/zLinebot/services/edge-worker/index.js`
- `auth.zeaz.dev` from `apps/zLinebot/tests/test_safe_edge_pack.py`
- `backup.zlinebot.zeaz.dev` from `apps/zLinebot/infra/cloudflare.yaml`
- `crawl.zeaz.dev` from `apps/zLinebot/tests/test_safe_edge_pack.py`
- `crawler.zlttbots.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/generate-cloudflare-devops-toolkit.sh`
- `eu.zeaz.dev` from `apps/zLinebot/services/edge-worker/index.js`
- `gpu.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/deploy-zlttbots-production.sh, apps/zLinebot/scripts/legacy_zltt/install-zeaz-edge-stack.sh, apps/zLinebot/scripts/legacy_zltt/migrate-edge-domain.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-doctor.sh`
- `grafana.zeaz.dev` from `apps/zLinebot/services/admin-panel/app/page.js, apps/zLinebot/tests/test_safe_edge_pack.py`
- `grafana.zlinebot.zeaz.dev` from `apps/zLinebot/k8s/grafana-ingress.yaml`
- `jaeger.zlinebot.zeaz.dev` from `apps/zLinebot/k8s/observability-ingress.yaml`
- `kafka.zeaz.dev` from `apps/zLinebot/tests/test_safe_edge_pack.py`
- `logs.zlinebot.zeaz.dev` from `apps/zLinebot/k8s/observability-ingress.yaml`
- `predict.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/deploy-zlttbots-production.sh, apps/zLinebot/scripts/legacy_zltt/install-zeaz-edge-stack.sh, apps/zLinebot/scripts/legacy_zltt/migrate-edge-domain.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-doctor.sh, apps/zLinebot/services/admin-panel/app/page.js, apps/zLinebot/tests/test_safe_edge_pack.py`
- `us.zeaz.dev` from `apps/zLinebot/services/edge-worker/index.js`
- `video.zlttbots.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/generate-cloudflare-devops-toolkit.sh`
- `worker.zeaz.dev` from `apps/zLinebot/app/src/ai/edge.ts`
- `zlinebot.zeaz.dev` from `apps/zLinebot/.env, apps/zLinebot/.env.example, apps/zLinebot/README.md, apps/zLinebot/app/src/security/secret-validator.ts, apps/zLinebot/bootstrap.sh, apps/zLinebot/cloudflared/config.yml, apps/zLinebot/docker/nginx/default.conf, apps/zLinebot/infra/cloudflare.yaml, apps/zLinebot/infra/cloudflare_dns.yaml, apps/zLinebot/infra/cloudflare_lb.yaml, apps/zLinebot/k8s/ingress.yaml, apps/zLinebot/k8s/zlinebot-config.yaml`
- `zlttbots.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/deploy-zlttbots-production.sh, apps/zLinebot/scripts/legacy_zltt/install-zeaz-edge-stack.sh, apps/zLinebot/scripts/legacy_zltt/migrate-edge-domain.sh, apps/zLinebot/scripts/legacy_zltt/repair-platform.sh`

### Env files

- `apps/zLinebot/.env` `local-only` keys=38: `APP_URL, AUTOMATION_WORKER_MODE, CLOUDFLARE_API_TOKEN, CLOUDFLARE_TUNNEL_TOKEN, CLOUDFLARE_ZONE_ID, CORS_ORIGIN, DATABASE_URL, DOMAIN, ENCRYPTION_KEY, JWT_SECRET, KAFKA_PASSWORD, LINE_CHANNEL_ACCESS_TOKEN, LINE_CHANNEL_SECRET, LINE_DEFAULT_TENANT_ID, LINE_WEBHOOK_URL, ML_GRPC_SECRET, NODE_ENV, PORT, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, QDRANT_URL, QUEUE_CONCURRENCY, RATE_LIMIT, REDIS_PASSWORD, REDIS_URL, SESSION_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, TENANT_API_KEY, TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI, TIKTOK_SCOPE, TIKTOK_SHOP_ACCESS_TOKEN, TIKTOK_SHOP_API_BASE_URL, TIKTOK_WEBHOOK_SECRET, TIKTOK_WEBHOOK_URL`
- `apps/zLinebot/.env.example` `example` keys=46: `AI_MODE, APP_URL, AUTOMATION_WORKER_MODE, BACKEND_WEBHOOK_URL, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, CLOUDFLARE_BASE_DOMAIN, CLOUDFLARE_TUNNEL_ID, CLOUDFLARE_TUNNEL_TOKEN, CLOUDFLARE_ZONE_ID, CORS_ORIGIN, DATABASE_URL, ENCRYPTION_KEY, FEATURE_SYNC_ENABLED, GPU_BURST, JWT_SECRET, LINE_CHANNEL_ACCESS_TOKEN, LINE_CHANNEL_SECRET, LINE_DEFAULT_TENANT_ID, MAX_BUDGET, NODE_ENV, OLLAMA_URL, OPENAI_API_KEY, OPENAI_MODEL, PORT, PROMPTPAY_ID, QDRANT_URL, QUEUE_CONCURRENCY, RATE_LIMIT, REDIS_URL, SESSION_SECRET, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, TENANT_API_KEY, TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI, TIKTOK_SCOPE, TIKTOK_SHOP_ACCESS_TOKEN, TIKTOK_SHOP_API_BASE_URL, TIKTOK_WEBHOOK_SECRET, VECTOR_MODE`

### Findings

- `warn` `local_env_file`: Local env file exists: apps/zLinebot/.env

### TODO/FIXME/HACK hits

- `apps/zLinebot/CONTRIBUTING.md:16` `- Bug fixes`
- `apps/zLinebot/.github/DISCUSSION_GUIDELINES.md:21` `| Bug Reports | Q&A | Runtime/configuration defects and behavior validation before opening an Issue. | For confirmed code bugs, open an Issue and link it in the discussion. |`
- `apps/zLinebot/scripts/configure_discussions.sh:61` `4. 🐛 Bug Reports             → Answerable`

## `zai-factory`

- Path: `apps/zai-factory`
- Stack: `npm`
- Root tracked files: `0`
- Nested git: `False`
- Files scanned: `1`
- Source-like files scanned: `1`

### Ports

- none detected

### Domains

- none detected

### Env files

- none detected

### Findings

- `info` `expected_port_not_detected`: Expected port 8710 from apps-port-plan not detected in source text
- `info` `expected_hostname_not_detected`: Expected hostname factory.zeaz.dev from apps-port-plan not detected in source text

## `zcfdash`

- Path: `apps/zcfdash`
- Stack: `docker`
- Root tracked files: `2`
- Nested git: `False`
- Files scanned: `2`
- Source-like files scanned: `2`

### Ports

- none detected

### Domains

- `api-zdash.zeaz.dev` from `apps/zcfdash/html/index.html`
- `api-zveo.zeaz.dev` from `apps/zcfdash/html/index.html`
- `api.zeaz.dev` from `apps/zcfdash/html/index.html`
- `app.zeaz.dev` from `apps/zcfdash/html/index.html`
- `openwork.zeaz.dev` from `apps/zcfdash/html/index.html`
- `www.zeaz.dev` from `apps/zcfdash/html/index.html`
- `zaiz.zeaz.dev` from `apps/zcfdash/html/index.html`
- `zcfdash.zeaz.dev` from `apps/zcfdash/docker-compose.yml, apps/zcfdash/html/index.html`
- `zcino.zeaz.dev` from `apps/zcfdash/html/index.html`
- `zdash.zeaz.dev` from `apps/zcfdash/html/index.html`
- `zlms.zeaz.dev` from `apps/zcfdash/html/index.html`
- `zoffice.zeaz.dev` from `apps/zcfdash/html/index.html`
- `zsticker.zeaz.dev` from `apps/zcfdash/html/index.html`
- `ztrader.zeaz.dev` from `apps/zcfdash/html/index.html`
- `zveo.zeaz.dev` from `apps/zcfdash/html/index.html`

### Env files

- none detected

## `zcino`

- Path: `apps/zcino`
- Stack: `docker`
- Root tracked files: `3145`
- Nested git: `False`
- Files scanned: `3150`
- Source-like files scanned: `364`

### Ports

- `3000` from `apps/zcino/README.md, apps/zcino/frontend/Dockerfile, apps/zcino/frontend/start_next.sh`
- `4222` from `apps/zcino/docs/source-checklist.md, apps/zcino/infra/docker-compose.yml, apps/zcino/infra/nats.conf, apps/zcino/k8s/baseline/network-policies.yaml`
- `5432` from `apps/zcino/README.md, apps/zcino/docs/source-checklist.md, apps/zcino/infra/docker-compose.yml, apps/zcino/k8s/baseline/network-policies.yaml`
- `6379` from `apps/zcino/README.md, apps/zcino/docs/operations.md, apps/zcino/docs/source-checklist.md, apps/zcino/infra/docker-compose.yml, apps/zcino/k8s/baseline/network-policies.yaml`
- `6443` from `apps/zcino/release/zeaz_release_v2.sh`
- `8000` from `apps/zcino/Makefile`
- `8080` from `apps/zcino/README.md, apps/zcino/docs/api.md, apps/zcino/docs/operations.md, apps/zcino/infra/docker-compose.yml, apps/zcino/k8s/game-service.yaml`
- `8082` from `apps/zcino/README.md, apps/zcino/infra/docker-compose.yml`
- `8090` from `apps/zcino/README.md, apps/zcino/docker-compose.yml, apps/zcino/docs/source-checklist.md, apps/zcino/k8s/zeaz-testnet/zeaz-node.yaml`
- `8123` from `apps/zcino/infra/docker-compose.yml, apps/zcino/k8s/baseline/network-policies.yaml`
- `8222` from `apps/zcino/infra/docker-compose.yml, apps/zcino/infra/nats.conf`
- `9000` from `apps/zcino/infra/docker-compose.yml`

### Domains

- `zcino.zeaz.dev` from `apps/zcino/INACTIVE_AFTER_MERGE.md, apps/zcino/docker-compose.yml`

### Env files

- `apps/zcino/infra/.env` `local-only` keys=5: `CLICKHOUSE_PASSWORD, JWT_SECRET, NATS_PASSWORD, POSTGRES_PASSWORD, REDIS_PASSWORD`
- `apps/zcino/infra/.env.example` `example` keys=5: `CLICKHOUSE_PASSWORD, JWT_SECRET, NATS_PASSWORD, POSTGRES_PASSWORD, REDIS_PASSWORD`

### Findings

- `warn` `local_env_file`: Local env file exists: apps/zcino/infra/.env

### TODO/FIXME/HACK hits

- `apps/zcino/administrator/jscript/excanvas.js:165` `// TODO: use runtimeStyle and coordsize`
- `apps/zcino/administrator/jscript/excanvas.js:172` `// TODO: use runtimeStyle and coordsize`
- `apps/zcino/administrator/jscript/excanvas.js:338` `// TODO: Branch current matrix so that save/restore has no effect`
- `apps/zcino/administrator/jscript/excanvas.js:654` `// TODO: Following is broken for curves due to`
- `apps/zcino/administrator/jscript/excanvas.js:897` `// TODO: Implement`
- `apps/zcino/administrator/jscript/excanvas.js:901` `// TODO: Implement`
- `apps/zcino/administrator/jscript/calendar.js:1176` `// the bad hack :/ override datepicker so it doesnt close on select`
- `apps/zcino/administrator/jscript/calendar.js:1197` `// second bad hack :/ override datepicker so it triggers an event when changing the input field`
- `apps/zcino/administrator/jscript/calendar.js:1223` `// third bad hack :/ override datepicker so it allows spaces and colon in the input field`
- `apps/zcino/administrator/jscript/calendar.js:1428` `// Hack!  The error message ends with a colon, a space, and`
- `apps/zcino/administrator/js/plugins/wizard/jquery.form.js:107` `// hack to fix Safari hang (thanks to Tim Molendijk for this)`
- `apps/zcino/administrator/js/plugins/charts/jquery.flot.pie.js:17` `2009-11-18: Added bug fix submitted by Xavi Ivars (issues with arrays when other JS libraries are included as well)`
- `apps/zcino/administrator/js/plugins/charts/jquery.flot.pie.js:508` `// TODO: add extra shadow inside hole (with a mask) if the pie is tilted.`
- `apps/zcino/administrator/js/plugins/charts/jquery.flot.pie.js:567` `// TODO: perhaps do some mathmatical trickery here with the Y-coordinate to compensate for pie tilt?`
- `apps/zcino/administrator/js/plugins/charts/jquery.flot.js:447` `// FIXME: if we're getting to close to something else,`
- `apps/zcino/administrator/js/plugins/charts/jquery.flot.js:697` `if (!c.getContext) // excanvas hack`
- `apps/zcino/administrator/js/plugins/charts/jquery.flot.js:1946` `// FIXME: consider another form of shadow when filling is turned on`
- `apps/zcino/administrator/js/plugins/charts/jquery.flot.js:2113` `// FIXME: inline moveTo is buggy with excanvas`
- `apps/zcino/administrator/js/plugins/charts/jquery.flot.js:2149` `// FIXME: figure out a way to add shadows (for instance along the right edge)`
- `apps/zcino/administrator/js/plugins/forms/jquery.cleditor.js:824` `// Work around for bug in IE which causes the editor to lose`
- `apps/zcino/administrator/js/plugins/forms/jquery.validationEngine.js:593` `// Hack for radio/checkbox group button, the validation go into the`
- `apps/zcino/administrator/js/plugins/spinner/jquery.mousewheel.js:5` `* Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.`
- `apps/zcino/administrator/js/plugins/spinner/ui.spinner.js:44` `// TODO: add support for object, area`
- `apps/zcino/administrator/js/plugins/spinner/ui.spinner.js:209` `// TODO: merge getter and getterSetter properties from widget prototype`
- `apps/zcino/administrator/js/plugins/spinner/ui.spinner.js:330` `// TODO: determine which cases actually cause this to happen`
- `apps/zcino/administrator/js/plugins/spinner/ui.spinner.js:360` `// TODO: make sure destroying one instance of mouse doesn't mess with`
- `apps/zcino/administrator/css/calendar.css:325` `/* IE/Win - Fix animation bug - #4615 */`
- `apps/zcino/administrator/css/calendar.css:479` `.ui-tabs { position: relative; padding: .2em; zoom: 1; } /* position: relative prevents IE scroll bug (element with position: relative inside container with overflow: auto appear a`
- `apps/zcino/administrator/css/calendar.css:485` `.ui-tabs .ui-tabs-nav li a, .ui-tabs.ui-tabs-collapsible .ui-tabs-nav li.ui-tabs-selected a { cursor: pointer; } /* first selector in group seems obsolete, but required to overcome`
- `apps/zcino/administrator/css/ui_custom.css:461` `.ui-tabs { position: relative; padding: .2em; zoom: 1; } /* position: relative prevents IE scroll bug (element with position: relative inside container with overflow: auto appear a`
- `apps/zcino/administrator/css/ui_custom.css:467` `.ui-tabs .ui-tabs-nav li a, .ui-tabs.ui-tabs-collapsible .ui-tabs-nav li.ui-tabs-selected a { cursor: pointer; } /* first selector in group seems obsolete, but required to overcome`
- `apps/zcino/legacy/php/resources/games_flash/CWS_OTHER_EUROPEAN_ROULETTE_3D/history/history.js:315` `//IE seems to have a bug where it stops updating the URL it`
- `apps/zcino/legacy/php/resources/games_flash/CWS_OTHER_EUROPEAN_ROULETTE_3D/history/history.js:372` `// FIXME: could this ever be a forward button?`
- `apps/zcino/legacy/php/jscript/calendar.js:53` `// TODO: determine which cases actually cause this to happen`
- `apps/zcino/legacy/php/jscript/calendar.js:315` `// TODO rename to "widget" when switching to widget factory`
- `apps/zcino/css/calendar.css:178` `/* IE/Win - Fix animation bug - #4615 */`
- `apps/zcino/css/calendar.css:437` `.ui-tabs { position: relative; padding: .2em; zoom: 1; } /* position: relative prevents IE scroll bug (element with position: relative inside container with overflow: auto appear a`
- `apps/zcino/css/calendar.css:443` `.ui-tabs .ui-tabs-nav li a, .ui-tabs.ui-tabs-collapsible .ui-tabs-nav li.ui-tabs-selected a { cursor: pointer; } /* first selector in group seems obsolete, but required to overcome`
- `apps/zcino/docs/zeaz-protocol.md:11` `- Major versions may break wire compatibility; minor versions may add optional fields; patch versions are bug-fix compatible.`
- `apps/zcino/docs/protocol/v1.0.0/spec.md:41` `- Patch versions contain clarifications or bug fixes. During negotiation, a node MAY downgrade a requested patch to its current patch.`

### Large files

- `apps/zcino/game-catalog-service` `22640674` bytes
- `apps/zcino/legacy/php/template_files11/Banner-Header.psd` `13148120` bytes
- `apps/zcino/images/slider/slider.psd` `9913234` bytes
- `apps/zcino/legacy/php/resources/games_flash/CWS_OTHER_EUROPEAN_ROULETTE_3D/Roulette.swf` `7214262` bytes
- `apps/zcino/administrator/includes/resources/tools/dictionary-import/sample-words-en.txt` `2312631` bytes
- `apps/zcino/legacy/php/template_files11/Banner-Top3.psd` `2237781` bytes
- `apps/zcino/legacy/php/template_files11/Banner-Top2.psd` `1088772` bytes

## `zcloud`

- Path: `apps/zcloud`
- Stack: `node, npm`
- Root tracked files: `28`
- Nested git: `False`
- Files scanned: `28`
- Source-like files scanned: `25`

### Package

- Name: `@zeaz/zcloud`
- Version: `1.0.0`
- Scripts: `build, dev, lint, start, start:static, validate`

### Ports

- `4177` from `apps/zcloud/README.md`
- `5000` from `apps/zcloud/src/app/api/chat/route.ts`
- `11434` from `apps/zcloud/src/app/api/chat/route.ts`
- `18789` from `apps/zcloud/src/app/api/chat/route.ts`

### Domains

- none detected

### Env files

- none detected

### Findings

- `info` `expected_port_not_detected`: Expected port 3004 from apps-port-plan not detected in source text
- `info` `expected_hostname_not_detected`: Expected hostname zcloud.zeaz.dev from apps-port-plan not detected in source text

## `zdash`

- Path: `apps/zdash`
- Stack: `docker, python, terraform`
- Root tracked files: `1128`
- Nested git: `False`
- Files scanned: `1116`
- Source-like files scanned: `1025`

### Ports

- `443` from `apps/zdash/install-zdash-prod.sh`
- `587` from `apps/zdash/.env, apps/zdash/.env.example, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt`
- `3000` from `apps/zdash/infra/k8s/configmap.yaml`
- `5173` from `apps/zdash/.env, apps/zdash/.env.example, apps/zdash/.github/workflows/e2e.yml, apps/zdash/backend/app/core/config.py, apps/zdash/backend/app/tests/test_phase7_dashboard_api.py, apps/zdash/docs/reports/zdash-deep-dive-review-audit-2026-05-30.md, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt, apps/zdash/docs/runbooks/GO_LIVE_CHECKLIST.md, apps/zdash/docs/runbooks/INSTALLATION.md, apps/zdash/docs/runbooks/QUICK_START.md, apps/zdash/docs/runbooks/ROLLBACK_RUNBOOK.md, apps/zdash/docs/runbooks/START_SERVER.md`
- `5432` from `apps/zdash/.env, apps/zdash/.env.example, apps/zdash/.github/workflows/e2e.yml, apps/zdash/backend/alembic.ini, apps/zdash/backend/app/core/config.py, apps/zdash/backend/app/tests/test_production_safety.py, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt, apps/zdash/infra/k8s/postgres-statefulset.yaml`
- `5436` from `apps/zdash/docker-compose.prod.yml`
- `6379` from `apps/zdash/infra/k8s/redis-deployment.yaml`
- `8000` from `apps/zdash/Makefile, apps/zdash/docs/prompts/AI_CODING_PROMPTS_INDEX.md, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt`
- `8005` from `apps/zdash/.env, apps/zdash/.env.example, apps/zdash/.github/workflows/e2e.yml, apps/zdash/AGENTS.md, apps/zdash/docker-compose.prod.yml, apps/zdash/docker-compose.yml, apps/zdash/docs/AI_TRADER_CONTROL_PLANE.md, apps/zdash/docs/architecture/PHASE_10_SAAS_MONETIZATION.md, apps/zdash/docs/architecture/PHASE_33_AI_TRADER_SIMULATION.md, apps/zdash/docs/releases/final-release-checklist.md, apps/zdash/docs/reports/zdash-deep-dive-review-audit-2026-05-30.md, apps/zdash/docs/reports/zdash-deep-scan/04-routes-api.txt`
- `9009` from `apps/zdash/docs/reports/zdash-deep-scan/06-package-make-scripts.txt`
- `9090` from `apps/zdash/docker-compose.prod.yml`
- `16379` from `apps/zdash/docker-compose.prod.yml`
- `16380` from `apps/zdash/.env, apps/zdash/.env.example, apps/zdash/scripts/feature-local-env.sh`

### Domains

- `api-zdash.zeaz.dev` from `apps/zdash/IMPORT_SOURCE.md, apps/zdash/Makefile, apps/zdash/README.md, apps/zdash/infra/cloudflare/tunnel-config.example.yml, apps/zdash/infra/k8s/nginx-ingress.yaml`
- `release.zeaz.dev` from `apps/zdash/IMPORT_SOURCE.md, apps/zdash/Makefile`
- `zdash.zeaz.dev` from `apps/zdash/.env, apps/zdash/.env.example, apps/zdash/CODE-OF-CONDUCT.md, apps/zdash/COMMUNITY.md, apps/zdash/CONTRIBUTING.md, apps/zdash/IMPORT_SOURCE.md, apps/zdash/Makefile, apps/zdash/README.md, apps/zdash/SECURITY.md, apps/zdash/backend/app/core/config.py, apps/zdash/docs/ops/SIGNED_RELEASE_ATTESTATION.md, apps/zdash/docs/releases/FINAL_RELEASE_NOTES.md`

### Env files

- `apps/zdash/.env` `local-only` keys=259: `AIOPS_ENABLED, AI_PROVIDER, AI_TRADING_ANALYSIS_ENABLED, AI_TRADING_PROVIDER, ALERT_RULES_ENABLED, ALLOWED_DATA_REGIONS, ALLOW_MANUAL_RESUME, ALLOW_STRATEGY_PROMOTION, API_KEY_DEFAULT_EXPIRES_DAYS, API_KEY_HASH_PEPPER, API_KEY_PREFIX, APP_ENV, APP_NAME, AUTH_ALLOW_BOOTSTRAP_IN_PRODUCTION, AUTH_ENABLED, BACKEND_HOST, BACKEND_PORT, BACKTESTING_ENABLED, BACKTEST_COMMISSION_PER_TRADE, BACKTEST_DATASET_SOURCE, BACKTEST_DEFAULT_RISK_PER_TRADE_PERCENT, BACKTEST_DEFAULT_SYMBOL, BACKTEST_DEFAULT_TIMEFRAME, BACKTEST_INITIAL_BALANCE, BACKTEST_SLIPPAGE_POINTS, BACKTEST_SPREAD_POINTS, BILLING_CURRENCY, BILLING_ENABLED, BILLING_FAIL_CLOSED, BILLING_GRACE_PERIOD_DAYS, BILLING_PROVIDER, BILLING_TRIAL_DAYS, BILLING_WEBHOOK_SECRET, BLAST_RADIUS_ANALYSIS_ENABLED, BOOTSTRAP_ADMIN_PASSWORD, BOOTSTRAP_ADMIN_USERNAME, CLAUDE_API_KEY, CLAUDE_MODEL, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, CLOUDFLARE_DRY_RUN, CLOUDFLARE_ENABLED, CLOUDFLARE_HOSTNAME, CLOUDFLARE_OPERATOR_REPO, CLOUDFLARE_TUNNEL_NAME, CLOUDFLARE_ZONE_ID, COMPLIANCE_ENABLED, CONTENT_DEFAULT_BRAND, CONTENT_DEFAULT_LANGUAGE, CONTENT_DEFAULT_TONE`
- `apps/zdash/.env.example` `example` keys=257: `AIOPS_ENABLED, AI_PROVIDER, AI_TRADING_ANALYSIS_ENABLED, AI_TRADING_PROVIDER, ALERT_RULES_ENABLED, ALLOWED_DATA_REGIONS, ALLOW_MANUAL_RESUME, ALLOW_STRATEGY_PROMOTION, API_KEY_DEFAULT_EXPIRES_DAYS, API_KEY_HASH_PEPPER, API_KEY_PREFIX, APP_ENV, APP_NAME, AUTH_ALLOW_BOOTSTRAP_IN_PRODUCTION, AUTH_ENABLED, BACKEND_HOST, BACKEND_PORT, BACKTESTING_ENABLED, BACKTEST_COMMISSION_PER_TRADE, BACKTEST_DATASET_SOURCE, BACKTEST_DEFAULT_RISK_PER_TRADE_PERCENT, BACKTEST_DEFAULT_SYMBOL, BACKTEST_DEFAULT_TIMEFRAME, BACKTEST_INITIAL_BALANCE, BACKTEST_SLIPPAGE_POINTS, BACKTEST_SPREAD_POINTS, BILLING_CURRENCY, BILLING_ENABLED, BILLING_FAIL_CLOSED, BILLING_GRACE_PERIOD_DAYS, BILLING_PROVIDER, BILLING_TRIAL_DAYS, BILLING_WEBHOOK_SECRET, BLAST_RADIUS_ANALYSIS_ENABLED, BOOTSTRAP_ADMIN_PASSWORD, BOOTSTRAP_ADMIN_USERNAME, CLAUDE_API_KEY, CLAUDE_MODEL, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, CLOUDFLARE_DRY_RUN, CLOUDFLARE_ENABLED, CLOUDFLARE_HOSTNAME, CLOUDFLARE_OPERATOR_REPO, CLOUDFLARE_TUNNEL_NAME, CLOUDFLARE_ZONE_ID, COMPLIANCE_ENABLED, CONTENT_DEFAULT_BRAND, CONTENT_DEFAULT_LANGUAGE, CONTENT_DEFAULT_TONE`
- `apps/zdash/.env.production` `local-only` keys=19: `APP_ENV, AUTH_ALLOW_BOOTSTRAP_IN_PRODUCTION, AUTH_ENABLED, BOOTSTRAP_ADMIN_PASSWORD, BOOTSTRAP_ADMIN_USERNAME, DATABASE_URL, DEFAULT_ADMIN_PASSWORD, DRY_RUN, JWT_ALGORITHM, JWT_SECRET_KEY, LIVE_TRADING_ACK, METRICS_ALLOW_UNAUTHENTICATED_DEV, METRICS_AUTH_REQUIRED, MT5_ENABLED, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, PRODUCTION_ALLOW_LIVE_ACTIONS, PRODUCTION_SAFETY_LOCK`

### Findings

- `warn` `local_tooling_or_vendor_dir`: .codex exists; excluded from review and should not be committed
- `warn` `local_env_file`: Local env file exists: apps/zdash/.env.production
- `warn` `local_env_file`: Local env file exists: apps/zdash/.env

### TODO/FIXME/HACK hits

- `apps/zdash/backend/app/tests/test_team_api.py:264` `# GET /api/team/workspace-access?workspace_id=xxx`
- `apps/zdash/.github/ISSUE_TEMPLATE/bug_report.md:2` `name: Bug report`
- `apps/zdash/.github/ISSUE_TEMPLATE/bug_report.md:3` `about: Report a bug to help improve zDash`
- `apps/zdash/.github/ISSUE_TEMPLATE/bug_report.md:4` `title: '[bug] '`
- `apps/zdash/.github/ISSUE_TEMPLATE/bug_report.md:5` `labels: bug`
- `apps/zdash/.github/ISSUE_TEMPLATE/bug_report.md:10` `**Describe the bug**`
- `apps/zdash/.github/ISSUE_TEMPLATE/bug_report.md:11` `A clear and concise description of the bug.`
- `apps/zdash/tools/zdash-audit/zdash-audit/scripts/deep-scan-zdash.sh:106` `| TODO | TODO | make safety-scan | TODO | TODO |`
- `apps/zdash/tools/zdash-audit/zdash-audit/scripts/deep-scan-zdash.sh:107` `| TODO | TODO | make validate-fast | TODO | TODO |`
- `apps/zdash/tools/zdash-audit/zdash-audit/scripts/deep-scan-zdash.sh:108` `| TODO | TODO | make validate | TODO | TODO |`
- `apps/zdash/tools/zdash-audit/zdash-audit/scripts/deep-scan-zdash.sh:109` `| TODO | TODO | docker compose config | TODO | TODO |`
- `apps/zdash/config/ecc/codex/agents/reviewer.toml:8` `Lead with concrete findings and avoid style-only feedback unless it hides a real bug.`
- `apps/zdash/docs/zai-e2e.md:218` `| **Regression Test Agent**    | bug prevention, release checks         | regression suite          |`
- `apps/zdash/docs/zai-e2e.md:224` `| **Bug Triage Agent**         | severity, reproduction, prioritization | bug list                  |`
- `apps/zdash/docs/zai-e2e.md:276` `| **Post-Release Agent**      | verification, monitoring, bug capture | post-release report |`
- `apps/zdash/docs/zai-e2e.md:770` `Bug Triage Agent`
- `apps/zdash/docs/releases/final-release-notes-template.md:17` `## Bug fixes`
- `apps/zdash/docs/runbooks/INCIDENT_RESPONSE.md:9` `| **SEV3** | Minor issue with workaround available | UI bug, non-critical error, documentation issue | 4 hours | < 24 hours |`
- `apps/zdash/scripts/deep-scan-zdash.sh:106` `| TODO | TODO | make safety-scan | TODO | TODO |`
- `apps/zdash/scripts/deep-scan-zdash.sh:107` `| TODO | TODO | make validate-fast | TODO | TODO |`
- `apps/zdash/scripts/deep-scan-zdash.sh:108` `| TODO | TODO | make validate | TODO | TODO |`
- `apps/zdash/scripts/deep-scan-zdash.sh:109` `| TODO | TODO | docker compose config | TODO | TODO |`

### Large files

- `apps/zdash/frontend/images/Agents Graphic.png` `2501304` bytes
- `apps/zdash/frontend/images/Agents Friday.png` `2447280` bytes
- `apps/zdash/frontend/images/Agents Editer.png` `2367005` bytes
- `apps/zdash/frontend/images/Agents Analyst.png` `2310794` bytes
- `apps/zdash/frontend/images/Agents Social.png` `2277565` bytes
- `apps/zdash/frontend/images/Agents Guardian.png` `2232538` bytes
- `apps/zdash/frontend/images/Agents Manager.png` `2231082` bytes
- `apps/zdash/frontend/images/Agents Cypto.png` `2226133` bytes
- `apps/zdash/frontend/images/Agents CEO zDash.png` `2059671` bytes

## `zdev`

- Path: `apps/zdev`
- Stack: `node`
- Root tracked files: `7`
- Nested git: `False`
- Files scanned: `7`
- Source-like files scanned: `6`

### Package

- Name: `@zeaz/zdev`
- Version: `1.0.0`
- Scripts: `build, start, validate`

### Ports

- `4181` from `apps/zdev/README.md`

### Domains

- none detected

### Env files

- none detected

## `zlms`

- Path: `apps/zlms`
- Stack: `docker, node, pnpm`
- Root tracked files: `28488`
- Nested git: `False`
- Files scanned: `28475`
- Source-like files scanned: `11599`

### Package

- Name: `zlms-frontend-runtime-migration`
- Version: `0.1.0`
- Scripts: `audit:frontend-runtime, build, codemod:frontend-runtime, migration:phase-abcd, typecheck:frontend-runtime`

### Ports

- `131` from `apps/zlms/app/courseware/user_guide/searchindex.js, apps/zlms/app/examdb/user_guide/searchindex.js`
- `135` from `apps/zlms/app/courseware/user_guide/searchindex.js, apps/zlms/app/examdb/user_guide/searchindex.js`
- `155` from `apps/zlms/app/courseware/user_guide/searchindex.js, apps/zlms/app/examdb/user_guide/searchindex.js`
- `443` from `apps/zlms/k8s/runtime-security-fabric.yaml, apps/zlms/z-runner/kubernetes/runner-networkpolicy.yaml`
- `3000` from `apps/zlms/app/assets/global/plugins/bootstrap-editable/README.md, apps/zlms/app/bin/Release/Publish/assets/global/plugins/bootstrap-editable/README.md, apps/zlms/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-editable/README.md, apps/zlms/docker-compose.yml, apps/zlms/git-tools.sh`
- `4318` from `apps/zlms/k8s/runtime-security-fabric.yaml`
- `5432` from `apps/zlms/app/courseware/user_guide/database/configuration.html, apps/zlms/app/examdb/user_guide/database/configuration.html`
- `6379` from `apps/zlms/app/courseware/user_guide/libraries/sessions.html, apps/zlms/app/examdb/user_guide/libraries/sessions.html`
- `8000` from `apps/zlms/app/assets/global/plugins/bootstrap-pwstrength/README.md, apps/zlms/app/assets/global/plugins/bootstrap-select/README.md, apps/zlms/app/bin/Release/Publish/assets/global/plugins/bootstrap-pwstrength/README.md, apps/zlms/app/bin/Release/Publish/assets/global/plugins/bootstrap-select/README.md, apps/zlms/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-pwstrength/README.md, apps/zlms/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-select/README.md`
- `8080` from `apps/zlms/UBUNTU_24_04_MANUAL.md, apps/zlms/app/courseware/user_guide/libraries/xmlrpc.html, apps/zlms/app/examdb/user_guide/libraries/xmlrpc.html, apps/zlms/k8s/runtime-security-fabric.yaml`
- `8888` from `apps/zlms/app/assets/global/plugins/typeahead/README.md, apps/zlms/app/bin/Release/Publish/assets/global/plugins/typeahead/README.md, apps/zlms/app/obj/Release/Package/PackageTmp/assets/global/plugins/typeahead/README.md`
- `9000` from `apps/zlms/app/assets/global/plugins/codemirror/mode/nginx/index.html, apps/zlms/app/bin/Release/Publish/assets/global/plugins/codemirror/mode/nginx/index.html, apps/zlms/app/obj/Release/Package/PackageTmp/assets/global/plugins/codemirror/mode/nginx/index.html`
- `9080` from `apps/zlms/z-runner/telemetry/promtail.yaml`
- `9102` from `apps/zlms/z-runner/kubernetes/runner-deployment.yaml, apps/zlms/z-runner/telemetry/otel-config.yaml`
- `11211` from `apps/zlms/app/courseware/user_guide/libraries/sessions.html, apps/zlms/app/examdb/user_guide/libraries/sessions.html`

### Domains

- `pgadmin.zeaz.dev` from `apps/zlms/docker-compose.yml`
- `zlms.zeaz.dev` from `apps/zlms/README.md, apps/zlms/docker-compose.yml`

### Env files

- none detected

### Findings

- `info` `expected_port_not_detected`: Expected port 8012 from apps-port-plan not detected in source text

### TODO/FIXME/HACK hits

- `apps/zlms/CHANGELOG.md:1` `## [Unreleased] - Bug Fixes & Security Patches`
- `apps/zlms/app/Scripts/globalize.js:116` `// TODO: more detailed description and example`
- `apps/zlms/app/Scripts/globalize.js:136` `// TODO: more detailed description and example`
- `apps/zlms/app/Scripts/globalize.js:153` `// TODO: more detailed description and example`
- `apps/zlms/app/Scripts/jquery-1.10.2.js:1586` `// We allow this because of a bug in IE8/9 that throws an error`
- `apps/zlms/app/Scripts/jquery-1.10.2.js:3488` `// hidden; don safety goggles and see bug #4512 for more information).`
- `apps/zlms/app/Scripts/jquery-1.10.2.js:3519` `// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right`
- `apps/zlms/app/Scripts/jquery-1.10.2.js:4607` `// Set width and height to auto instead of 0 on empty string( Bug #8150 )`
- `apps/zlms/app/Scripts/jquery-1.10.2.js:7005` `// Fixes bug #9237`
- `apps/zlms/app/Scripts/jquery-1.10.2.js:7029` `// Fixes bug #5509`
- `apps/zlms/app/Scripts/jquery-1.10.2.js:7102` `// A tribute to the "awesome hack by Dean Edwards"`
- `apps/zlms/app/Scripts/jquery-1.10.2.js:7143` `// From the awesome hack by Dean Edwards`
- `apps/zlms/app/Scripts/jquery-1.10.2.js:7385` `// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right`
- `apps/zlms/app/Scripts/jquery-1.10.2.js:7394` `// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084`
- `apps/zlms/app/Scripts/jquery-1.10.2.js:8468` `// Bind script tag hack transport`
- `apps/zlms/app/Scripts/jquery-1.10.2.js:8907` `// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)`
- `apps/zlms/app/Scripts/jquery-1.10.2.js:9738` `// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.`
- `apps/zlms/app/DropzoneJs_scripts/dropzone.js:1723` `Source: http://stackoverflow.com/questions/11929099/html5-canvas-drawimage-ratio-bug-ios`
- `apps/zlms/app/examdb/contributing.md:6` `Issues are a quick way to point out a bug. If you find a bug or documentation error in CodeIgniter then please check a few things first:`
- `apps/zlms/app/examdb/user_guide/changelog.html:434` `<div class="section" id="bug-fixes-for-3-1-10">`
- `apps/zlms/app/examdb/user_guide/changelog.html:435` `<h3>Bug fixes for 3.1.10<a class="headerlink" href="#bug-fixes-for-3-1-10" title="Permalink to this headline">¶</a></h3>`
- `apps/zlms/app/examdb/user_guide/changelog.html:437` `<li>Fixed a bug (#5526) - <a class="reference internal" href="libraries/sessions.html"><span class="doc">Session Library</span></a> had a syntax error in its ‘memcached’ driver.</l`
- `apps/zlms/app/examdb/user_guide/changelog.html:438` `<li>Fixed a bug (#5542) - <a class="reference internal" href="database/forge.html"><span class="doc">Database Forge</span></a> method <code class="docutils literal"><span class="pr`
- `apps/zlms/app/examdb/user_guide/changelog.html:439` `<li>Fixed a bug (#5561) - <a class="reference internal" href="database/index.html"><span class="doc">Database Library</span></a> didn’t allow SSL connection configuration with only`
- `apps/zlms/app/examdb/user_guide/changelog.html:440` `<li>Fixed a bug (#5545) - <a class="reference internal" href="libraries/sessions.html"><span class="doc">Session Library</span></a> crashed due to a caching-related error with the `
- `apps/zlms/app/examdb/user_guide/changelog.html:441` `<li>Fixed a bug (#5571) - <a class="reference internal" href="libraries/xmlrpc.html"><span class="doc">XML-RPC Library</span></a> had a typo that triggered an <code class="docutils`
- `apps/zlms/app/examdb/user_guide/changelog.html:442` `<li>Fixed a bug (#5587) - <a class="reference internal" href="database/forge.html"><span class="doc">Database Forge</span></a> method <code class="docutils literal"><span class="pr`
- `apps/zlms/app/examdb/user_guide/changelog.html:443` `<li>Fixed a bug (#5590) - <a class="reference internal" href="libraries/form_validation.html"><span class="doc">Form Validation Library</span></a> rule <strong>valid_base64</strong`
- `apps/zlms/app/examdb/user_guide/changelog.html:444` `<li>Fixed a bug (#5624) - <a class="reference internal" href="database/index.html"><span class="doc">Database Library</span></a> methods <code class="docutils literal"><span class=`
- `apps/zlms/app/examdb/user_guide/changelog.html:445` `<li>Fixed a bug (#5627) - <a class="reference internal" href="database/index.html"><span class="doc">Database</span></a> driver ‘mysqli’ triggered an <code class="docutils literal"`
- `apps/zlms/app/examdb/user_guide/changelog.html:446` `<li>Fixed a bug (#5651) - <a class="reference internal" href="database/caching.html"><span class="doc">Database Caching</span></a> could try to delete non-existent cache files due `
- `apps/zlms/app/examdb/user_guide/changelog.html:447` `<li>Fixed a bug (#5652) - <a class="reference internal" href="helpers/captcha_helper.html"><span class="doc">CAPTCHA Helper</span></a> function <a class="reference internal" href="`
- `apps/zlms/app/examdb/user_guide/changelog.html:448` `<li>Fixed a bug (#5605) - <a class="reference internal" href="libraries/form_validation.html"><span class="doc">Form Validation Library</span></a> didn’t nullify array inputs that `
- `apps/zlms/app/examdb/user_guide/changelog.html:471` `<div class="section" id="bug-fixes-for-3-1-9">`
- `apps/zlms/app/examdb/user_guide/changelog.html:472` `<h3>Bug fixes for 3.1.9<a class="headerlink" href="#bug-fixes-for-3-1-9" title="Permalink to this headline">¶</a></h3>`
- `apps/zlms/app/examdb/user_guide/changelog.html:476` `<li>Fixed a bug (#5516) - <a class="reference internal" href="helpers/html_helper.html"><span class="doc">HTML Helper</span></a> functions <a class="reference internal" href="helpe`
- `apps/zlms/app/examdb/user_guide/changelog.html:488` `<li>Fixed a bug where <a class="reference internal" href="libraries/security.html"><span class="doc">Security Library</span></a> method <code class="docutils literal"><span class="`
- `apps/zlms/app/examdb/user_guide/changelog.html:499` `<div class="section" id="bug-fixes-for-3-1-8">`
- `apps/zlms/app/examdb/user_guide/changelog.html:500` `<h3>Bug fixes for 3.1.8<a class="headerlink" href="#bug-fixes-for-3-1-8" title="Permalink to this headline">¶</a></h3>`
- `apps/zlms/app/examdb/user_guide/changelog.html:502` `<li>Fixed a bug where <a class="reference internal" href="libraries/form_validation.html"><span class="doc">Form Validation Library</span></a>, <a class="reference internal" href="`
- `apps/zlms/app/examdb/user_guide/changelog.html:503` `<li>Fixed a bug where <a class="reference internal" href="database/query_builder.html"><span class="doc">Query Builder</span></a> methods <code class="docutils literal"><span class`
- `apps/zlms/app/examdb/user_guide/changelog.html:504` `<li>Fixed a bug (#5423) - <a class="reference internal" href="database/index.html"><span class="doc">Database Library</span></a> method <code class="docutils literal"><span class="`
- `apps/zlms/app/examdb/user_guide/changelog.html:505` `<li>Fixed a bug (#5425) - <a class="reference internal" href="libraries/xmlrpc.html"><span class="doc">XML-RPC Library</span></a> produced an error message related to <code class="`
- `apps/zlms/app/examdb/user_guide/changelog.html:506` `<li>Fixed a bug (#5434) - <a class="reference internal" href="libraries/image_lib.html"><span class="doc">Image Manipulation Library</span></a> attempted to <code class="docutils l`
- `apps/zlms/app/examdb/user_guide/changelog.html:507` `<li>Fixed a bug (#5435) - <a class="reference internal" href="database/results.html"><span class="doc">Database Results</span></a> method <code class="docutils literal"><span class`
- `apps/zlms/app/examdb/user_guide/changelog.html:525` `<div class="section" id="bug-fixes-for-3-1-7">`
- `apps/zlms/app/examdb/user_guide/changelog.html:526` `<h3>Bug fixes for 3.1.7<a class="headerlink" href="#bug-fixes-for-3-1-7" title="Permalink to this headline">¶</a></h3>`
- `apps/zlms/app/examdb/user_guide/changelog.html:530` `<li>Fixed a bug (#5278) - <a class="reference internal" href="helpers/url_helper.html"><span class="doc">URL Helper</span></a> function <a class="reference internal" href="helpers/`
- `apps/zlms/app/examdb/user_guide/changelog.html:532` `<li>Fixed a bug (#5279) - <a class="reference internal" href="database/query_builder.html"><span class="doc">Query Builder</span></a> didn’t account for already escaped identifiers`
- `apps/zlms/app/examdb/user_guide/changelog.html:533` `<li>Fixed a bug (#5331) - <a class="reference internal" href="helpers/url_helper.html"><span class="doc">URL Helper</span></a> function <a class="reference internal" href="helpers/`

### Large files

- `apps/zlms/app/bin/Release/Publish/bin.zip` `53023928` bytes
- `apps/zlms/app/bin/DevExpress.Web.ASPxThemes.v18.2.dll` `46995192` bytes
- `apps/zlms/app/bin/Release/Publish/bin/DevExpress.Web.ASPxThemes.v14.2.dll` `44642784` bytes
- `apps/zlms/app/obj/Release/Package/PackageTmp/bin/DevExpress.Web.ASPxThemes.v14.2.dll` `44642784` bytes
- `apps/zlms/app/bin/DevExpress.Web.v18.2.dll` `21486328` bytes
- `apps/zlms/app/devexpress/DevExpress.Web.ASPxThemes.v16.2.dll` `19518248` bytes
- `apps/zlms/app/bin/DevExpress.Web.Resources.v18.2.dll` `17517816` bytes
- `apps/zlms/app/devexpress/DevExpress.Web.v16.2.dll` `16203048` bytes
- `apps/zlms/app/bin/DevExpress.Utils.v18.2.dll` `14028536` bytes
- `apps/zlms/app/devexpress/DevExpress.Web.ASPxSpreadsheet.v16.2.dll` `13938472` bytes
- `apps/zlms/app/bin/Release/Publish/bin/DevExpress.Web.v14.2.dll` `13335008` bytes
- `apps/zlms/app/obj/Release/Package/PackageTmp/bin/DevExpress.Web.v14.2.dll` `13335008` bytes
- `apps/zlms/app/devexpress/DevExpress.XtraReports.v16.2.Web.dll` `13249320` bytes
- `apps/zlms/app/devexpress/DevExpress.Spreadsheet.v16.2.Core.dll` `12795176` bytes
- `apps/zlms/app/devexpress/DevExpress.Web.Resources.v16.2.dll` `11303208` bytes
- `apps/zlms/db/POLICE_LMS.mdf` `9437184` bytes
- `apps/zlms/app/devexpress/DevExpress.Utils.v16.2.dll` `9020200` bytes
- `apps/zlms/app/bin/DevExpress.Images.v18.2.dll` `8426232` bytes
- `apps/zlms/app/knowledge/App_Data/Database_log.ldf` `8388608` bytes
- `apps/zlms/app/knowledge/App_Data/Database.mdf` `8388608` bytes
- `apps/zlms/app/bin/DevExpress.RichEdit.v18.2.Core.dll` `8267512` bytes
- `apps/zlms/app/bin/DevExpress.Data.v18.2.dll` `6845176` bytes
- `apps/zlms/app/devexpress/DevExpress.RichEdit.v16.2.Core.dll` `6602536` bytes
- `apps/zlms/app/knowledge_old/App_Data/Database.mdf` `6553600` bytes
- `apps/zlms/app/knowledge_crash/App_Data/Database.mdf` `6553600` bytes

## `zoffice`

- Path: `apps/zoffice`
- Stack: `docker`
- Root tracked files: `180`
- Nested git: `False`
- Files scanned: `189`
- Source-like files scanned: `175`

### Ports

- `6901` from `apps/zoffice/docker-compose.yml`
- `6902` from `apps/zoffice/app/setup.html`
- `8087` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/app/server.py, apps/zoffice/app/vo-config.json, apps/zoffice/app/whisper-server.py, apps/zoffice/scripts/feature-local-env.sh`
- `8090` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/TASK-editor-ui.md, apps/zoffice/TASK-furniture-editor.md, apps/zoffice/app/gateway_presence.py, apps/zoffice/skill/SKILL.md, apps/zoffice/tests/crud_test_results.md, apps/zoffice/tests/test_crud_projects.sh, apps/zoffice/tests/test_workflow_e2e.py, apps/zoffice/website/index.html`
- `8091` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/README.md, apps/zoffice/scripts/feature-local-env.sh`
- `8092` from `apps/zoffice/README.md, apps/zoffice/scripts/feature-local-env.sh`
- `8093` from `apps/zoffice/scripts/feature-local-env.sh`
- `8099` from `apps/zoffice/app/setup.html`
- `9222` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/app/index.html, apps/zoffice/app/setup.html, apps/zoffice/app/vo-config.json, apps/zoffice/kasm-browser-config/browser-supervisor.sh, apps/zoffice/kasm-browser-config/start-cdp-proxy.sh`
- `18090` from `apps/zoffice/.env, apps/zoffice/.env.example, apps/zoffice/app/Dockerfile`
- `18091` from `apps/zoffice/.env, apps/zoffice/.env.example, apps/zoffice/app/Dockerfile`
- `18789` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/Makefile, apps/zoffice/QA-CODE-QUALITY-SCAN.md, apps/zoffice/README.md, apps/zoffice/app/game.js, apps/zoffice/app/index.html, apps/zoffice/app/server.py, apps/zoffice/app/vo-config.json, apps/zoffice/scripts/feature-local-env.sh`

### Domains

- `zoffice.zeaz.dev` from `apps/zoffice/Makefile, apps/zoffice/README.md`

### Env files

- `apps/zoffice/.env` `local-only` keys=7: `VO_GATEWAY_HTTP, VO_GATEWAY_URL, VO_OFFICE_NAME, VO_OPENCLAW_PATH, VO_PORT, VO_WEATHER_LOCATION, VO_WS_PORT`
- `apps/zoffice/.env.example` `example` keys=7: `VO_GATEWAY_HTTP, VO_GATEWAY_URL, VO_OFFICE_NAME, VO_OPENCLAW_PATH, VO_PORT, VO_WEATHER_LOCATION, VO_WS_PORT`

### Findings

- `warn` `local_env_file`: Local env file exists: apps/zoffice/.env

### TODO/FIXME/HACK hits

- `apps/zoffice/merged_fixes_final_only.py:2819` `# The user's list might just be their remaining todo list.`
- `apps/zoffice/TASK-Z-ORDER-FIX.md:20` `7. **Furniture near horizontal walls redrawn** (`_isFurnitureNearHorizontalWall`) — THIS IS THE BUG: it redraws desks ON TOP of walls even when the desk should be behind`
- `apps/zoffice/merged.py:2819` `# The user's list might just be their remaining todo list.`
- `apps/zoffice/merged_fixes_final_only1.py:2819` `# The user's list might just be their remaining todo list.`
- `apps/zoffice/m.py:139` `# The user's list might just be their remaining todo list.`
- `apps/zoffice/fix_game_js_v10.py:80` `# The user's list might just be their remaining todo list.`
- `apps/zoffice/PROJECTS-FEATURE-SPEC.md:162` `- **Bug Tracking** (Reported, Confirmed, In Progress, Fixed, Verified)`
- `apps/zoffice/PROJECTS-FEATURE-SPEC.md:314` `title: 'Bug Tracking',`
- `apps/zoffice/TASK-agent-creator.md:56` `**Hair:** Replace the 15+ `if (this.id === 'xxx')` blocks with a single function `drawHairByConfig(style, color, highlight, gender)` that renders based on hairStyle.`
- `apps/zoffice/legacy_fixes/fix_game_js_v10.py:80` `# The user's list might just be their remaining todo list.`
- `apps/zoffice/app/server.py:3201` `"title": "Bug Tracking",`
- `apps/zoffice/app/server.py:3767` `for alt in ("to do", "todo", "ideas", "reported"):`
- `apps/zoffice/app/server.py:4726` `status = "✅ DONE" if item.get("done") else "⬜ TODO"`
- `apps/zoffice/app/projects.js:82` `title: 'Bug Tracking',`
- `apps/zoffice/app/office.py:192` `"title": "Bug Tracking",`
- `apps/zoffice/tests/test_review_parser.py:71` `# Test 2: DID_NOT_PASS should NOT match "pass" (the critical bug)`
- `apps/zoffice/plans/audit-fix-report-changelog.md:1` `# Blueprint: Deep-Dive Audit, Bug Fix, and Documentation`
- `apps/zoffice/plans/audit-fix-report-changelog.md:23` `**Exit Criteria**: A compiled list of candidate bug areas is ready for detailed analysis.`
- `apps/zoffice/plans/audit-fix-report-changelog.md:36` `- [ ] Bug list with severity (Low/Med/High) and file:line references.`
- `apps/zoffice/plans/audit-fix-report-changelog.md:51` `- [ ] Bug list with severity (Low/Med/High) and file:line references.`
- `apps/zoffice/plans/audit-fix-report-changelog.md:93` `- [ ] **Generate \`AUDIT_REPORT.md\`**: A detailed summary of findings (what was found, why it was a bug, and how it was fixed).`
- `apps/zoffice/plans/audit-fix-report-changelog.md:94` `- [ ] **Generate \`CHANGELOG.md\`**: A concise, user-facing summary of changes, categorized by type (Bug Fix, Improvement, etc.).`

### Large files

- `apps/zoffice/video-thumbnail.png` `2152086` bytes
- `apps/zoffice/thumbnail.png` `1701109` bytes

## `zquest`

- Path: `apps/zquest`
- Stack: `unknown`
- Root tracked files: `5`
- Nested git: `False`
- Files scanned: `5`
- Source-like files scanned: `5`

### Ports

- `8080` from `apps/zquest/README.md`

### Domains

- none detected

### Env files

- none detected

## `zsp-aitool`

- Path: `apps/zsp-aitool`
- Stack: `docker, node, npm`
- Root tracked files: `766`
- Nested git: `False`
- Files scanned: `813`
- Source-like files scanned: `757`

### Package

- Name: `zeaz-platform`
- Version: `0.1.0`
- Scripts: `ai:content-queue-status, ai:content-worker, ai:content-worker:once, build, ci:local-preflight, db:import-csv-products, db:import-csv-table, db:schema-drift-check, dev, health, hyperframes:ci:mock, hyperframes:ci:real, hyperframes:cleanup-renders, hyperframes:cleanup:disable-timer, hyperframes:cleanup:install-timer, hyperframes:cleanup:status, hyperframes:diag, hyperframes:doctor, hyperframes:enqueue-smoke-job, hyperframes:queue-status, hyperframes:recover-stale-jobs, hyperframes:render-inventory, hyperframes:render-job-status, hyperframes:render-smoke, hyperframes:safe-rollback, hyperframes:test-render, hyperframes:worker, hyperframes:worker:alerts, hyperframes:worker:disable-real, hyperframes:worker:disable-service, hyperframes:worker:enable-real, hyperframes:worker:install-alert-timer, hyperframes:worker:install-log-policy, hyperframes:worker:install-service, hyperframes:worker:journal-summary, hyperframes:worker:live-trial, hyperframes:worker:logs, hyperframes:worker:once, hyperframes:worker:preflight, hyperframes:worker:status, hyperframes:worker:trial, hyperframes:worker:watchdog, imports:csv-products:status, imports:csv-products:worker, imports:csv-products:worker:once, lint, monitor:backend, post-launch:smoke-routes, post-launch:status-summary, postbuild, prisma:generate, prisma:migrate, prisma:migrate:deploy, prisma:seed, start, test, test:all, test:db, test:security, typecheck`

### Ports

- `3000` from `apps/zsp-aitool/.env, apps/zsp-aitool/Dockerfile, apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docker-compose.yml, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml, apps/zsp-aitool/src/app/dashboard/products/[id]/similar/page.tsx, apps/zsp-aitool/tests/url-safety.test.ts`
- `3001` from `apps/zsp-aitool/.env.example, apps/zsp-aitool/.zagents/README-omnibus.md, apps/zsp-aitool/.zagents/README.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS-20260522-110147.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS-20260522-111315.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS.latest.md, apps/zsp-aitool/.zagents/zsp-agent-omnibus-oneclick.sh, apps/zsp-aitool/AGENTS.md, apps/zsp-aitool/CLAUDE.md, apps/zsp-aitool/GEMINI.md, apps/zsp-aitool/README.md, apps/zsp-aitool/docs/ci-production-readiness-review-2026-05-17.md`
- `5173` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/docs/reports/generated/plugin-health.md`
- `5174` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/docs/reports/generated/plugin-health.md, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`
- `5175` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/docs/reports/generated/plugin-health.md, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`
- `5432` from `apps/zsp-aitool/.env, apps/zsp-aitool/.env.example, apps/zsp-aitool/.github/workflows/build.yml, apps/zsp-aitool/.github/workflows/ci.yml, apps/zsp-aitool/docs/ci-production-readiness-review-2026-05-17.md`
- `5433` from `apps/zsp-aitool/.env`
- `5435` from `apps/zsp-aitool/docker-compose.yml`
- `8005` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/docs/reports/generated/plugin-health.md`

### Domains

- `api-zdash.zeaz.dev` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/docs/runbooks/PLUGIN_REPO_OPERATIONS.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml, apps/zsp-aitool/scripts/plugins/plugin-validate.sh`
- `api-zveo.zeaz.dev` from `apps/zsp-aitool/docker-compose.yml`
- `app.zeaz.dev` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`
- `release.zeaz.dev` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`
- `studio.zeaz.dev` from `apps/zsp-aitool/.env.example, apps/zsp-aitool/.zagents/README-omnibus.md, apps/zsp-aitool/.zagents/README.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS-20260522-110147.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS-20260522-111315.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS.latest.md, apps/zsp-aitool/.zagents/zsp-agent-omnibus-oneclick.sh, apps/zsp-aitool/AGENTS.md, apps/zsp-aitool/GEMINI.md, apps/zsp-aitool/README.md, apps/zsp-aitool/docs/ci-production-readiness-review-2026-05-17.md, apps/zsp-aitool/docs/prompts/015-production-launch-polish.prompt.md`
- `tunnel.zeaz.dev` from `apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/scripts/plugins/plugin-render-cloudflare.sh`
- `www.zeaz.dev` from `apps/zsp-aitool/docs/ZEAZ_PLATFORM_DESIGN.md`
- `zaiz.zeaz.dev` from `apps/zsp-aitool/README.md, apps/zsp-aitool/docker-compose.yml`
- `zdash.zeaz.dev` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml, apps/zsp-aitool/src/app/zdash/page.tsx`
- `zveo.zeaz.dev` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`

### Env files

- `apps/zsp-aitool/.env` `local-only` keys=67: `ADMIN_PANEL_ENABLED, AI_DAILY_BUDGET_USD, AI_MAX_REQUESTS_PER_MINUTE, ALTMANGODB, AUTH_SECRET, DATABASE_URL, DEFAULT_USER_EMAIL, GPG_PASSPHRASE, HYPERFRAMES_ALLOWED_QUALITY_PROFILES, HYPERFRAMES_CLI_ARGS, HYPERFRAMES_CLI_BIN, HYPERFRAMES_DEFAULT_MONTHLY_RENDER_QUOTA, HYPERFRAMES_DEFAULT_RETENTION_DAYS, HYPERFRAMES_DEFAULT_STORAGE_QUOTA_MB, HYPERFRAMES_DOCTOR_CREATE_DIRS, HYPERFRAMES_DOWNLOAD_TOKEN_SECRET, HYPERFRAMES_DOWNLOAD_TOKEN_TTL_SECONDS, HYPERFRAMES_FFMPEG_BIN, HYPERFRAMES_HIGH_QUALITY_ENABLED, HYPERFRAMES_INTERNAL_TOKEN, HYPERFRAMES_MAX_CONCURRENT_JOBS, HYPERFRAMES_MAX_DURATION_SECONDS, HYPERFRAMES_METRICS_ENABLED, HYPERFRAMES_NODE_BIN, HYPERFRAMES_OPERATOR_EMAILS, HYPERFRAMES_OPERATOR_STATUS_ENABLED, HYPERFRAMES_OUTPUT_DIR, HYPERFRAMES_RENDER_ENABLED, HYPERFRAMES_SIGNED_DOWNLOADS_ENABLED, HYPERFRAMES_SOCIAL_EXPORT_ENABLED, HYPERFRAMES_TTS_ENABLED, HYPERFRAMES_WATCHDOG_MAX_FAILED_LAST_24H, HYPERFRAMES_WATCHDOG_MAX_PENDING_JOBS, HYPERFRAMES_WATCHDOG_MIN_FREE_MB, HYPERFRAMES_WATCHDOG_RECOVER_STALE, HYPERFRAMES_WATCHDOG_REQUIRE_SERVICE_ACTIVE, HYPERFRAMES_WATCHDOG_STALE_RUNNING_MINUTES, HYPERFRAMES_WORKDIR, MARQETA_ADMIN_ACCESS_TOKEN, MARQETA_APPLICATION_TOKEN, MARQETA_BASE_URL, MARQETA_CONNECTIVITY_CHECK_ENABLED, MARQETA_ENABLED, MARQETA_ENV, MARQETA_MAX_RETRIES, MARQETA_TIMEOUT_MS, NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_APP_URL, NODE_ENV`
- `apps/zsp-aitool/.env.example` `example` keys=62: `ADMIN_PANEL_ENABLED, AI_DAILY_BUDGET_USD, AI_MAX_REQUESTS_PER_MINUTE, AUTH_SECRET, DATABASE_URL, DEFAULT_USER_EMAIL, HYPERFRAMES_ALLOWED_QUALITY_PROFILES, HYPERFRAMES_CLI_ARGS, HYPERFRAMES_CLI_BIN, HYPERFRAMES_DEFAULT_MONTHLY_RENDER_QUOTA, HYPERFRAMES_DEFAULT_RETENTION_DAYS, HYPERFRAMES_DEFAULT_STORAGE_QUOTA_MB, HYPERFRAMES_DOCTOR_CREATE_DIRS, HYPERFRAMES_DOWNLOAD_TOKEN_SECRET, HYPERFRAMES_DOWNLOAD_TOKEN_TTL_SECONDS, HYPERFRAMES_FFMPEG_BIN, HYPERFRAMES_HIGH_QUALITY_ENABLED, HYPERFRAMES_INTERNAL_TOKEN, HYPERFRAMES_MAX_CONCURRENT_JOBS, HYPERFRAMES_MAX_DURATION_SECONDS, HYPERFRAMES_METRICS_ENABLED, HYPERFRAMES_NODE_BIN, HYPERFRAMES_OPERATOR_EMAILS, HYPERFRAMES_OPERATOR_STATUS_ENABLED, HYPERFRAMES_OUTPUT_DIR, HYPERFRAMES_RENDER_ENABLED, HYPERFRAMES_SIGNED_DOWNLOADS_ENABLED, HYPERFRAMES_SOCIAL_EXPORT_ENABLED, HYPERFRAMES_TTS_ENABLED, HYPERFRAMES_WATCHDOG_MAX_FAILED_LAST_24H, HYPERFRAMES_WATCHDOG_MAX_PENDING_JOBS, HYPERFRAMES_WATCHDOG_MIN_FREE_MB, HYPERFRAMES_WATCHDOG_RECOVER_STALE, HYPERFRAMES_WATCHDOG_REQUIRE_SERVICE_ACTIVE, HYPERFRAMES_WATCHDOG_STALE_RUNNING_MINUTES, HYPERFRAMES_WORKDIR, MARQETA_ADMIN_ACCESS_TOKEN, MARQETA_APPLICATION_TOKEN, MARQETA_BASE_URL, MARQETA_CONNECTIVITY_CHECK_ENABLED, MARQETA_ENABLED, MARQETA_ENV, MARQETA_MAX_RETRIES, MARQETA_TIMEOUT_MS, NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_APP_URL, NODE_ENV, OCR_MAX_REQUESTS_PER_MINUTE, OPENAI_API_KEY`

### Findings

- `warn` `local_tooling_or_vendor_dir`: .agent exists; excluded from review and should not be committed
- `warn` `local_tooling_or_vendor_dir`: .codex exists; excluded from review and should not be committed
- `warn` `local_tooling_or_vendor_dir`: .gemini exists; excluded from review and should not be committed
- `warn` `local_tooling_or_vendor_dir`: .claude exists; excluded from review and should not be committed
- `warn` `local_env_file`: Local env file exists: apps/zsp-aitool/.env
- `info` `expected_port_not_detected`: Expected port 3008 from apps-port-plan not detected in source text
- `info` `expected_hostname_not_detected`: Expected hostname ztest.zeaz.dev from apps-port-plan not detected in source text

### TODO/FIXME/HACK hits

- `apps/zsp-aitool/.github/ISSUE_TEMPLATE/bug_report.yml:1` `name: Bug report`
- `apps/zsp-aitool/.github/ISSUE_TEMPLATE/bug_report.yml:5` `- bug`
- `apps/zsp-aitool/docs/prompts/015-production-launch-polish.prompt.md:65` `- Do not change auth logic unless fixing a real bug.`
- `apps/zsp-aitool/docs/prompts/zsp-aitool-step-by-step-th.md:64` `- ห้าม TODO ใน core features`
- `apps/zsp-aitool/docs/prompts/zsp-aitool-step-by-step-th.md:720` `7. มี TODO ใน core feature หรือไม่`
- `apps/zsp-aitool/docs/prompts/017-first-100-users-growth-loop.prompt.md:124` `- bug report template`
- `apps/zsp-aitool/docs/prompts/zsp-aitool-full-source-en.md:64` `- Do not leave TODO comments in core features.`
- `apps/zsp-aitool/docs/runbooks/user-feedback-playbook.md:28` `## Bug report template`

## `zsticker`

- Path: `apps/zsticker`
- Stack: `docker, python`
- Root tracked files: `83`
- Nested git: `False`
- Files scanned: `94`
- Source-like files scanned: `71`

### Ports

- `3008` from `apps/zsticker/Makefile`
- `8000` from `apps/zsticker/Dockerfile`
- `8007` from `apps/zsticker/Makefile`
- `8080` from `apps/zsticker/src/cli/auth_gdrive.py`

### Domains

- `zsticker.zeaz.dev` from `apps/zsticker/src/cli/api.py, apps/zsticker/src/cli/dashboard.py`

### Env files

- `apps/zsticker/.env` `local-only` keys=6: `GOOGLE_DRIVE_FOLDER_ID, IMGUR_CLIENT_ID, LINE_CHANNEL_ACCESS_TOKEN, LINE_GROUP_ID, OPENAI_API_KEY, SHEET_ID`
- `apps/zsticker/.env.example` `example` keys=4: `IMGUR_CLIENT_ID, LINE_CHANNEL_ACCESS_TOKEN, LINE_GROUP_ID, SHEET_ID`

### Findings

- `warn` `local_env_file`: Local env file exists: apps/zsticker/.env
- `info` `expected_port_not_detected`: Expected port 8014 from apps-port-plan not detected in source text

### TODO/FIXME/HACK hits

- `apps/zsticker/CONTRIBUTING.md:8` `- Ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/cvsz/zsticker/issues).`
- `apps/zsticker/CONTRIBUTING.md:9` `- If you're unable to find an open issue addressing the problem, open a new one using the **Bug Report** template.`
- `apps/zsticker/.github/PULL_REQUEST_TEMPLATE.md:7` `- [ ] Bug fix (non-breaking change which fixes an issue)`
- `apps/zsticker/.github/ISSUE_TEMPLATE/bug_report.md:2` `name: Bug report`
- `apps/zsticker/.github/ISSUE_TEMPLATE/bug_report.md:4` `title: "[BUG] "`
- `apps/zsticker/.github/ISSUE_TEMPLATE/bug_report.md:5` `labels: bug`
- `apps/zsticker/.github/ISSUE_TEMPLATE/bug_report.md:9` `**Describe the bug**`
- `apps/zsticker/.github/ISSUE_TEMPLATE/bug_report.md:10` `A clear and concise description of what the bug is.`

### Large files

- `apps/zsticker/logs/app.2026-06-07_02-36-05_916249.log` `9999982` bytes
- `apps/zsticker/logs/app.2026-06-07_02-36-03_942019.log` `9999940` bytes
- `apps/zsticker/logs/app.log` `7747965` bytes
- `apps/zsticker/logs/line_api.log` `6420054` bytes
- `apps/zsticker/logs/sheets.log` `6340001` bytes
- `apps/zsticker/logs/error.log` `1022409` bytes

## `ztrader`

- Path: `apps/ztrader`
- Stack: `docker, python`
- Root tracked files: `374`
- Nested git: `False`
- Files scanned: `376`
- Source-like files scanned: `362`

### Ports

- `375` from `apps/ztrader/backend/scripts/legacy_tools/ARCHITECTURE.md, apps/ztrader/backend/src/ztrader/abt/tools/ARCHITECTURE.md`
- `768` from `apps/ztrader/backend/scripts/legacy_tools/ARCHITECTURE.md, apps/ztrader/backend/src/ztrader/abt/tools/ARCHITECTURE.md`
- `1920` from `apps/ztrader/backend/scripts/legacy_tools/ARCHITECTURE.md, apps/ztrader/backend/src/ztrader/abt/tools/ARCHITECTURE.md`
- `3000` from `apps/ztrader/backend/scripts/legacy_tools/ARCHITECTURE.md, apps/ztrader/backend/scripts/legacy_tools/EXAMPLES.md, apps/ztrader/backend/scripts/legacy_tools/README.md, apps/ztrader/backend/scripts/legacy_tools/README_SCREENSHOTS.md, apps/ztrader/backend/scripts/legacy_tools/package.json, apps/ztrader/backend/scripts/legacy_tools/run_screenshots.sh, apps/ztrader/backend/scripts/legacy_tools/screenshot_pages.js, apps/ztrader/backend/src/ztrader/abt/auth/google_provider.py, apps/ztrader/backend/src/ztrader/abt/tools/ARCHITECTURE.md, apps/ztrader/backend/src/ztrader/abt/tools/EXAMPLES.md, apps/ztrader/backend/src/ztrader/abt/tools/README.md, apps/ztrader/backend/src/ztrader/abt/tools/README_SCREENSHOTS.md`
- `3001` from `apps/ztrader/backend/scripts/legacy_tools/EXAMPLES.md, apps/ztrader/backend/scripts/legacy_tools/README.md, apps/ztrader/backend/scripts/legacy_tools/README_SCREENSHOTS.md, apps/ztrader/backend/src/ztrader/abt/tools/EXAMPLES.md, apps/ztrader/backend/src/ztrader/abt/tools/README.md, apps/ztrader/backend/src/ztrader/abt/tools/README_SCREENSHOTS.md`
- `3016` from `apps/ztrader/.env, apps/ztrader/.env.example, apps/ztrader/backend/src/ztrader/main.py`
- `3017` from `apps/ztrader/frontend/playwright.config.ts`
- `5432` from `apps/ztrader/.env, apps/ztrader/.env.example, apps/ztrader/backend/.env.example, apps/ztrader/backend/src/ztrader/core/config.py`
- `6379` from `apps/ztrader/.env, apps/ztrader/.env.example, apps/ztrader/backend/.env.example, apps/ztrader/backend/src/ztrader/abt/api/health_endpoints.py, apps/ztrader/backend/src/ztrader/core/config.py`
- `8000` from `apps/ztrader/backend/Dockerfile, apps/ztrader/backend/src/ztrader/abt/api/tradingview_endpoints.py, apps/ztrader/backend/src/ztrader/api/v1/webhooks.py, apps/ztrader/docker-compose.yml, apps/ztrader/frontend/.env.example, apps/ztrader/frontend/src/app/[lng]/admin/page.tsx, apps/ztrader/frontend/src/app/[lng]/dashboard/page.tsx, apps/ztrader/frontend/src/app/[lng]/settings/page.tsx, apps/ztrader/frontend/src/components/auth/GoogleSignIn.tsx, apps/ztrader/frontend/src/components/settings/NotificationPreferences.tsx, apps/ztrader/frontend/src/components/settings/PromptPayTopup.tsx, apps/ztrader/frontend/src/components/settings/TelegramLink.tsx`
- `8016` from `apps/ztrader/.env, apps/ztrader/.env.example`

### Domains

- `api-ztrader.zeaz.dev` from `apps/ztrader/.env, apps/ztrader/.env.example, apps/ztrader/Makefile, apps/ztrader/docker-compose.yml`
- `ztrader.zeaz.dev` from `apps/ztrader/.env, apps/ztrader/.env.example, apps/ztrader/Makefile, apps/ztrader/backend/src/ztrader/api/v1/platform.py, apps/ztrader/backend/src/ztrader/main.py, apps/ztrader/docker-compose.yml`

### Env files

- `apps/ztrader/.env` `local-only` keys=22: `ADMIN_API_TOKEN, BACKEND_PORT, DATABASE_URL, ENCRYPTION_KEY, ENVIRONMENT, EXECUTION_MODE, FRONTEND_PORT, GLOBAL_KILL_SWITCH, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, HOST, JWT_SECRET, LIVE_TRADING_ENABLED, NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_BACKEND_URL, PORT, POSTGRES_PASSWORD, REDIS_URL, RISK_ALLOWED_SYMBOLS, RISK_MAX_ORDER_NOTIONAL, TRADINGVIEW_WEBHOOK_SECRET, ZTRADER_PUBLIC_URL`
- `apps/ztrader/.env.example` `example` keys=21: `ADMIN_API_TOKEN, BACKEND_PORT, DATABASE_URL, ENCRYPTION_KEY, ENVIRONMENT, EXECUTION_MODE, FRONTEND_PORT, GLOBAL_KILL_SWITCH, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, HOST, JWT_SECRET, LIVE_TRADING_ENABLED, NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_BACKEND_URL, PORT, REDIS_URL, RISK_ALLOWED_SYMBOLS, RISK_MAX_ORDER_NOTIONAL, TRADINGVIEW_WEBHOOK_SECRET, ZTRADER_PUBLIC_URL`
- `apps/ztrader/backend/.env.example` `example` keys=13: `ADMIN_API_TOKEN, DATABASE_URL, ENCRYPTION_KEY, ENVIRONMENT, EXECUTION_MODE, GLOBAL_KILL_SWITCH, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, LIVE_TRADING_ENABLED, REDIS_URL, RISK_ALLOWED_SYMBOLS, RISK_MAX_ORDER_NOTIONAL`
- `apps/ztrader/frontend/.env.example` `example` keys=1: `NEXT_PUBLIC_BACKEND_URL`

### Findings

- `warn` `local_env_file`: Local env file exists: apps/ztrader/.env

### TODO/FIXME/HACK hits

- `apps/ztrader/CONTRIBUTING.md:70` `- All new features or bug fixes must include unit or integration tests with **80%+ coverage**.`
- `apps/ztrader/CONTRIBUTING.md:78` `- `fix(ztrader): <description>` for bug fixes`
- `apps/ztrader/.github/PULL_REQUEST_TEMPLATE.md:9` `- [ ] Bug fix (non-breaking change which fixes an issue)`
- `apps/ztrader/.github/ISSUE_TEMPLATE/bug_report.md:2` `name: Bug report`
- `apps/ztrader/.github/ISSUE_TEMPLATE/bug_report.md:4` `title: '[BUG] Brief description of the issue'`
- `apps/ztrader/.github/ISSUE_TEMPLATE/bug_report.md:5` `labels: bug`
- `apps/ztrader/.github/ISSUE_TEMPLATE/bug_report.md:9` `**Describe the bug**`
- `apps/ztrader/.github/ISSUE_TEMPLATE/bug_report.md:10` `A clear and concise description of what the bug is.`

## `zveo`

- Path: `apps/zveo`
- Stack: `docker, node, pnpm, python, terraform`
- Root tracked files: `241`
- Nested git: `False`
- Files scanned: `244`
- Source-like files scanned: `217`

### Package

- Name: `zveo`
- Version: `None`
- Scripts: `build, build:api, build:contracts, build:core, build:foundation, build:media-pipeline, build:node, build:prompt-compiler, build:providers, build:queue, build:render-worker, build:scene-graph, build:scene-memory, build:telemetry, build:workflow-engine, db:check, db:generate, db:migrate, db:seed, db:smoke, db:studio, dev:dashboard, dev:node, migrate:contracts, migrate:monorepo, queue:monitor, test:media-pipeline, test:node, test:scene-graph, typecheck, typecheck:api, typecheck:contracts, typecheck:core, typecheck:foundation, typecheck:media-pipeline, typecheck:node, typecheck:prompt-compiler, typecheck:providers, typecheck:queue, typecheck:render-worker, typecheck:scene-graph, typecheck:scene-memory, typecheck:telemetry, typecheck:workflow-engine, verify:foundation, verify:node`

### Ports

- `443` from `apps/zveo/infra/kubernetes/base/network-policy.yaml`
- `3000` from `apps/zveo/apps/dashboard/Dockerfile, apps/zveo/docker-compose.yml, apps/zveo/docs/architecture/node-only-profile.md, apps/zveo/infra/docker/docker-compose.yml, apps/zveo/infra/observability/docker-compose.observability.yml`
- `3019` from `apps/zveo/infra/docker/docker-compose.yml`
- `3100` from `apps/zveo/infra/observability/docker-compose.observability.yml, apps/zveo/infra/observability/loki/loki.yml`
- `3200` from `apps/zveo/infra/observability/docker-compose.observability.yml, apps/zveo/infra/observability/tempo/tempo.yml`
- `4317` from `apps/zveo/infra/kubernetes/production/observability.yaml, apps/zveo/infra/observability/docker-compose.observability.yml, apps/zveo/infra/observability/otel-collector/config.yml, apps/zveo/infra/observability/tempo/tempo.yml`
- `4318` from `apps/zveo/infra/kubernetes/production/observability.yaml, apps/zveo/infra/observability/docker-compose.observability.yml, apps/zveo/infra/observability/otel-collector/config.yml, apps/zveo/infra/observability/tempo/tempo.yml`
- `4319` from `apps/zveo/infra/observability/docker-compose.observability.yml`
- `5432` from `apps/zveo/drizzle.config.ts, apps/zveo/scripts/db-smoke.sh`
- `5436` from `apps/zveo/infra/docker/docker-compose.yml`
- `6379` from `apps/zveo/apps/api-gateway/src/config.ts, apps/zveo/apps/render-worker/src/worker.ts, apps/zveo/infra/kubernetes/base/network-policy.yaml`
- `6382` from `apps/zveo/infra/docker/docker-compose.yml`
- `8000` from `apps/zveo/infra/kubernetes/api.yaml`
- `8080` from `apps/zveo/.env.example.node, apps/zveo/.env.node, apps/zveo/apps/api-gateway/Dockerfile, apps/zveo/apps/api-gateway/src/openapi.ts, apps/zveo/apps/dashboard/app/settings/page.tsx, apps/zveo/apps/dashboard/lib/api.test.ts, apps/zveo/apps/dashboard/lib/api.ts, apps/zveo/docs/architecture/node-only-profile.md, apps/zveo/docs/openapi/api-gateway.openapi.ts, apps/zveo/infra/docker/docker-compose.yml, apps/zveo/infra/kubernetes/base/api-gateway.yaml, apps/zveo/infra/kubernetes/base/blue-green.yaml`
- `9000` from `apps/zveo/docs/architecture/node-only-profile.md, apps/zveo/infra/docker/docker-compose.yml`
- `9005` from `apps/zveo/infra/docker/docker-compose.yml`
- `9006` from `apps/zveo/infra/docker/docker-compose.yml`
- `9090` from `apps/zveo/infra/kubernetes/media-worker.yaml, apps/zveo/infra/observability/docker-compose.observability.yml`
- `9093` from `apps/zveo/infra/observability/loki/loki.yml`
- `9095` from `apps/zveo/infra/docker/docker-compose.yml`
- `9100` from `apps/zveo/infra/kubernetes/worker.yaml, apps/zveo/legacy/python-compat/apps/worker_media/Dockerfile`
- `9464` from `apps/zveo/infra/kubernetes/production/observability.yaml, apps/zveo/infra/observability/docker-compose.observability.yml, apps/zveo/infra/observability/otel-collector/config.yml`
- `13133` from `apps/zveo/infra/kubernetes/production/observability.yaml`

### Domains

- `zveo.zeaz.dev` from `apps/zveo/README.md, apps/zveo/docker-compose.yml, apps/zveo/infra/docker/docker-compose.yml`

### Env files

- `apps/zveo/.env` `local-only` keys=5: `META_APP_ID, META_APP_SECRET, META_GRAPH_VERSION, META_PAGE_ACCESS_TOKEN, META_PAGE_ID`
- `apps/zveo/.env.example` `example` keys=5: `META_APP_ID, META_APP_SECRET, META_GRAPH_VERSION, META_PAGE_ACCESS_TOKEN, META_PAGE_ID`
- `apps/zveo/.env.example.node` `example` keys=12: `AUTH_SHARED_SECRET, CONCURRENCY, DATABASE_URL, GF_SECURITY_ADMIN_PASSWORD, MINIO_ROOT_PASSWORD, MINIO_ROOT_USER, NODE_ENV, PORT, PROVIDER_TIMEOUT_MS, REDIS_URL, S3_BUCKET, ZVEO_API_URL`
- `apps/zveo/.env.node` `local-only` keys=12: `AUTH_SHARED_SECRET, CONCURRENCY, DATABASE_URL, GF_SECURITY_ADMIN_PASSWORD, MINIO_ROOT_PASSWORD, MINIO_ROOT_USER, NODE_ENV, PORT, PROVIDER_TIMEOUT_MS, REDIS_URL, S3_BUCKET, ZVEO_API_URL`

### Findings

- `warn` `local_tooling_or_vendor_dir`: .agent exists; excluded from review and should not be committed
- `warn` `local_tooling_or_vendor_dir`: .gemini exists; excluded from review and should not be committed
- `warn` `local_env_file`: Local env file exists: apps/zveo/.env.node
- `warn` `local_env_file`: Local env file exists: apps/zveo/.env
- `info` `expected_port_not_detected`: Expected port 3002 from apps-port-plan not detected in source text

### TODO/FIXME/HACK hits

- `apps/zveo/AGENTS.MD:16` `- Zero placeholders, zero pseudo-code, zero TODO comments`

## `zwallet`

- Path: `apps/zwallet`
- Stack: `docker, node, pnpm, python, terraform`
- Root tracked files: `456`
- Nested git: `False`
- Files scanned: `473`
- Source-like files scanned: `397`

### Package

- Name: `zwallet`
- Version: `None`
- Scripts: `build, check:circular, generate:releases, lint, setup:auto, typecheck`

### Ports

- `3000` from `apps/zwallet/.env, apps/zwallet/.env.example, apps/zwallet/apps/api/src/server.ts, apps/zwallet/docs/api-spec.yaml, apps/zwallet/infra/helm/templates/api-deployment.yaml, apps/zwallet/infra/k8s/api-deployment.yaml, apps/zwallet/infra/k8s/monitoring.yaml, apps/zwallet/k8s/monitoring/monitoring-stack.yaml`
- `3002` from `apps/zwallet/deploy-zveo-services.sh`
- `4173` from `apps/zwallet/apps/world/README.md`
- `4222` from `apps/zwallet/docker-compose.yml`
- `5432` from `apps/zwallet/.env, apps/zwallet/.env.example, apps/zwallet/infra/k8s/postgres.yaml`
- `5601` from `apps/zwallet/dashboard/README.md, apps/zwallet/infra/docker/docker-compose.devops.yml, apps/zwallet/infra/docker/docker-compose.prod.yml, apps/zwallet/infra/k8s/base/logging-elk.yaml, apps/zwallet/infra/observability/docker-compose.siem.yml, apps/zwallet/k8s/logging/elk-stack.yaml`
- `6379` from `apps/zwallet/.env, apps/zwallet/.env.example, apps/zwallet/admin/panel/enterprise/audit_store.py, apps/zwallet/admin/panel/enterprise/main.py, apps/zwallet/admin/panel/main.py, apps/zwallet/api/app/middleware/security_advanced.py, apps/zwallet/api/app/middleware/security_distributed.py, apps/zwallet/api/app/security/adaptive_rate_limiter.py, apps/zwallet/api/app/security/anomaly_detector.py, apps/zwallet/api/app/security/circuit_breaker.py, apps/zwallet/api/app/security/risk_engine.py, apps/zwallet/api/app/security/shadow_ban.py`
- `8080` from `apps/zwallet/backend/.env, apps/zwallet/backend/.env.example, apps/zwallet/backend/services/gateway/Dockerfile, apps/zwallet/docker-compose.yml, apps/zwallet/infra/docker/docker-compose.devops.yml, apps/zwallet/infra/docker/docker-compose.prod.yml, apps/zwallet/infra/k8s/base/services-apps.yaml, apps/zwallet/infra/k8s/helm/zwallet/templates/deployment.yaml, apps/zwallet/infra/k8s/helm/zwallet/values.yaml, apps/zwallet/k8s/base/gateway-deployment.yaml, apps/zwallet/k8s/base/gateway-service.yaml, apps/zwallet/k8s/deployment.yaml`
- `8090` from `apps/zwallet/backend/services/wallet-service/Dockerfile, apps/zwallet/deploy-zveo-services.sh, apps/zwallet/docker-compose.yml`
- `8091` from `apps/zwallet/docker-compose.yml`
- `8092` from `apps/zwallet/docker-compose.yml, apps/zwallet/infra/docker/docker-compose.prod.yml, apps/zwallet/infra/k8s/base/services-apps.yaml`
- `8093` from `apps/zwallet/docker-compose.yml, apps/zwallet/infra/docker/docker-compose.prod.yml`
- `8094` from `apps/zwallet/docker-compose.yml`
- `8095` from `apps/zwallet/backend/services/portfolio-service/Dockerfile, apps/zwallet/docker-compose.yml`
- `8096` from `apps/zwallet/infra/docker/docker-compose.prod.yml`
- `8097` from `apps/zwallet/infra/docker/docker-compose.prod.yml`
- `8098` from `apps/zwallet/infra/docker/docker-compose.prod.yml`
- `8099` from `apps/zwallet/infra/docker/docker-compose.prod.yml`
- `8100` from `apps/zwallet/infra/docker/docker-compose.prod.yml`
- `8200` from `apps/zwallet/infra/k8s/vault.yaml`
- `8332` from `apps/zwallet/services/card/src/index.ts, apps/zwallet/services/compliance/src/index.ts, apps/zwallet/services/event-workers/src/index.ts, apps/zwallet/services/indexer/src/index.ts, apps/zwallet/services/liquidity/src/index.ts, apps/zwallet/services/router/src/intentRouter.ts, apps/zwallet/services/swap-engine/src/index.ts, apps/zwallet/services/wallet-engine/src/index.ts`
- `8545` from `apps/zwallet/api/tests/conftest.py, apps/zwallet/services/card/src/index.ts, apps/zwallet/services/compliance/src/index.ts, apps/zwallet/services/event-workers/src/index.ts, apps/zwallet/services/indexer/src/index.ts, apps/zwallet/services/liquidity/src/index.ts, apps/zwallet/services/router/src/intentRouter.ts, apps/zwallet/services/swap-engine/src/index.ts, apps/zwallet/services/wallet-engine/src/index.ts`
- `8546` from `apps/zwallet/services/card/src/index.ts, apps/zwallet/services/compliance/src/index.ts, apps/zwallet/services/event-workers/src/index.ts, apps/zwallet/services/indexer/src/index.ts, apps/zwallet/services/liquidity/src/index.ts, apps/zwallet/services/router/src/intentRouter.ts, apps/zwallet/services/swap-engine/src/index.ts, apps/zwallet/services/wallet-engine/src/index.ts`
- `8899` from `apps/zwallet/services/card/src/index.ts, apps/zwallet/services/compliance/src/index.ts, apps/zwallet/services/event-workers/src/index.ts, apps/zwallet/services/indexer/src/index.ts, apps/zwallet/services/liquidity/src/index.ts, apps/zwallet/services/router/src/intentRouter.ts, apps/zwallet/services/swap-engine/src/index.ts, apps/zwallet/services/wallet-engine/src/index.ts`
- `9090` from `apps/zwallet/infra/docker/docker-compose.devops.yml, apps/zwallet/infra/docker/docker-compose.prod.yml, apps/zwallet/infra/k8s/base/monitoring.yaml, apps/zwallet/infra/k8s/monitoring.yaml`
- `9092` from `apps/zwallet/api/src/infrastructure/kafka.producer.ts, apps/zwallet/infra/k8s/kafka-cluster.yaml, apps/zwallet/infra/k8s/kafka.yaml`
- `9200` from `apps/zwallet/dashboard/README.md, apps/zwallet/infra/docker/docker-compose.devops.yml, apps/zwallet/infra/docker/docker-compose.prod.yml, apps/zwallet/infra/k8s/base/logging-elk.yaml, apps/zwallet/infra/observability/docker-compose.siem.yml, apps/zwallet/k8s/logging/elk-stack.yaml`
- `25432` from `apps/zwallet/docker-compose.yml`
- `26380` from `apps/zwallet/docker-compose.yml`

### Domains

- `app.zeaz.dev` from `apps/zwallet/README.md`

### Env files

- `apps/zwallet/.env` `local-only` keys=7: `EVENT_BUS_TYPE, EVENT_BUS_URL, HOST, NODE_ENV, PORT, STRIPE_ACCOUNT_ID, STRIPE_API_KEY`
- `apps/zwallet/.env.example` `example` keys=5: `EVENT_BUS_TYPE, EVENT_BUS_URL, HOST, NODE_ENV, PORT`
- `apps/zwallet/backend/.env` `local-only` keys=8: `INDEXER_SERVICE_URL, POLICY_SERVICE_URL, PORT, PORTFOLIO_SERVICE_URL, REDIS_URL, SWAP_SERVICE_URL, TX_ORCHESTRATOR_URL, WALLET_SERVICE_URL`
- `apps/zwallet/backend/.env.example` `example` keys=8: `INDEXER_SERVICE_URL, POLICY_SERVICE_URL, PORT, PORTFOLIO_SERVICE_URL, REDIS_URL, SWAP_SERVICE_URL, TX_ORCHESTRATOR_URL, WALLET_SERVICE_URL`

### Findings

- `warn` `local_tooling_or_vendor_dir`: .codex exists; excluded from review and should not be committed
- `warn` `local_env_file`: Local env file exists: apps/zwallet/.env
- `warn` `local_env_file`: Local env file exists: apps/zwallet/backend/.env
- `info` `expected_port_not_detected`: Expected port 8011 from apps-port-plan not detected in source text
- `info` `expected_hostname_not_detected`: Expected hostname zwallet.zeaz.dev from apps-port-plan not detected in source text

### TODO/FIXME/HACK hits

- `apps/zwallet/AGENTS.md:26` `- No TODO / placeholder / pseudo`
- `apps/zwallet/CODEX_TASKS.md:8` `- [ ] Ban placeholders/TODO stubs in shipped paths.`
- `apps/zwallet/CODEX_TASKS_MASTER_FORM.md:34` `### 0.3 Ban placeholders/TODO stubs`
- `apps/zwallet/docs/00_AGENT_CONTRACT.md:12` `- Leave TODO / placeholders`
- `apps/zwallet/docs/mvp-launch-plan.md:98` `- QA + bug fixes`
- `apps/zwallet/docs/REPO_REVIEW_2026-05-05.md:57` `- **No placeholder/TODO in shipped paths:** not fully satisfied (placeholder/TODO comments found in runtime/admin paths).`
- `apps/zwallet/docs/REPO_REVIEW_2026-05-05.md:76` `7. Add policy-as-code lint/check to block `TODO/placeholder` markers in production-scoped directories.`
- `apps/zwallet/docs/REPO_REVIEW_2026-05-05.md:82` `- CI rule: fail on placeholder/TODO markers in runtime production directories.`
- `apps/zwallet/docs/BUG_REVIEW_2026-05-03.md:1` `# Bug Review (2026-05-03)`
- `apps/zwallet/docs/REPO_MASTER_META_REVIEW_2026-05-05.md:53` `- Placeholder/TODO markers exist in scoped runtime trees.`
- `apps/zwallet/docs/REPO_MASTER_META_REVIEW_2026-05-05.md:60` `- No placeholders/TODO in production runtime: **Partial/Fail**`
- `apps/zwallet/docs/REPO_MASTER_META_REVIEW_2026-05-05.md:77` `7. Add CI policies: critical-folder `any` budget, forbidden TODO/placeholders, mandatory tx-stage telemetry assertions.`
- `apps/zwallet/docs/releases/RELEASE_NOTES.md:42` `- docs: add gateway bug review findings (cc8cca8, @CVSz)`
