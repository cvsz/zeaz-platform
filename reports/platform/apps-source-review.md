# Apps source review

Generated: `2026-06-05T18:05:16Z`
Apps scanned: `13`

This report is read-only. It excludes dependency, cache, build, runtime, vendor, and local tooling directories.

## Summary

| App | Stack | Files | Source | Ports | Domains | Critical | Warnings |
|---|---|---:|---:|---|---|---:|---:|
| ABTPi18n | `docker, node, pnpm, python` | 262 | 253 | `375, 587, 768, 1920, 3000, 3001, 5432, 6379, 6432, 8000, 9090, 22022` | `-` | 0 | 0 |
| api | `python` | 11 | 10 | `6379` | `-` | 0 | 0 |
| openwork | `docker, node, npm, pnpm` | 1680 | 1213 | `443, 587, 1234, 3000, 3001, 3005, 3306, 3333, 3978, 4096, 4321, 5173, 5432, 6000, 6080, 6379, 8080, 8090, 8787, 8788, 8789, 8790, 8791, 9222, 9223, 9823, 9825, 9830, 11434, 18801, 19876, 48123, 49999, 52431, 54235, 59673, 59674, 59675` | `-` | 2 | 1 |
| web | `node, npm` | 45 | 36 | `3000, 8000` | `-` | 0 | 0 |
| zAcademy | `node, npm, terraform` | 134 | 66 | `443, 3009, 4317, 8084, 8443, 9090` | `auth.zeaz.dev` | 0 | 4 |
| zcino | `unknown` | 2795 | 134 | `-` | `-` | 0 | 0 |
| zcino-modern | `docker` | 210 | 94 | `3000, 4222, 5432, 6379, 6443, 8080, 8082, 8090, 8123, 8222, 9000` | `-` | 0 | 0 |
| zdash | `docker, python, terraform` | 1107 | 1018 | `443, 587, 3000, 5173, 5432, 6379, 8000, 8005, 9009` | `api-zdash.zeaz.dev, release.zeaz.dev, zdash.zeaz.dev` | 0 | 2 |
| zkbtrader | `docker, node, npm, python` | 78 | 63 | `8004, 15432, 16379` | `-` | 0 | 4 |
| zlms-prod | `node, npm` | 30012 | 11760 | `131, 135, 155, 443, 3000, 4318, 5432, 6379, 8000, 8080, 8888, 9000, 9080, 9102, 11211` | `-` | 0 | 3 |
| zoffice | `docker` | 141 | 128 | `6901, 6902, 8087, 8090, 8091, 8099, 9222, 18090, 18091, 18789` | `-` | 0 | 0 |
| zsticker | `docker, python` | 73 | 59 | `3008, 8000, 8007` | `zsticker.zeaz.dev` | 0 | 1 |
| zwallet | `docker, node, pnpm, python, terraform` | 451 | 392 | `3000, 3002, 4173, 5432, 5601, 6379, 8080, 8090, 8091, 8092, 8093, 8094, 8095, 8096, 8097, 8098, 8099, 8100, 8200, 8332, 8545, 8546, 8899, 9090, 9092, 9200` | `-` | 0 | 1 |

## `ABTPi18n`

- Path: `apps/ABTPi18n`
- Stack: `docker, node, pnpm, python`
- Root tracked files: `261`
- Nested git: `False`
- Files scanned: `262`
- Source-like files scanned: `253`

### Package

- Name: `zeaZdev-abtpro-i18n-monorepo`
- Version: `1.0.1`
- Scripts: `dev:backend, dev:frontend, format, format:js, format:py, generate-metaultra, install-metaultra, lint, lint:js, lint:py, preview-metaultra, prisma:generate, prisma:migrate, test:js, test:py, validate-metaultra`

### Ports

- `375` from `apps/ABTPi18n/tools/ARCHITECTURE.md`
- `587` from `apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.th.md`
- `768` from `apps/ABTPi18n/tools/ARCHITECTURE.md`
- `1920` from `apps/ABTPi18n/tools/ARCHITECTURE.md`
- `3000` from `apps/ABTPi18n/.env.example, apps/ABTPi18n/README.md, apps/ABTPi18n/apps/backend/main.py, apps/ABTPi18n/apps/backend/src/auth/google_provider.py, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md, apps/ABTPi18n/docs/phases/phase3/PHASE3_GUIDE.md`
- `3001` from `apps/ABTPi18n/README.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.th.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/enterprise/TROUBLESHOOTING.en.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_GUIDE.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md, apps/ABTPi18n/tools/EXAMPLES.md, apps/ABTPi18n/tools/README.md, apps/ABTPi18n/tools/README_SCREENSHOTS.md`
- `5432` from `apps/ABTPi18n/.env.example, apps/ABTPi18n/Grok.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.th.md, apps/ABTPi18n/docs/enterprise/DEPLOYMENT.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md, apps/ABTPi18n/docs/strategy/DR_FAILOVER_STRATEGY.md`
- `6379` from `apps/ABTPi18n/apps/backend/src/api/health_endpoints.py, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md`
- `6432` from `apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.th.md`
- `8000` from `apps/ABTPi18n/.env.example, apps/ABTPi18n/Grok.md, apps/ABTPi18n/README.md, apps/ABTPi18n/apps/backend/Dockerfile, apps/ABTPi18n/apps/backend/src/api/tradingview_endpoints.py, apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx, apps/ABTPi18n/apps/frontend/src/app/[lng]/settings/page.tsx, apps/ABTPi18n/apps/frontend/src/components/auth/GoogleSignIn.tsx, apps/ABTPi18n/apps/frontend/src/components/settings/NotificationPreferences.tsx, apps/ABTPi18n/apps/frontend/src/components/settings/TelegramLink.tsx, apps/ABTPi18n/docs/TRADINGVIEW_SUMMARY.md, apps/ABTPi18n/docs/enterprise/API_REFERENCE.en.md`
- `9090` from `apps/ABTPi18n/README.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.th.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_GUIDE.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md`
- `22022` from `apps/ABTPi18n/.env.example, apps/ABTPi18n/docker-compose.yml`

### Domains

- none detected

### Env files

- `apps/ABTPi18n/.env.example` `example` keys=54: `API_BASE_URL, AUDIT_LOG_LEVEL, AUDIT_LOG_RETENTION_DAYS, AUDIT_SENSITIVE_FIELDS, BACKTEST_DATA_PATH, BACKUP_RETENTION_DAYS, BANDIT_CONFIG_PATH, BOT_BINANCE_API_KEY, BOT_BINANCE_API_SECRET, BOT_DATABASE_URL, BOT_DRY_RUN, BOT_FIXED_NOTIONAL_USDT, BOT_HEARTBEAT_INTERVAL_SECONDS, BOT_INTERNAL_PORT, BOT_LEVERAGE, BOT_MAX_CANDLES_PER_STREAM, BOT_MAX_CORRELATION, BOT_MAX_RECONNECT_BACKOFF_SECONDS, BOT_ML_MODEL_PATH, BOT_SYMBOLS, BOT_WEBSOCKET_TIMEOUT_SECONDS, DATABASE_REPLICA_URL, DATABASE_URL, ENABLE_AUDIT_LOGGING, ENABLE_AUTO_ROTATION_ALERTS, ENABLE_HEALTH_CHECKS, ENABLE_PAPER_TRADING, ENABLE_SECURITY_SCANNING, ENCRYPTION_KEY, FRONTEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, HEALTH_CHECK_INTERVAL_SECONDS, MAX_CONCURRENT_BACKTESTS, NEXT_PUBLIC_BACKEND_URL, PAYMENT_GATEWAY_URL, PLUGIN_MAX_CPU_PERCENT, PLUGIN_MAX_MEMORY_MB, PLUGIN_REGISTRY_URL, PLUGIN_VERIFY_SIGNATURES, POSTGRES_DB, POSTGRES_PASS, POSTGRES_PORT, POSTGRES_USER, PROMPTPAY_MERCHANT_ID, PROMPTPAY_WEBHOOK_SECRET, REDIS_URL, SECRET_ROTATION_GRACE_PERIOD_DAYS, SECRET_ROTATION_POLICY_DAYS`

### Findings

- `info` `expected_port_not_detected`: Expected port 3010 from apps-port-plan not detected in source text
- `info` `expected_hostname_not_detected`: Expected hostname abtpi18n.zeaz.dev from apps-port-plan not detected in source text

### TODO/FIXME/HACK hits

- `apps/ABTPi18n/Grok.md:566` `1.  **Bug ใน open\_position**: ในตัวอย่างการสร้าง new\_pos มีการอ้างอิง size ก่อนกำหนดค่า (ในส่วน margin\_used) ควรคำนวณขนาดก่อนสร้าง Position Object`
- `apps/ABTPi18n/Grok.md:620` `ได้รับคำแนะนำที่ยอดเยี่ยมครับ โดยเฉพาะเรื่อง Data Alignment ใน Risk Engine และการแก้ Bug ของ size ก่อนนิยาม ซึ่งถือเป็นจุดตายใน Production จริง สำหรับ Execution Layer นี้ ผมจะออกแบ`
- `apps/ABTPi18n/Grok.md:731` `3.  Integrated Execution Flow (main.py update) นี่คือการอัปเดต run\_strategy\_worker เพื่อแก้ Bug ที่คุณแจ้งมาและเชื่อมต่อกับ Executor ครับ Python`
- `apps/ABTPi18n/Grok.md:759` `# BUG FIX: Calculate size and margin FIRST`
- `apps/ABTPi18n/Grok.md:803` `-   การแก้ไข Bug เรื่องการคำนวณ size และ margin ก่อนสร้าง Position Object ถูกต้อง`
- `apps/ABTPi18n/apps/backend/src/utils/dependencies.py:35` `# TODO: Implement proper session validation`
- `apps/ABTPi18n/apps/backend/src/utils/dependencies.py:58` `# TODO: Implement proper session validation`
- `apps/ABTPi18n/apps/backend/src/api/tradingview_endpoints.py:163` `# TODO: Implement auto-trading logic here`
- `apps/ABTPi18n/apps/frontend/src/app/[lng]/settings/page.tsx:23` `// TODO: Replace with actual user ID from authentication`
- `apps/ABTPi18n/.github/ISSUE_TEMPLATE/bug_report.md:2` `name: Bug report`
- `apps/ABTPi18n/.github/ISSUE_TEMPLATE/bug_report.md:10` `**Describe the bug**`
- `apps/ABTPi18n/.github/ISSUE_TEMPLATE/bug_report.md:11` `A clear and concise description of what the bug is.`
- `apps/ABTPi18n/docs/guides/RELEASE.md:144` `- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward-compatible`

### Git status

```text
?? apps/ABTPi18n/.env.example
```

## `api`

- Path: `apps/api`
- Stack: `python`
- Root tracked files: `10`
- Nested git: `False`
- Files scanned: `11`
- Source-like files scanned: `10`

### Ports

- `6379` from `apps/api/routers/scheduler.py, apps/api/routers/swarm.py`

### Domains

- none detected

### Env files

- none detected

### Git status

```text
M apps/api/routers/scheduler.py
```

## `openwork`

- Path: `apps/openwork`
- Stack: `docker, node, npm, pnpm`
- Root tracked files: `0`
- Nested git: `True`
- Files scanned: `1680`
- Source-like files scanned: `1213`

### Package

- Name: `@different-ai/openwork-workspace`
- Version: `0.0.0`
- Scripts: `build, build:ui, build:web, bump:major, bump:minor, bump:patch, bump:set, dev, dev:den, dev:den-docker, dev:den-local, dev:den:api, dev:den:db-push, dev:den:inference, dev:den:mysql, dev:den:mysql:down, dev:den:seed-demo, dev:den:web, dev:electron, dev:headless-web, dev:sandbox, dev:ui, dev:ui-demo, dev:web, dev:web-local, dev:windows, dev:windows:x64, email:dev, preview, release:prepare, release:prepare:dry, release:review, release:ship, release:ship:watch, test:e2e, test:events, test:fs-engine, test:health, test:orchestrator, test:permissions, test:refactor, test:session-error-recovery, test:session-scope, test:session-switch, test:sessions, test:todos, typecheck`

### Ports

- `443` from `apps/openwork/ee/apps/den-web/proxy.ts`
- `587` from `apps/openwork/ee/apps/den-api/.env.example`
- `1234` from `apps/openwork/apps/app/tests/session-sync-permissions.test.ts, apps/openwork/apps/app/tests/session-sync-tool-parts.test.ts`
- `3000` from `apps/openwork/apps/app/scripts/open-target.test.ts, apps/openwork/apps/app/tests/env-context.test.ts, apps/openwork/ee/apps/den-api/.env.example, apps/openwork/ee/apps/inference/.env.example, apps/openwork/ee/apps/landing/app/api/_lib/security.ts, apps/openwork/scripts/harness/agents/gan-evaluator.md, apps/openwork/scripts/harness/agents/gan-generator.md`
- `3001` from `apps/openwork/ee/apps/den-api/.env.example`
- `3005` from `apps/openwork/.devcontainer/README.md, apps/openwork/.devcontainer/docker-compose.yml, apps/openwork/.devcontainer/start-services.sh, apps/openwork/.opencode/skills/daytona-cloud-instance/SKILL.md, apps/openwork/.opencode/skills/daytona-electron-test/SKILL.md, apps/openwork/apps/opencode-router/.env.example, apps/openwork/apps/orchestrator/src/cli.ts, apps/openwork/ee/apps/den-api/.env.example, apps/openwork/ee/apps/den-web/README.md, apps/openwork/ee/apps/landing/app/api/_lib/security.ts, apps/openwork/evals/cloud-admin-to-member-assignment-flows.md, apps/openwork/packaging/docker/README.md`
- `3306` from `apps/openwork/.devcontainer/start-daytona-server.sh, apps/openwork/.opencode/skills/daytona-electron-test/SKILL.md, apps/openwork/.opencode/skills/daytona-seeded-cloud-demo/SKILL.md, apps/openwork/ee/apps/den-api/.env.example, apps/openwork/ee/apps/den-api/package.json, apps/openwork/ee/apps/den-api/test/github-webhook.test.ts, apps/openwork/ee/apps/den-api/test/internal-mcp-principal.test.ts, apps/openwork/ee/apps/den-api/test/org-invitations.test.ts, apps/openwork/ee/apps/den-api/test/plugin-system-access.test.ts, apps/openwork/ee/apps/den-api/test/plugin-system-cross-org-idor.test.ts, apps/openwork/ee/apps/inference/.env.example, apps/openwork/ee/apps/inference/src/env.ts`
- `3333` from `apps/openwork/apps/ui-demo/vite.config.ts`
- `3978` from `apps/openwork/evals/daytona-flows.md`
- `4096` from `apps/openwork/apps/app/src/react-app/shell/providers.tsx, apps/openwork/apps/opencode-router/.env.example, apps/openwork/apps/opencode-router/README.md, apps/openwork/apps/opencode-router/install.sh, apps/openwork/apps/opencode-router/src/config.ts, apps/openwork/apps/opencode-router/test/bridge-e2e.test.js, apps/openwork/apps/opencode-router/test/bridge-multiworkspace.test.js, apps/openwork/apps/opencode-router/test/health-send.test.js, apps/openwork/apps/orchestrator/src/cli.ts, apps/openwork/apps/server/README.md, apps/openwork/packaging/docker/Dockerfile, apps/openwork/packaging/docker/README.md`
- `4321` from `apps/openwork/apps/server/src/artifact-files.e2e.test.ts`
- `5173` from `apps/openwork/.devcontainer/docker-compose.yml, apps/openwork/.devcontainer/start-services.sh, apps/openwork/.opencode/skills/browser-automation/SKILL.md, apps/openwork/.opencode/skills/daytona-dev/SKILL.md, apps/openwork/.opencode/skills/daytona-electron-test/SKILL.md, apps/openwork/apps/app/scripts/open-target.test.ts, apps/openwork/apps/orchestrator/src/cli.ts, apps/openwork/apps/server/README.md, apps/openwork/apps/server/src/env-routes.e2e.test.ts, apps/openwork/packaging/docker/docker-compose.den-dev.yml, apps/openwork/packaging/docker/docker-compose.dev.yml, apps/openwork/packaging/systemd/openwork.env.example`
- `5432` from `apps/openwork/scripts/harness/agents/opensource-forker.md`
- `6000` from `apps/openwork/apps/server/src/opencode-connection.test.ts`
- `6080` from `apps/openwork/.devcontainer/start-services.sh, apps/openwork/.devcontainer/test-on-daytona.sh`
- `6379` from `apps/openwork/scripts/harness/agents/opensource-forker.md`
- `8080` from `apps/openwork/apps/server/src/validators.test.ts, apps/openwork/scripts/harness/agents/opensource-forker.md, apps/openwork/scripts/harness/commands/rust-test.md`
- `8090` from `apps/openwork/.devcontainer/test-on-daytona.sh, apps/openwork/.opencode/skills/daytona-recording-artifacts/SKILL.md`
- `8787` from `apps/openwork/apps/app/scripts/remote-workspace-diagnostics.test.ts, apps/openwork/apps/app/src/app/lib/openwork-server.ts, apps/openwork/apps/app/tests/openwork-env-runtime.test.ts, apps/openwork/apps/orchestrator/src/cli.ts, apps/openwork/apps/server/src/config.ts, apps/openwork/apps/server/src/extensions/google-workspace.test.ts, apps/openwork/apps/server/src/tokens.test.ts, apps/openwork/ee/apps/den-worker-proxy/.env.example, apps/openwork/packaging/docker/README.md, apps/openwork/packaging/docker/docker-compose.dev.yml, apps/openwork/scripts/build-microsandbox-openwork-image.sh`
- `8788` from `apps/openwork/.devcontainer/docker-compose.yml, apps/openwork/.devcontainer/start-services.sh, apps/openwork/.opencode/skills/daytona-seeded-cloud-demo/SKILL.md, apps/openwork/evals/cloud-admin-to-member-assignment-flows.md, apps/openwork/packaging/docker/docker-compose.den-dev.yml`
- `8789` from `apps/openwork/ee/apps/den-worker-proxy/.env.example, apps/openwork/packaging/docker/docker-compose.den-dev.yml`
- `8790` from `apps/openwork/ee/apps/den-api/.env.example, apps/openwork/ee/apps/den-api/test/github-webhook.test.ts, apps/openwork/ee/apps/den-api/test/internal-mcp-principal.test.ts, apps/openwork/ee/apps/den-api/test/org-invitations.test.ts, apps/openwork/ee/apps/den-api/test/plugin-system-access.test.ts, apps/openwork/ee/apps/den-api/test/plugin-system-cross-org-idor.test.ts, apps/openwork/packaging/docker/README.md, apps/openwork/packaging/systemd/openwork.env.example`
- `8791` from `apps/openwork/apps/server/src/embedded.ts, apps/openwork/ee/apps/den-api/src/env.ts, apps/openwork/ee/apps/inference/.env.example, apps/openwork/ee/apps/inference/src/models/openwork-dev.json, apps/openwork/packaging/systemd/openwork.env.example`
- `9222` from `apps/openwork/.opencode/skills/daytona-chrome-cdp/SKILL.md`
- `9223` from `apps/openwork/evals/browser-extension-flows.md`
- `9823` from `apps/openwork/.opencode/skills/browser-automation/SKILL.md, apps/openwork/evals/openable-items-flow.md, apps/openwork/evals/react-session-flows.md, apps/openwork/packaging/systemd/openwork.env.example, apps/openwork/scripts/openwork-debug.sh`
- `9825` from `apps/openwork/.devcontainer/README.md, apps/openwork/.devcontainer/docker-compose.yml, apps/openwork/.devcontainer/start-services.sh, apps/openwork/.devcontainer/test-on-daytona.sh, apps/openwork/.opencode/skills/daytona-dev/SKILL.md, apps/openwork/.opencode/skills/daytona-electron-test/SKILL.md, apps/openwork/.opencode/skills/run-evals/SKILL.md, apps/openwork/evals/README.md, apps/openwork/evals/daytona-flows.md`
- `9830` from `apps/openwork/.opencode/skills/browser-automation/SKILL.md`
- `11434` from `apps/openwork/apps/app/src/app/extensions.ts, apps/openwork/apps/app/src/react-app/domains/settings/openai-image-extension.ts, apps/openwork/apps/server/src/jsonc.test.ts, apps/openwork/ee/apps/den-api/src/routes/org/plugin-system/store.ts`
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

- none detected

### Env files

- `apps/openwork/apps/app/.env.migration-release` `local-only` keys=7: `VITE_OPENWORK_MIGRATION_LINUX_ARM64_URL, VITE_OPENWORK_MIGRATION_LINUX_X64_URL, VITE_OPENWORK_MIGRATION_MAC_ARM64_URL, VITE_OPENWORK_MIGRATION_MAC_X64_URL, VITE_OPENWORK_MIGRATION_RELEASE, VITE_OPENWORK_MIGRATION_VERSION, VITE_OPENWORK_MIGRATION_WINDOWS_X64_URL`
- `apps/openwork/apps/opencode-router/.env.example` `example` keys=19: `GROUPS_ENABLED, LOG_LEVEL, OPENCODE_DIRECTORY, OPENCODE_ROUTER_CONFIG_PATH, OPENCODE_ROUTER_DATA_DIR, OPENCODE_ROUTER_DB_PATH, OPENCODE_ROUTER_HEALTH_PORT, OPENCODE_SERVER_PASSWORD, OPENCODE_SERVER_USERNAME, OPENCODE_URL, PERMISSION_MODE, PORT, SLACK_APP_TOKEN, SLACK_BOT_TOKEN, SLACK_ENABLED, TELEGRAM_BOT_TOKEN, TELEGRAM_ENABLED, TOOL_OUTPUT_LIMIT, TOOL_UPDATES_ENABLED`
- `apps/openwork/ee/apps/den-api/.env.example` `example` keys=41: `BETTER_AUTH_SECRET, BETTER_AUTH_URL, CORS_ORIGINS, DATABASE_URL, DAYTONA_API_KEY, DAYTONA_API_URL, DEN_BETTER_AUTH_TRUSTED_ORIGINS, DEN_DB_ENCRYPTION_KEY, EMAIL_FROM, LOOPS_API_KEY, OPENROUTER_MANAGEMENT_API_KEY, OPENROUTER_WORKSPACE_ID, OPENWORK_DEV_MODE, POLAR_ACCESS_TOKEN, POLAR_API_BASE, POLAR_BENEFIT_ID, POLAR_FEATURE_GATE_ENABLED, POLAR_PRODUCT_ID, POLAR_RETURN_URL, POLAR_SUCCESS_URL, PORT, PROVISIONER_MODE, RENDER_API_KEY, RENDER_OWNER_ID, RENDER_WORKER_PUBLIC_DOMAIN_SUFFIX, RESEND_API_KEY, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_SECURE, SMTP_USER, STRIPE_BILLING_CANCEL_URL, STRIPE_BILLING_SUCCESS_URL, STRIPE_INFERENCE_PRICE_ID, STRIPE_SEAT_PRICE_ID, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, VERCEL_DNS_DOMAIN, VERCEL_TOKEN, WORKER_ACTIVITY_BASE_URL, WORKER_URL_TEMPLATE`
- `apps/openwork/ee/apps/den-worker-proxy/.env.example` `example` keys=12: `DATABASE_HOST, DATABASE_PASSWORD, DATABASE_URL, DATABASE_USERNAME, DAYTONA_API_KEY, DAYTONA_API_URL, DAYTONA_OPENWORK_PORT, DAYTONA_SIGNED_PREVIEW_EXPIRES_SECONDS, DAYTONA_TARGET, DB_MODE, OPENWORK_DAYTONA_ENV_PATH, PORT`
- `apps/openwork/ee/apps/inference/.env.example` `example` keys=13: `CORS_ORIGINS, DATABASE_HOST, DATABASE_PASSWORD, DATABASE_URL, DATABASE_USERNAME, DB_MODE, DEN_DB_ENCRYPTION_KEY, INFERENCE_ADMIN_TOKEN, INFERENCE_CREDITS_PER_DOLLAR, INFERENCE_PROXY_BASE_URL, INFERENCE_WEBHOOK_SECRET, OPENROUTER_UPSTREAM_URL, PORT`
- `apps/openwork/ee/packages/den-db/.env.example` `example` keys=5: `DATABASE_HOST, DATABASE_PASSWORD, DATABASE_URL, DATABASE_USERNAME, DEN_DB_ENCRYPTION_KEY`
- `apps/openwork/packaging/systemd/openwork.env.example` `example` keys=3: `DISPLAY, OPENWORK_DEV_MODE, OPENWORK_MODE`

### Findings

- `critical` `nested_git`: Nested .git directory exists under app path
- `warn` `local_env_file`: Local env file exists: apps/openwork/apps/app/.env.migration-release
- `critical` `secret_like_hits`: 34 secret-like hit(s) found; review redacted report before commit

### Secret-like hits

Values are redacted. Review source before commit.
- `apps/openwork/ee/apps/den-api/src/session.ts:116` `      token=<redacted>,`
- `apps/openwork/ee/apps/den-api/test/github-connector-app.test.ts:49` `          return new Response(JSON.stringify({ token=<redacted> }), { status: 201 })`
- `apps/openwork/ee/apps/den-api/test/github-connector-app.test.ts:104` `      secret=<redacted>,`
- `apps/openwork/ee/apps/den-api/test/github-connector-app.test.ts:109` `    expect(verifyGithubInstallStateToken({ now: new Date("2026-04-21T19:05:00.000Z"), secret=<redacted>, token })).toMatchObject({`
- `apps/openwork/ee/apps/den-api/test/github-connector-app.test.ts:114` `    expect(verifyGithubInstallStateToken({ now: new Date("2026-04-21T19:05:00.000Z"), secret=<redacted>, token })).toBeNull()`
- `apps/openwork/ee/apps/den-api/test/github-connector-app.test.ts:151` `          return new Response(JSON.stringify({ token=<redacted> }), { status: 201 })`
- `apps/openwork/apps/app/scripts/remote-workspace-diagnostics.test.ts:31` `    token=<redacted>,`
- `apps/openwork/apps/opencode-router/test/telegram.test.js:99` `      token=<redacted>,`
- `apps/openwork/apps/opencode-router/test/telegram.test.js:145` `        token=<redacted>,`
- `apps/openwork/apps/opencode-router/test/telegram.test.js:181` `      token=<redacted>,`
- `apps/openwork/apps/server/src/workspace-export-safety.test.ts:30` `            apiKey=<redacted>,`
- `apps/openwork/apps/server/src/workspace-export-safety.test.ts:34` `          demo: { token=<redacted>, enabled: true, key: "AbCDef1234567890+/token" },`
- `apps/openwork/apps/server/src/workspace-export-safety.test.ts:38` `        { path: ".opencode/plugins/demo/index.ts", content: "const apiKey=<redacted>;" },`
- `apps/openwork/apps/server/src/workspace-export-safety.test.ts:67` `              apiKey=<redacted>,`
- `apps/openwork/apps/server/src/workspace-export-safety.test.ts:87` `            token=<redacted>,`
- `apps/openwork/apps/server/src/workspace-export-safety.test.ts:93` `            apiKey=<redacted>,`
- `apps/openwork/apps/server/src/workspace-export-safety.test.ts:100` `        { path: ".opencode/plugins/demo/index.ts", content: "const token=<redacted>;" },`
- `apps/openwork/apps/server/src/workspace-activate.e2e.test.ts:120` `    token=<redacted>,`
- `apps/openwork/apps/server/src/workspace-activate.e2e.test.ts:158` `    token=<redacted>,`
- `apps/openwork/apps/server/src/env-routes.e2e.test.ts:26` `    token=<redacted>,`
- `apps/openwork/apps/server/src/session-read-model.e2e.test.ts:128` `    token=<redacted>,`
- `apps/openwork/apps/server/src/reload-events.e2e.test.ts:29` `    token=<redacted>,`
- `apps/openwork/apps/server/src/tokens.test.ts:15` `    token=<redacted>,`
- `apps/openwork/apps/server/src/artifact-files.e2e.test.ts:35` `    token=<redacted>,`
- `apps/openwork/apps/server/src/workspace-import-preview.test.ts:49` `    token=<redacted>,`
- `apps/openwork/apps/server/src/portable-opencode.test.ts:9` `      provider: { openai: { options: { apiKey=<redacted> } } },`
- `apps/openwork/apps/server/src/extensions/google-workspace.test.ts:17` `    token=<redacted>,`
- `apps/openwork/scripts/harness/agents/code-reviewer.md:274` `  const apiKey=<redacted>;           // BAD`
- `apps/openwork/scripts/harness/commands/kotlin-test.md:85` `            password=<redacted>,`
- `apps/openwork/scripts/harness/commands/kotlin-test.md:97` `            password=<redacted>,`
- `apps/openwork/scripts/harness/commands/kotlin-test.md:110` `            password=<redacted>,`
- `apps/openwork/scripts/harness/commands/rust-test.md:80` `            password=<redacted>.into(),`
- `apps/openwork/scripts/harness/commands/rust-test.md:90` `            password=<redacted>.into(),`
- `apps/openwork/scripts/harness/commands/rust-test.md:105` `            password=<redacted>.into(),`

### TODO/FIXME/HACK hits

- `apps/openwork/README.md:56` `- **Debug exports**: copy or export the runtime debug report and developer log stream from Settings -> Debug when you need to file a bug.`
- `apps/openwork/README.md:186` `If you need to report a desktop or session bug, open Settings -> Debug and export both the runtime debug report and developer logs before filing an issue.`
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

### Large files

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

### Git status

```text
?? apps/openwork/
```

## `web`

- Path: `apps/web`
- Stack: `node, npm`
- Root tracked files: `43`
- Nested git: `False`
- Files scanned: `45`
- Source-like files scanned: `36`

### Package

- Name: `zeaz-platform`
- Version: `0.2.0`
- Scripts: `build, dev, lint, start`

### Ports

- `3000` from `apps/web/README.md`
- `8000` from `apps/web/src/app/swarm-runtime/page.tsx, apps/web/src/lib/api.ts`

### Domains

- none detected

### Env files

- none detected

### Findings

- `info` `expected_port_not_detected`: Expected port 3003 from apps-port-plan not detected in source text
- `info` `expected_hostname_not_detected`: Expected hostname app.zeaz.dev from apps-port-plan not detected in source text

## `zAcademy`

- Path: `apps/zAcademy`
- Stack: `node, npm, terraform`
- Root tracked files: `0`
- Nested git: `False`
- Files scanned: `134`
- Source-like files scanned: `66`

### Package

- Name: `None`
- Version: `None`
- Scripts: `-`

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

## `zcino`

- Path: `apps/zcino`
- Stack: `unknown`
- Root tracked files: `0`
- Nested git: `False`
- Files scanned: `2795`
- Source-like files scanned: `134`

### Ports

- none detected

### Domains

- none detected

### Env files

- none detected

### Findings

- `info` `expected_port_not_detected`: Expected port 3000 from apps-port-plan not detected in source text
- `info` `expected_hostname_not_detected`: Expected hostname zcino.zeaz.dev from apps-port-plan not detected in source text

### TODO/FIXME/HACK hits

- `apps/zcino/resources/games_flash/CWS_OTHER_EUROPEAN_ROULETTE_3D/history/history.js:315` `//IE seems to have a bug where it stops updating the URL it`
- `apps/zcino/resources/games_flash/CWS_OTHER_EUROPEAN_ROULETTE_3D/history/history.js:372` `// FIXME: could this ever be a forward button?`
- `apps/zcino/jscript/calendar.js:53` `// TODO: determine which cases actually cause this to happen`
- `apps/zcino/jscript/calendar.js:315` `// TODO rename to "widget" when switching to widget factory`
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
- `apps/zcino/css/calendar.css:178` `/* IE/Win - Fix animation bug - #4615 */`
- `apps/zcino/css/calendar.css:437` `.ui-tabs { position: relative; padding: .2em; zoom: 1; } /* position: relative prevents IE scroll bug (element with position: relative inside container with overflow: auto appear a`
- `apps/zcino/css/calendar.css:443` `.ui-tabs .ui-tabs-nav li a, .ui-tabs.ui-tabs-collapsible .ui-tabs-nav li.ui-tabs-selected a { cursor: pointer; } /* first selector in group seems obsolete, but required to overcome`

### Large files

- `apps/zcino/template_files11/Banner-Header.psd` `13148120` bytes
- `apps/zcino/images/slider/slider.psd` `9913234` bytes
- `apps/zcino/resources/games_flash/CWS_OTHER_EUROPEAN_ROULETTE_3D/Roulette.swf` `7214262` bytes
- `apps/zcino/administrator/includes/resources/tools/dictionary-import/sample-words-en.txt` `2312631` bytes
- `apps/zcino/template_files11/Banner-Top3.psd` `2237781` bytes
- `apps/zcino/template_files11/Banner-Top2.psd` `1088772` bytes

## `zcino-modern`

- Path: `apps/zcino-modern`
- Stack: `docker`
- Root tracked files: `0`
- Nested git: `False`
- Files scanned: `210`
- Source-like files scanned: `94`

### Ports

- `3000` from `apps/zcino-modern/README.md, apps/zcino-modern/frontend/Dockerfile, apps/zcino-modern/frontend/start_next.sh`
- `4222` from `apps/zcino-modern/docs/source-checklist.md, apps/zcino-modern/infra/docker-compose.yml, apps/zcino-modern/infra/nats.conf, apps/zcino-modern/k8s/baseline/network-policies.yaml`
- `5432` from `apps/zcino-modern/README.md, apps/zcino-modern/docs/source-checklist.md, apps/zcino-modern/infra/docker-compose.yml, apps/zcino-modern/k8s/baseline/network-policies.yaml`
- `6379` from `apps/zcino-modern/README.md, apps/zcino-modern/docs/operations.md, apps/zcino-modern/docs/source-checklist.md, apps/zcino-modern/infra/docker-compose.yml, apps/zcino-modern/k8s/baseline/network-policies.yaml`
- `6443` from `apps/zcino-modern/release/zeaz_release_v2.sh`
- `8080` from `apps/zcino-modern/README.md, apps/zcino-modern/docs/api.md, apps/zcino-modern/docs/operations.md, apps/zcino-modern/infra/docker-compose.yml, apps/zcino-modern/k8s/game-service.yaml`
- `8082` from `apps/zcino-modern/README.md, apps/zcino-modern/infra/docker-compose.yml`
- `8090` from `apps/zcino-modern/README.md, apps/zcino-modern/docs/source-checklist.md, apps/zcino-modern/k8s/zeaz-testnet/zeaz-node.yaml`
- `8123` from `apps/zcino-modern/infra/docker-compose.yml, apps/zcino-modern/k8s/baseline/network-policies.yaml`
- `8222` from `apps/zcino-modern/infra/docker-compose.yml, apps/zcino-modern/infra/nats.conf`
- `9000` from `apps/zcino-modern/infra/docker-compose.yml`

### Domains

- none detected

### Env files

- none detected

### Findings

- `info` `expected_port_not_detected`: Expected port 3015 from apps-port-plan not detected in source text
- `info` `expected_hostname_not_detected`: Expected hostname zcino-modern.zeaz.dev from apps-port-plan not detected in source text

### TODO/FIXME/HACK hits

- `apps/zcino-modern/docs/zeaz-protocol.md:11` `- Major versions may break wire compatibility; minor versions may add optional fields; patch versions are bug-fix compatible.`
- `apps/zcino-modern/docs/protocol/v1.0.0/spec.md:41` `- Patch versions contain clarifications or bug fixes. During negotiation, a node MAY downgrade a requested patch to its current patch.`

## `zdash`

- Path: `apps/zdash`
- Stack: `docker, python, terraform`
- Root tracked files: `1122`
- Nested git: `False`
- Files scanned: `1107`
- Source-like files scanned: `1018`

### Ports

- `443` from `apps/zdash/install-zdash-prod.sh`
- `587` from `apps/zdash/.env.example, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt`
- `3000` from `apps/zdash/infra/k8s/configmap.yaml`
- `5173` from `apps/zdash/.env.example, apps/zdash/.github/workflows/e2e.yml, apps/zdash/README.md, apps/zdash/backend/app/core/config.py, apps/zdash/backend/app/tests/test_phase7_dashboard_api.py, apps/zdash/docs/reports/zdash-deep-dive-review-audit-2026-05-30.md, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt, apps/zdash/docs/runbooks/GO_LIVE_CHECKLIST.md, apps/zdash/docs/runbooks/INSTALLATION.md, apps/zdash/docs/runbooks/QUICK_START.md, apps/zdash/docs/runbooks/ROLLBACK_RUNBOOK.md, apps/zdash/docs/runbooks/START_SERVER.md`
- `5432` from `apps/zdash/.github/workflows/e2e.yml, apps/zdash/README.md, apps/zdash/backend/app/tests/test_production_safety.py, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt, apps/zdash/infra/k8s/postgres-statefulset.yaml`
- `6379` from `apps/zdash/infra/k8s/redis-deployment.yaml`
- `8000` from `apps/zdash/Makefile, apps/zdash/docs/prompts/AI_CODING_PROMPTS_INDEX.md, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt`
- `8005` from `apps/zdash/.env.example, apps/zdash/.github/workflows/e2e.yml, apps/zdash/AGENTS.md, apps/zdash/README.md, apps/zdash/docker-compose.prod.yml, apps/zdash/docker-compose.yml, apps/zdash/docs/AI_TRADER_CONTROL_PLANE.md, apps/zdash/docs/architecture/PHASE_10_SAAS_MONETIZATION.md, apps/zdash/docs/architecture/PHASE_33_AI_TRADER_SIMULATION.md, apps/zdash/docs/releases/final-release-checklist.md, apps/zdash/docs/reports/zdash-deep-dive-review-audit-2026-05-30.md, apps/zdash/docs/reports/zdash-deep-scan/04-routes-api.txt`
- `9009` from `apps/zdash/docs/reports/zdash-deep-scan/06-package-make-scripts.txt`

### Domains

- `api-zdash.zeaz.dev` from `apps/zdash/IMPORT_SOURCE.md, apps/zdash/infra/cloudflare/tunnel-config.example.yml, apps/zdash/infra/k8s/nginx-ingress.yaml`
- `release.zeaz.dev` from `apps/zdash/IMPORT_SOURCE.md`
- `zdash.zeaz.dev` from `apps/zdash/.env.example, apps/zdash/CODE-OF-CONDUCT.md, apps/zdash/COMMUNITY.md, apps/zdash/CONTRIBUTING.md, apps/zdash/IMPORT_SOURCE.md, apps/zdash/Makefile, apps/zdash/README.md, apps/zdash/SECURITY.md, apps/zdash/docs/ops/SIGNED_RELEASE_ATTESTATION.md, apps/zdash/docs/releases/FINAL_RELEASE_NOTES.md, apps/zdash/docs/releases/v0.42.0-rc1.md, apps/zdash/docs/releases/v2.0.1.md`

### Env files

- `apps/zdash/.env.example` `example` keys=256: `AIOPS_ENABLED, AI_PROVIDER, AI_TRADING_ANALYSIS_ENABLED, AI_TRADING_PROVIDER, ALERT_RULES_ENABLED, ALLOWED_DATA_REGIONS, ALLOW_MANUAL_RESUME, ALLOW_STRATEGY_PROMOTION, API_KEY_DEFAULT_EXPIRES_DAYS, API_KEY_HASH_PEPPER, API_KEY_PREFIX, APP_ENV, APP_NAME, AUTH_ALLOW_BOOTSTRAP_IN_PRODUCTION, AUTH_ENABLED, BACKEND_HOST, BACKEND_PORT, BACKTESTING_ENABLED, BACKTEST_COMMISSION_PER_TRADE, BACKTEST_DATASET_SOURCE, BACKTEST_DEFAULT_RISK_PER_TRADE_PERCENT, BACKTEST_DEFAULT_SYMBOL, BACKTEST_DEFAULT_TIMEFRAME, BACKTEST_INITIAL_BALANCE, BACKTEST_SLIPPAGE_POINTS, BACKTEST_SPREAD_POINTS, BILLING_CURRENCY, BILLING_ENABLED, BILLING_FAIL_CLOSED, BILLING_GRACE_PERIOD_DAYS, BILLING_PROVIDER, BILLING_TRIAL_DAYS, BILLING_WEBHOOK_SECRET, BLAST_RADIUS_ANALYSIS_ENABLED, BOOTSTRAP_ADMIN_PASSWORD, BOOTSTRAP_ADMIN_USERNAME, CLAUDE_API_KEY, CLAUDE_MODEL, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, CLOUDFLARE_DRY_RUN, CLOUDFLARE_ENABLED, CLOUDFLARE_HOSTNAME, CLOUDFLARE_OPERATOR_REPO, CLOUDFLARE_TUNNEL_NAME, CLOUDFLARE_ZONE_ID, COMPLIANCE_ENABLED, CONTENT_DEFAULT_BRAND, CONTENT_DEFAULT_LANGUAGE, CONTENT_DEFAULT_TONE`
- `apps/zdash/.env.production` `local-only` keys=19: `APP_ENV, AUTH_ALLOW_BOOTSTRAP_IN_PRODUCTION, AUTH_ENABLED, BOOTSTRAP_ADMIN_PASSWORD, BOOTSTRAP_ADMIN_USERNAME, DATABASE_URL, DEFAULT_ADMIN_PASSWORD, DRY_RUN, JWT_ALGORITHM, JWT_SECRET_KEY, LIVE_TRADING_ACK, METRICS_ALLOW_UNAUTHENTICATED_DEV, METRICS_AUTH_REQUIRED, MT5_ENABLED, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, PRODUCTION_ALLOW_LIVE_ACTIONS, PRODUCTION_SAFETY_LOCK`
- `apps/zdash/frontend/.env.example` `example` keys=11: `VITE_API_BASE_URL, VITE_APP_ENV, VITE_APP_VERSION, VITE_AUTH_ENABLED, VITE_BUILD_SHA, VITE_BUILD_TIME, VITE_ENABLE_MOCK_FALLBACK, VITE_POLL_INTERVAL_MS, VITE_REALTIME_ENABLED, VITE_SHOW_SAFETY_BANNERS, VITE_WS_BASE_URL`

### Findings

- `warn` `local_tooling_or_vendor_dir`: .codex exists; excluded from review and should not be committed
- `warn` `local_env_file`: Local env file exists: apps/zdash/.env.production

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

### Git status

```text
M apps/zdash/.env.example
 M apps/zdash/CODE-OF-CONDUCT.md
 M apps/zdash/COMMUNITY.md
 M apps/zdash/CONTRIBUTING.md
 M apps/zdash/IMPORT_SOURCE.md
 M apps/zdash/Makefile
 M apps/zdash/README.md
 M apps/zdash/SECURITY.md
 M apps/zdash/docs/ops/SIGNED_RELEASE_ATTESTATION.md
 M apps/zdash/docs/releases/FINAL_RELEASE_NOTES.md
 M apps/zdash/docs/releases/v0.42.0-rc1.md
 M apps/zdash/docs/releases/v2.0.1.md
 M apps/zdash/docs/releases/v2.0.2.md
 M apps/zdash/docs/runbooks/ENTERPRISE_CUSTOMER_RUNBOOK.md
 M apps/zdash/docs/runbooks/INSTALLATION.md
 M apps/zdash/docs/runbooks/REALTIME_GATEWAY.md
 M apps/zdash/frontend/src/tests/useCollaboration.test.ts
 M apps/zdash/infra/cloudflare/tunnel-config.example.yml
 M apps/zdash/infra/k8s/configmap.yaml
 M apps/zdash/infra/k8s/nginx-ingress.yaml
 M apps/zdash/infra/scripts/cloudflare-dry-run.sh
 M apps/zdash/infra/terraform/variables.tf
```

## `zkbtrader`

- Path: `apps/zkbtrader`
- Stack: `docker, node, npm, python`
- Root tracked files: `76`
- Nested git: `False`
- Files scanned: `78`
- Source-like files scanned: `63`

### Package

- Name: `None`
- Version: `None`
- Scripts: `-`

### Ports

- `8004` from `apps/zkbtrader/.env, apps/zkbtrader/.env.example, apps/zkbtrader/README.md, apps/zkbtrader/docs/prompt/zkbtrader-ecc-next.md`
- `15432` from `apps/zkbtrader/.env, apps/zkbtrader/.env.example`
- `16379` from `apps/zkbtrader/.env, apps/zkbtrader/.env.example`

### Domains

- none detected

### Env files

- `apps/zkbtrader/.env` `local-only` keys=15: `API_HOST, API_PORT, APP_ENV, DEFAULT_STAKE_CURRENCY, DEFAULT_SYMBOLS, EXECUTION_MODE, GITHUB_TOKEN, GLOBAL_KILL_SWITCH, GPG_PASSPHRASE, LIVE_TRADING_ENABLED, LOG_LEVEL, PAPER_STARTING_BTC, PAPER_STARTING_USDT, POSTGRES_HOST_PORT, REDIS_HOST_PORT`
- `apps/zkbtrader/.env.example` `example` keys=16: `API_HOST, API_PORT, APP_ENV, DATABASE_URL, DEFAULT_STAKE_CURRENCY, DEFAULT_SYMBOLS, EXECUTION_MODE, GLOBAL_KILL_SWITCH, KUCOIN_BASE_URL, KUCOIN_SANDBOX, LIVE_TRADING_ENABLED, LOG_LEVEL, PAPER_STARTING_BTC, PAPER_STARTING_USDT, POSTGRES_HOST_PORT, REDIS_HOST_PORT`

### Findings

- `warn` `local_tooling_or_vendor_dir`: .vendor exists; excluded from review and should not be committed
- `warn` `local_tooling_or_vendor_dir`: .codex exists; excluded from review and should not be committed
- `warn` `local_tooling_or_vendor_dir`: .claude exists; excluded from review and should not be committed
- `warn` `local_env_file`: Local env file exists: apps/zkbtrader/.env
- `info` `expected_hostname_not_detected`: Expected hostname zkbtrader.zeaz.dev from apps-port-plan not detected in source text

### Git status

```text
?? apps/zkbtrader/.env.example
```

## `zlms-prod`

- Path: `apps/zlms-prod`
- Stack: `node, npm`
- Root tracked files: `0`
- Nested git: `False`
- Files scanned: `30012`
- Source-like files scanned: `11760`

### Package

- Name: `zlms-frontend-runtime-migration`
- Version: `0.1.0`
- Scripts: `audit:frontend-runtime, codemod:frontend-runtime, migration:phase-abcd, typecheck:frontend-runtime`

### Ports

- `131` from `apps/zlms-prod/app/courseware/user_guide/searchindex.js, apps/zlms-prod/app/examdb/user_guide/searchindex.js`
- `135` from `apps/zlms-prod/app/courseware/user_guide/searchindex.js, apps/zlms-prod/app/examdb/user_guide/searchindex.js`
- `155` from `apps/zlms-prod/app/courseware/user_guide/searchindex.js, apps/zlms-prod/app/examdb/user_guide/searchindex.js`
- `443` from `apps/zlms-prod/k8s/runtime-security-fabric.yaml, apps/zlms-prod/z-runner/kubernetes/runner-networkpolicy.yaml`
- `3000` from `apps/zlms-prod/app/assets/global/plugins/bootstrap-editable/README.md, apps/zlms-prod/app/bin/Release/Publish/assets/global/plugins/bootstrap-editable/README.md, apps/zlms-prod/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-editable/README.md, apps/zlms-prod/git-tools.sh`
- `4318` from `apps/zlms-prod/k8s/runtime-security-fabric.yaml`
- `5432` from `apps/zlms-prod/app/courseware/user_guide/database/configuration.html, apps/zlms-prod/app/examdb/user_guide/database/configuration.html`
- `6379` from `apps/zlms-prod/app/courseware/user_guide/libraries/sessions.html, apps/zlms-prod/app/examdb/user_guide/libraries/sessions.html`
- `8000` from `apps/zlms-prod/app/assets/global/plugins/bootstrap-pwstrength/README.md, apps/zlms-prod/app/assets/global/plugins/bootstrap-select/README.md, apps/zlms-prod/app/bin/Release/Publish/assets/global/plugins/bootstrap-pwstrength/README.md, apps/zlms-prod/app/bin/Release/Publish/assets/global/plugins/bootstrap-select/README.md, apps/zlms-prod/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-pwstrength/README.md, apps/zlms-prod/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-select/README.md`
- `8080` from `apps/zlms-prod/UBUNTU_24_04_MANUAL.md, apps/zlms-prod/app/courseware/user_guide/libraries/xmlrpc.html, apps/zlms-prod/app/examdb/user_guide/libraries/xmlrpc.html, apps/zlms-prod/k8s/runtime-security-fabric.yaml`
- `8888` from `apps/zlms-prod/app/assets/global/plugins/typeahead/README.md, apps/zlms-prod/app/bin/Release/Publish/assets/global/plugins/typeahead/README.md, apps/zlms-prod/app/obj/Release/Package/PackageTmp/assets/global/plugins/typeahead/README.md`
- `9000` from `apps/zlms-prod/app/assets/global/plugins/codemirror/mode/nginx/index.html, apps/zlms-prod/app/bin/Release/Publish/assets/global/plugins/codemirror/mode/nginx/index.html, apps/zlms-prod/app/obj/Release/Package/PackageTmp/assets/global/plugins/codemirror/mode/nginx/index.html`
- `9080` from `apps/zlms-prod/z-runner/telemetry/promtail.yaml`
- `9102` from `apps/zlms-prod/z-runner/kubernetes/runner-deployment.yaml, apps/zlms-prod/z-runner/telemetry/otel-config.yaml`
- `11211` from `apps/zlms-prod/app/courseware/user_guide/libraries/sessions.html, apps/zlms-prod/app/examdb/user_guide/libraries/sessions.html`

### Domains

- none detected

### Env files

- `apps/zlms-prod/z-runner/config/runner.env` `local-only` keys=35: `ARC_SCALE_TARGET_NAME, CONTAINER_RUNTIME, DOCKER_HOST, GITHUB_API_URL, GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID, GITHUB_APP_PRIVATE_KEY_FILE, GITHUB_OWNER, GITHUB_REPOSITORY, GITHUB_URL, KUBERNETES_NAMESPACE, MAX_RUNNERS, MIN_RUNNERS, RUNNER_ALLOWED_EGRESS_CIDRS, RUNNER_DISABLE_AUTO_UPDATE, RUNNER_EPHEMERAL, RUNNER_GROUP, RUNNER_INSTALL_DIR, RUNNER_LABELS_FILE, RUNNER_LOG_DIR, RUNNER_MAX_CONTAINER_SECONDS, RUNNER_MAX_CPU_PERCENT, RUNNER_MAX_JOB_SECONDS, RUNNER_MAX_MEMORY_PERCENT, RUNNER_METRICS_FILE, RUNNER_NAME_PREFIX, RUNNER_QUARANTINE_DIR, RUNNER_REPLACE_EXISTING, RUNNER_SCOPE, RUNNER_VERSION, RUNNER_WORKDIR, RUNSC_RUNTIME, SIEM_WEBHOOK_URL, TARGET_QUEUED_JOBS_PER_RUNNER, WATCHDOG_INTERVAL_SECONDS`

### Findings

- `warn` `local_tooling_or_vendor_dir`: .codex exists; excluded from review and should not be committed
- `warn` `local_tooling_or_vendor_dir`: .claude exists; excluded from review and should not be committed
- `warn` `local_env_file`: Local env file exists: apps/zlms-prod/z-runner/config/runner.env
- `info` `expected_port_not_detected`: Expected port 8012 from apps-port-plan not detected in source text
- `info` `expected_hostname_not_detected`: Expected hostname zlms.zeaz.dev from apps-port-plan not detected in source text

### TODO/FIXME/HACK hits

- `apps/zlms-prod/CHANGELOG.md:1` `## [Unreleased] - Bug Fixes & Security Patches`
- `apps/zlms-prod/app/Scripts/globalize.js:116` `// TODO: more detailed description and example`
- `apps/zlms-prod/app/Scripts/globalize.js:136` `// TODO: more detailed description and example`
- `apps/zlms-prod/app/Scripts/globalize.js:153` `// TODO: more detailed description and example`
- `apps/zlms-prod/app/Scripts/jquery-1.10.2.js:1586` `// We allow this because of a bug in IE8/9 that throws an error`
- `apps/zlms-prod/app/Scripts/jquery-1.10.2.js:3488` `// hidden; don safety goggles and see bug #4512 for more information).`
- `apps/zlms-prod/app/Scripts/jquery-1.10.2.js:3519` `// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right`
- `apps/zlms-prod/app/Scripts/jquery-1.10.2.js:4607` `// Set width and height to auto instead of 0 on empty string( Bug #8150 )`
- `apps/zlms-prod/app/Scripts/jquery-1.10.2.js:7005` `// Fixes bug #9237`
- `apps/zlms-prod/app/Scripts/jquery-1.10.2.js:7029` `// Fixes bug #5509`
- `apps/zlms-prod/app/Scripts/jquery-1.10.2.js:7102` `// A tribute to the "awesome hack by Dean Edwards"`
- `apps/zlms-prod/app/Scripts/jquery-1.10.2.js:7143` `// From the awesome hack by Dean Edwards`
- `apps/zlms-prod/app/Scripts/jquery-1.10.2.js:7385` `// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right`
- `apps/zlms-prod/app/Scripts/jquery-1.10.2.js:7394` `// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084`
- `apps/zlms-prod/app/Scripts/jquery-1.10.2.js:8468` `// Bind script tag hack transport`
- `apps/zlms-prod/app/Scripts/jquery-1.10.2.js:8907` `// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)`
- `apps/zlms-prod/app/Scripts/jquery-1.10.2.js:9738` `// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.`
- `apps/zlms-prod/app/DropzoneJs_scripts/dropzone.js:1723` `Source: http://stackoverflow.com/questions/11929099/html5-canvas-drawimage-ratio-bug-ios`
- `apps/zlms-prod/app/examdb/contributing.md:6` `Issues are a quick way to point out a bug. If you find a bug or documentation error in CodeIgniter then please check a few things first:`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:434` `<div class="section" id="bug-fixes-for-3-1-10">`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:435` `<h3>Bug fixes for 3.1.10<a class="headerlink" href="#bug-fixes-for-3-1-10" title="Permalink to this headline">¶</a></h3>`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:437` `<li>Fixed a bug (#5526) - <a class="reference internal" href="libraries/sessions.html"><span class="doc">Session Library</span></a> had a syntax error in its ‘memcached’ driver.</l`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:438` `<li>Fixed a bug (#5542) - <a class="reference internal" href="database/forge.html"><span class="doc">Database Forge</span></a> method <code class="docutils literal"><span class="pr`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:439` `<li>Fixed a bug (#5561) - <a class="reference internal" href="database/index.html"><span class="doc">Database Library</span></a> didn’t allow SSL connection configuration with only`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:440` `<li>Fixed a bug (#5545) - <a class="reference internal" href="libraries/sessions.html"><span class="doc">Session Library</span></a> crashed due to a caching-related error with the `
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:441` `<li>Fixed a bug (#5571) - <a class="reference internal" href="libraries/xmlrpc.html"><span class="doc">XML-RPC Library</span></a> had a typo that triggered an <code class="docutils`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:442` `<li>Fixed a bug (#5587) - <a class="reference internal" href="database/forge.html"><span class="doc">Database Forge</span></a> method <code class="docutils literal"><span class="pr`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:443` `<li>Fixed a bug (#5590) - <a class="reference internal" href="libraries/form_validation.html"><span class="doc">Form Validation Library</span></a> rule <strong>valid_base64</strong`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:444` `<li>Fixed a bug (#5624) - <a class="reference internal" href="database/index.html"><span class="doc">Database Library</span></a> methods <code class="docutils literal"><span class=`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:445` `<li>Fixed a bug (#5627) - <a class="reference internal" href="database/index.html"><span class="doc">Database</span></a> driver ‘mysqli’ triggered an <code class="docutils literal"`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:446` `<li>Fixed a bug (#5651) - <a class="reference internal" href="database/caching.html"><span class="doc">Database Caching</span></a> could try to delete non-existent cache files due `
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:447` `<li>Fixed a bug (#5652) - <a class="reference internal" href="helpers/captcha_helper.html"><span class="doc">CAPTCHA Helper</span></a> function <a class="reference internal" href="`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:448` `<li>Fixed a bug (#5605) - <a class="reference internal" href="libraries/form_validation.html"><span class="doc">Form Validation Library</span></a> didn’t nullify array inputs that `
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:471` `<div class="section" id="bug-fixes-for-3-1-9">`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:472` `<h3>Bug fixes for 3.1.9<a class="headerlink" href="#bug-fixes-for-3-1-9" title="Permalink to this headline">¶</a></h3>`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:476` `<li>Fixed a bug (#5516) - <a class="reference internal" href="helpers/html_helper.html"><span class="doc">HTML Helper</span></a> functions <a class="reference internal" href="helpe`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:488` `<li>Fixed a bug where <a class="reference internal" href="libraries/security.html"><span class="doc">Security Library</span></a> method <code class="docutils literal"><span class="`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:499` `<div class="section" id="bug-fixes-for-3-1-8">`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:500` `<h3>Bug fixes for 3.1.8<a class="headerlink" href="#bug-fixes-for-3-1-8" title="Permalink to this headline">¶</a></h3>`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:502` `<li>Fixed a bug where <a class="reference internal" href="libraries/form_validation.html"><span class="doc">Form Validation Library</span></a>, <a class="reference internal" href="`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:503` `<li>Fixed a bug where <a class="reference internal" href="database/query_builder.html"><span class="doc">Query Builder</span></a> methods <code class="docutils literal"><span class`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:504` `<li>Fixed a bug (#5423) - <a class="reference internal" href="database/index.html"><span class="doc">Database Library</span></a> method <code class="docutils literal"><span class="`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:505` `<li>Fixed a bug (#5425) - <a class="reference internal" href="libraries/xmlrpc.html"><span class="doc">XML-RPC Library</span></a> produced an error message related to <code class="`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:506` `<li>Fixed a bug (#5434) - <a class="reference internal" href="libraries/image_lib.html"><span class="doc">Image Manipulation Library</span></a> attempted to <code class="docutils l`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:507` `<li>Fixed a bug (#5435) - <a class="reference internal" href="database/results.html"><span class="doc">Database Results</span></a> method <code class="docutils literal"><span class`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:525` `<div class="section" id="bug-fixes-for-3-1-7">`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:526` `<h3>Bug fixes for 3.1.7<a class="headerlink" href="#bug-fixes-for-3-1-7" title="Permalink to this headline">¶</a></h3>`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:530` `<li>Fixed a bug (#5278) - <a class="reference internal" href="helpers/url_helper.html"><span class="doc">URL Helper</span></a> function <a class="reference internal" href="helpers/`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:532` `<li>Fixed a bug (#5279) - <a class="reference internal" href="database/query_builder.html"><span class="doc">Query Builder</span></a> didn’t account for already escaped identifiers`
- `apps/zlms-prod/app/examdb/user_guide/changelog.html:533` `<li>Fixed a bug (#5331) - <a class="reference internal" href="helpers/url_helper.html"><span class="doc">URL Helper</span></a> function <a class="reference internal" href="helpers/`

### Large files

- `apps/zlms-prod/app/bin/Release/Publish/bin.zip` `53023928` bytes
- `apps/zlms-prod/app/bin/DevExpress.Web.ASPxThemes.v18.2.dll` `46995192` bytes
- `apps/zlms-prod/app/bin/Release/Publish/bin/DevExpress.Web.ASPxThemes.v14.2.dll` `44642784` bytes
- `apps/zlms-prod/app/obj/Release/Package/PackageTmp/bin/DevExpress.Web.ASPxThemes.v14.2.dll` `44642784` bytes
- `apps/zlms-prod/db/POLICE_LMS.bak` `38021632` bytes
- `apps/zlms-prod/app/bin/DevExpress.Web.v18.2.dll` `21486328` bytes
- `apps/zlms-prod/app/devexpress/DevExpress.Web.ASPxThemes.v16.2.dll` `19518248` bytes
- `apps/zlms-prod/app/bin/DevExpress.Web.Resources.v18.2.dll` `17517816` bytes
- `apps/zlms-prod/app/devexpress/DevExpress.Web.v16.2.dll` `16203048` bytes
- `apps/zlms-prod/app/bin/DevExpress.Utils.v18.2.dll` `14028536` bytes
- `apps/zlms-prod/app/devexpress/DevExpress.Web.ASPxSpreadsheet.v16.2.dll` `13938472` bytes
- `apps/zlms-prod/app/bin/Release/Publish/bin/DevExpress.Web.v14.2.dll` `13335008` bytes
- `apps/zlms-prod/app/obj/Release/Package/PackageTmp/bin/DevExpress.Web.v14.2.dll` `13335008` bytes
- `apps/zlms-prod/app/devexpress/DevExpress.XtraReports.v16.2.Web.dll` `13249320` bytes
- `apps/zlms-prod/app/devexpress/DevExpress.Spreadsheet.v16.2.Core.dll` `12795176` bytes
- `apps/zlms-prod/app/devexpress/DevExpress.Web.Resources.v16.2.dll` `11303208` bytes
- `apps/zlms-prod/db/POLICE_LMS.mdf` `9437184` bytes
- `apps/zlms-prod/app/devexpress/DevExpress.Utils.v16.2.dll` `9020200` bytes
- `apps/zlms-prod/app/bin/DevExpress.Images.v18.2.dll` `8426232` bytes
- `apps/zlms-prod/app/knowledge/App_Data/Database_log.ldf` `8388608` bytes
- `apps/zlms-prod/app/knowledge/App_Data/Database.mdf` `8388608` bytes
- `apps/zlms-prod/app/bin/DevExpress.RichEdit.v18.2.Core.dll` `8267512` bytes
- `apps/zlms-prod/app/bin/DevExpress.Data.v18.2.dll` `6845176` bytes
- `apps/zlms-prod/app/devexpress/DevExpress.RichEdit.v16.2.Core.dll` `6602536` bytes
- `apps/zlms-prod/app/knowledge_old/App_Data/Database.mdf` `6553600` bytes

## `zoffice`

- Path: `apps/zoffice`
- Stack: `docker`
- Root tracked files: `132`
- Nested git: `False`
- Files scanned: `141`
- Source-like files scanned: `128`

### Ports

- `6901` from `apps/zoffice/docker-compose.yml`
- `6902` from `apps/zoffice/app/setup.html`
- `8087` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/app/server.py, apps/zoffice/app/vo-config.json, apps/zoffice/app/whisper-server.py`
- `8090` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/README.md, apps/zoffice/TASK-editor-ui.md, apps/zoffice/TASK-furniture-editor.md, apps/zoffice/app/gateway_presence.py, apps/zoffice/skill/SKILL.md, apps/zoffice/tests/crud_test_results.md, apps/zoffice/tests/test_crud_projects.sh, apps/zoffice/tests/test_workflow_e2e.py, apps/zoffice/website/index.html`
- `8091` from `apps/zoffice/INTEGRATION-SPEC.md`
- `8099` from `apps/zoffice/app/setup.html`
- `9222` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/app/index.html, apps/zoffice/app/setup.html, apps/zoffice/app/vo-config.json, apps/zoffice/kasm-browser-config/browser-supervisor.sh, apps/zoffice/kasm-browser-config/start-cdp-proxy.sh`
- `18090` from `apps/zoffice/.env.example, apps/zoffice/app/Dockerfile`
- `18091` from `apps/zoffice/.env.example, apps/zoffice/app/Dockerfile`
- `18789` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/QA-CODE-QUALITY-SCAN.md, apps/zoffice/README.md, apps/zoffice/app/game.js, apps/zoffice/app/index.html, apps/zoffice/app/server.py, apps/zoffice/app/vo-config.json`

### Domains

- none detected

### Env files

- `apps/zoffice/.env.example` `example` keys=7: `VO_GATEWAY_HTTP, VO_GATEWAY_URL, VO_OFFICE_NAME, VO_OPENCLAW_PATH, VO_PORT, VO_WEATHER_LOCATION, VO_WS_PORT`

### Findings

- `info` `expected_hostname_not_detected`: Expected hostname zoffice.zeaz.dev from apps-port-plan not detected in source text

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

### Git status

```text
M apps/zoffice/app/gateway_presence.py
?? apps/zoffice/.env.example
```

## `zsticker`

- Path: `apps/zsticker`
- Stack: `docker, python`
- Root tracked files: `67`
- Nested git: `False`
- Files scanned: `73`
- Source-like files scanned: `59`

### Ports

- `3008` from `apps/zsticker/Makefile`
- `8000` from `apps/zsticker/Dockerfile`
- `8007` from `apps/zsticker/Makefile, apps/zsticker/README.md`

### Domains

- `zsticker.zeaz.dev` from `apps/zsticker/src/cli/api.py, apps/zsticker/src/cli/dashboard.py`

### Env files

- `apps/zsticker/.env` `local-only` keys=4: `IMGUR_CLIENT_ID, LINE_CHANNEL_ACCESS_TOKEN, LINE_GROUP_ID, SHEET_ID`
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

### Git status

```text
?? apps/zsticker/.env.example
```

## `zwallet`

- Path: `apps/zwallet`
- Stack: `docker, node, pnpm, python, terraform`
- Root tracked files: `0`
- Nested git: `False`
- Files scanned: `451`
- Source-like files scanned: `392`

### Package

- Name: `zwallet`
- Version: `None`
- Scripts: `check:circular, generate:releases, lint, setup:auto, typecheck`

### Ports

- `3000` from `apps/zwallet/apps/api/src/server.ts, apps/zwallet/infra/helm/templates/api-deployment.yaml, apps/zwallet/infra/k8s/api-deployment.yaml, apps/zwallet/infra/k8s/monitoring.yaml, apps/zwallet/k8s/monitoring/monitoring-stack.yaml`
- `3002` from `apps/zwallet/deploy-zveo-services.sh`
- `4173` from `apps/zwallet/apps/world/README.md`
- `5432` from `apps/zwallet/infra/k8s/postgres.yaml`
- `5601` from `apps/zwallet/dashboard/README.md, apps/zwallet/infra/k8s/base/logging-elk.yaml, apps/zwallet/k8s/logging/elk-stack.yaml`
- `6379` from `apps/zwallet/admin/panel/enterprise/audit_store.py, apps/zwallet/admin/panel/enterprise/main.py, apps/zwallet/api/app/middleware/security_advanced.py, apps/zwallet/api/app/middleware/security_distributed.py, apps/zwallet/api/app/security/adaptive_rate_limiter.py, apps/zwallet/api/app/security/anomaly_detector.py, apps/zwallet/api/app/security/circuit_breaker.py, apps/zwallet/api/app/security/risk_engine.py, apps/zwallet/api/app/security/shadow_ban.py, apps/zwallet/backend/services/gateway/src/app.ts, apps/zwallet/infra/k8s/redis-cluster.yaml, apps/zwallet/infra/k8s/redis.yaml`
- `8080` from `apps/zwallet/backend/.env.example, apps/zwallet/docker-compose.yml, apps/zwallet/infra/docker/docker-compose.devops.yml, apps/zwallet/infra/docker/docker-compose.prod.yml, apps/zwallet/infra/k8s/base/services-apps.yaml, apps/zwallet/infra/k8s/helm/zwallet/templates/deployment.yaml, apps/zwallet/infra/k8s/helm/zwallet/values.yaml, apps/zwallet/k8s/base/gateway-deployment.yaml, apps/zwallet/k8s/base/gateway-service.yaml, apps/zwallet/k8s/deployment.yaml, apps/zwallet/mobile/App.tsx`
- `8090` from `apps/zwallet/deploy-zveo-services.sh, apps/zwallet/docker-compose.yml`
- `8091` from `apps/zwallet/docker-compose.yml`
- `8092` from `apps/zwallet/docker-compose.yml, apps/zwallet/infra/docker/docker-compose.prod.yml, apps/zwallet/infra/k8s/base/services-apps.yaml`
- `8093` from `apps/zwallet/docker-compose.yml, apps/zwallet/infra/docker/docker-compose.prod.yml`
- `8094` from `apps/zwallet/docker-compose.yml`
- `8095` from `apps/zwallet/docker-compose.yml`
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
- `9090` from `apps/zwallet/infra/k8s/base/monitoring.yaml, apps/zwallet/infra/k8s/monitoring.yaml`
- `9092` from `apps/zwallet/api/src/infrastructure/kafka.producer.ts, apps/zwallet/infra/k8s/kafka-cluster.yaml, apps/zwallet/infra/k8s/kafka.yaml`
- `9200` from `apps/zwallet/dashboard/README.md, apps/zwallet/infra/k8s/base/logging-elk.yaml, apps/zwallet/k8s/logging/elk-stack.yaml`

### Domains

- none detected

### Env files

- `apps/zwallet/backend/.env.example` `example` keys=8: `INDEXER_SERVICE_URL, POLICY_SERVICE_URL, PORT, PORTFOLIO_SERVICE_URL, REDIS_URL, SWAP_SERVICE_URL, TX_ORCHESTRATOR_URL, WALLET_SERVICE_URL`

### Findings

- `warn` `local_tooling_or_vendor_dir`: .codex exists; excluded from review and should not be committed
- `info` `expected_port_not_detected`: Expected port 8011 from apps-port-plan not detected in source text
- `info` `expected_hostname_not_detected`: Expected hostname zwallet.zeaz.dev from apps-port-plan not detected in source text

### TODO/FIXME/HACK hits

- `apps/zwallet/AGENTS.md:26` `- No TODO / placeholder / pseudo`
- `apps/zwallet/CODEX_TASKS.md:8` `- [ ] Ban placeholders/TODO stubs in shipped paths.`
- `apps/zwallet/CODEX_TASKS_MASTER_FORM.md:34` `### 0.3 Ban placeholders/TODO stubs`
- `apps/zwallet/admin/panel/main.py:36` `# TODO: integrate Redis delete block key`
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
