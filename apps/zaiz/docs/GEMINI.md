# GEMINI.md

> Guidance for Google Gemini when working in this repository.

Gemini, this file is your quick-reference for the zLM-CLI project. For the full ruleset, read [`AGENTS.md`](AGENTS.md) first — this file adds Gemini-specific notes on top.

## What this project is

zLM-CLI is a browser-based coding terminal powered by z.ai's **zLM 1.0** model. It is a Next.js 16 (App Router) + TypeScript app. The only route users see is `/`. **32 API routes** do the work server-side: `admin, agent, agent-gen, billing, cli, conversations, dashboard, gdrive, gmail, image, keys, mcp, memory, outlook, payments, permissions, plan, privacy, profile, promptpay, prompt-gen, research, route, sandbox, search, security, settings, tasks, usage, video, voice, workflows`.

The full v1.0 feature inventory: **6 CLI modes + 10 Skills + 8 Modules + 3 Agents + Connector pipeline + Coding Plans + Agent Workflows (3 presets) + streamed NDJSON + 20 GLM cloud models + ZLM-1.0 Local (21 total)**, **TTS (7 voices) + ASR + Voice Commander**, **Image + Video + Local Media (SVG/WAV/ASCII, offline)**, **PromptPay + Payment Gateway (4 plans: Starter $0 / Pro $19 / Team $49 / Enterprise $199) + Billing + API Keys (sha256) + Token tracking**, **User Profiles + RBAC (13 keys × 4 roles) + Dashboard + Internet/Memory toggles + Require-key gate**, **Memory CRUD + Auto-extraction + Context injection + Decay pruning**, **Web Search + Page Reader + Research Tools + Sandbox + MCP CLI Connector + Security Scanner (OWASP Top 10, 20+ rules)**, **Prompts Generator + Agents Generator**, **Google Drive + Gmail + Outlook connectors**, **GDPR Data & Privacy (inventory + export + erase)**, **Task Manager + Conversation Manager + Settings + Admin Control Panel**, **Cross-platform Makefile (17 targets) + 4 validation scripts**, **24 sidebar tabs + 43+ slash commands + Glassmorphic UI**.

## Your operating constraints

1. **You are coding, not just chatting.** When asked to add a feature, write the actual files. Do not stop at a plan unless explicitly told to.
2. **Server/client boundary is critical.** `z-ai-web-dev-sdk` is Node-only (uses `fs/promises`). Never import these server-only libs from a client component: `glm.ts`, `local-model.ts`, `voice.ts`, `media.ts`, `workflow-runner.ts`, `billing.ts`, `usage.ts`, `memory.ts`, `memory-mechanism.ts`, `sandbox.ts`, `mcp-runner.ts`, `web-tools.ts`, `security-scanner.ts`, `prompt-gen.ts`, `agent-gen.ts`, `api-keys.ts`, `privacy.ts`, `gdrive.ts`, `gmail.ts`, `outlook.ts`, `db.ts`. The client-safe registries are `zlm-modes.ts`, `skills.ts`, `modules.ts`, `agents.ts`, `workflows.ts`, `permissions.ts`, `promptpay.ts`, `payments.ts`, `mcp-commands.ts`, `web-tools-client.ts`, `plan.ts`, `connector.ts`, `api-keys-client.ts`, `voice-commands.ts`, `local-media.ts`, `media-types.ts`, `models.ts`, `settings.ts`, `tasks.ts`, `conversations.ts`, `utils.ts`.
3. **Use the Makefile.** 17 user-facing targets: `make install`, `make start`, `make stop`, `make restart`, `make status`, `make logs`, `make lint`, `make clean`, `make db-push`, `make db-generate`, `make db-reset`, `make check-os`, `make check-deps`, `make build`, `make package`, `make security` (OWASP scanner), `make test` (lint + type-check). Plus 4 validation scripts under `scripts/`: `tech-stack-scaner.sh`, `validate-env.sh`, `validate-network.sh`, `validate-workers.sh`. Do not run `bun run build`.
4. **Read `dev.log` after changes.** Tail it to catch runtime errors. The server logs there.
5. **Only `/` is user-visible.** New features that need UI go into `src/app/page.tsx` or components it renders. API logic goes in `src/app/api/`.
6. **RBAC before rate-limit.** If a route gates access, call `hasPermission(key, permission)` from `permissions.ts` before `validateRequest()`. Use one of the 13 permission keys; do not invent new ones without adding them to the registry.
7. **PromptPay stays local.** Do not introduce a third-party payment SDK into the PromptPay path. The QR payload + CRC-16 must stay in `src/lib/promptpay.ts`.
8. **ZLM-1.0 Local stays offline.** Do not wire it to any network call. The heuristic engine in `glm.ts` runs without the SDK. This includes `local-media.ts` — its SVG/WAV/ASCII generators must never touch the network.
9. **Do not weaken the security scanner.** Rules in `security-scanner.ts` are RegExp-based and run on the whole `src/` tree. Do not skip rules or hide severity tags; findings must surface to the user.
10. **CLAUDE.md exists.** If a task mentions Claude-specific instructions, refer to [`CLAUDE.md`](CLAUDE.md) — it's the sibling of this file with Claude's own constraints.

## Gemini-specific gotchas

- **Long context discipline.** You may have a large context window, but this repo is not large. Read the specific file you're editing with the Read tool rather than dumping everything into context. Prefer targeted `Grep` / `Glob` over broad reads.
- **Function calling.** You have tools (Read, Write, Edit, Bash, Grep, Glob, etc.). Use them — do not paste code blocks for the human to copy. Write files directly with the Write/Edit tools.
- **When unsure about a library API, read the source.** The `z-ai-web-dev-sdk` package is in `node_modules/z-ai-web-dev-sdk/`. The streaming behavior is non-obvious (returns SSE bytes, not parsed objects) — see `parseSseStream()` in `src/lib/glm.ts`.
- **Verify, don't assume.** After writing code: run `make lint`, read the tail of `dev.log`, and confirm the page renders. "It compiles" is not done.

## How streaming works here

All AI routes emit **NDJSON** (one JSON object per line):

```
{"type":"delta","content":"..."}
{"type":"node_start","id":"...","agent":"..."}  # workflows only
{"type":"node_end","id":"..."}                  # workflows only
{"type":"done"}
{"type":"error","content":"..."}
```

The backend `streamCompletion` / `streamAgent` / `generatePlan` / `runWorkflow` generators in `glm.ts` and `workflow-runner.ts` yield deltas; the route handler frames them as NDJSON lines. The client (`terminal.tsx`) reads with `ReadableStream` + `TextDecoder`, buffers by `\n`, and `JSON.parse`s each line.

The SDK's `stream: true` returns a `ReadableStream<Uint8Array>` of SSE bytes (`data: {...}\n\ndata: [DONE]`). The `parseSseStream()` helper in `glm.ts` handles the framing. **Do not assume the SDK yields parsed chunk objects.**

The Voice routes (`/api/voice`) do NOT use SSE — `zai.audio.tts.create()` returns audio bytes (played via `<audio>` on the client) and `zai.audio.asr.create()` returns transcribed text. 7 voices are supported: tongtong, chuichui, xiaochen, jam, kazi, douji, luodo.

## Where things live

| Concern | File |
| --- | --- |
| Server-only SDK + prompt composition | `src/lib/glm.ts` |
| Client-safe mode/skill/module/agent/workflow/plan registries | `src/lib/{zlm-modes,skills,modules,agents,workflows,plan,connector}.ts` |
| Workflow DAG runner (server) | `src/lib/workflow-runner.ts` |
| Voice TTS/ASR (server) | `src/lib/voice.ts` |
| Voice Commander transcript parser (client-safe) | `src/lib/voice-commands.ts` |
| Image/video generation (server) | `src/lib/media.ts` |
| Offline local media — SVG/WAV/ASCII/frames (client-safe) | `src/lib/local-media.ts` |
| PromptPay QR (client-safe) | `src/lib/promptpay.ts` |
| Plans + checkout + credits (client-safe) | `src/lib/payments.ts` |
| Invoices + plan limits (server) | `src/lib/billing.ts` |
| Per-request token tracking + toggles (server) | `src/lib/usage.ts` |
| Per-user memory CRUD (server) | `src/lib/memory.ts` |
| GLM auto-extraction + importance + decay (server) | `src/lib/memory-mechanism.ts` |
| 13 RBAC keys + 4 role presets (client-safe) | `src/lib/permissions.ts` |
| Isolated JS execution (server) | `src/lib/sandbox.ts` |
| MCP allowlist (client-safe) + runner (server) | `src/lib/{mcp-commands,mcp-runner}.ts` |
| Web search + reader (server) + types (client-safe) | `src/lib/{web-tools,web-tools-client}.ts` |
| OWASP security scanner (server) | `src/lib/security-scanner.ts` |
| GLM prompt generator (server) | `src/lib/prompt-gen.ts` |
| GLM agent definition generator (server) | `src/lib/agent-gen.ts` |
| API key CRUD (server) + localStorage helpers (client-safe) | `src/lib/{api-keys,api-keys-client}.ts` |
| Model selector registry | `src/lib/models.ts` (**20 GLM cloud models + ZLM-1.0 Local** = 21 total) |
| API routes | `src/app/api/{cli,agent,plan,workflows,voice,image,video,promptpay,payments,billing,keys,profile,dashboard,usage,memory,permissions,admin,mcp,search,research,sandbox,security,prompt-gen,agent-gen,settings,tasks,conversations,gdrive,gmail,outlook,privacy,route}/route.ts` — **32 routes** |
| Main terminal UI | `src/components/terminal/terminal.tsx` |
| Sidebar (**24 tabs**) | `src/components/terminal/sidebar.tsx` |
| Plan roadmap renderer | `src/components/terminal/plan-view.tsx` |
| Agent renderer | `src/components/terminal/agent-view.tsx` |
| Workflows DAG visualization | `src/components/terminal/workflows-panel.tsx` |
| Voice panel (TTS + ASR push-to-talk + mic commander) | `src/components/terminal/voice-panel.tsx` |
| PromptPay QR generator | `src/components/terminal/promptpay-panel.tsx` |
| Dashboard overview | `src/components/terminal/dashboard-panel.tsx` |
| Memory CRUD | `src/components/terminal/memory-panel.tsx` |
| RBAC matrix | `src/components/terminal/permissions-panel.tsx` |
| Admin panel | `src/components/terminal/admin-panel.tsx` |
| Payments panel | `src/components/terminal/payments-panel.tsx` |
| Media (image + video) | `src/components/terminal/media-panel.tsx` |
| Search / Research panels | `src/components/terminal/{search,research}-panel.tsx` |
| Sandbox panel | `src/components/terminal/sandbox-panel.tsx` |
| Keys panel | `src/components/terminal/keys-panel.tsx` |
| MCP panel | `src/components/terminal/mcp-panel.tsx` |
| Security scanner panel | `src/components/terminal/security-panel.tsx` |
| Generators panel (/gen-prompt + /gen-agent) | `src/components/terminal/generators-panel.tsx` |
| Settings panel (`/settings`) | `src/components/terminal/settings-panel.tsx` |
| Tasks panel (`/tasks`) | `src/components/terminal/tasks-panel.tsx` |
| Conversations panel (`/save`, `/load`) | `src/components/terminal/conversations-panel.tsx` |
| Privacy panel (`/privacy`) | `src/components/terminal/privacy-panel.tsx` |
| Connectors hub (`/connectors`) | `src/components/terminal/connectors-panel.tsx` |
| Settings + tasks + conversations + privacy libs | `src/lib/{settings,tasks,conversations,privacy}.ts` |
| Google Drive / Gmail / Outlook connectors | `src/lib/{gdrive,gmail,outlook}.ts` |
| Markdown + code blocks | `src/components/terminal/{markdown,code-block}.tsx` |

## Style

- TypeScript throughout, strict.
- `shadcn/ui` components in `src/components/ui/` — prefer these over custom builds.
- Emerald color palette on `#07090a` background. No indigo/blue as primary.
- Sticky footer (the input bar). Mobile-first responsive.
- `cn()` from `src/lib/utils.ts` for class merging.

## Your verification loop

1. Write the code.
2. `make lint` → zero errors.
3. `make status` → server running.
4. Tail `dev.log` → no runtime errors.
5. If interactivity matters, verify it actually works (don't just check the build).

## If you get stuck

- SDK streaming returns empty? → You're probably reading `chunk.choices[0].delta.content` on raw bytes instead of parsing SSE. Use `parseSseStream()`.
- Client bundle crash with `Module not found: fs/promises`? → You imported a server-only module from client code. Split types into a client-safe file.
- `make start` says "failed to start"? → Read `dev.log` tail; usually a syntax/runtime error in a route or component.
- Prisma "table does not exist"? → Run `make db-push`.
- Voice route returns 500? → Confirm the voice id is one of `tongtong, chuichui, xiaochen, jam, kazi, douji, luodo`. Check that the audio bytes are being forwarded as-is (do not JSON-encode binary).
- Workflow DAG not progressing past a node? → Check for a cycle in `workflows.ts` presets; the runner walks in topological order and will hang on a cyclic graph.
- PromptPay QR not scanning? → Verify the CRC-16 Tag 63 was computed over the full payload *before* the tag itself.
- RBAC rejecting a route that should be allowed? → Check the role preset in `permissions.ts`; the route's permission key must be in the role's allowed set.
- ZLM-1.0 Local making network calls? → It must not. The heuristic branch in `glm.ts` is entered *before* any SDK call. Same applies to `local-media.ts` (offline SVG/WAV/ASCII) — never wire it to the SDK.
- Security scanner returning 0 findings on obviously-vulnerable code? → Check that the rule's RegExp actually matches (test in isolation); some rules require word-boundary or specific context. Severity must be one of critical/high/medium/low/info.
- Voice Commander not routing a spoken phrase? → Check `voice-commands.ts` — the regex patterns map phrases to `slash` / `mode` / `panel` / `submit` actions. Add a pattern if a new phrase shape is needed.

## Be honest

If you cannot verify something, say so. Do not claim success based on a clean build alone. The standard of done is: lints clean, server up, page renders, core interactions work.
