# ARCHITECTURE

> How zLM-CLI is structured — the layers, data flow, and key design decisions.

## High-level layers

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (client)                      │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────────┐  │
│  │  Terminal    │  │ Sidebar  │  │  Model Selector    │  │
│  │  (page.tsx)  │  │ (24 tabs)│  │  (20 GLM + 1 local)│  │
│  └──────┬───────┘  └──────────┘  └────────────────────┘  │
│         │                                               │
│         │  fetch() + X-API-Key header                   │
│         │  + MediaRecorder (ASR) / <audio> (TTS)        │
│         │  + mic button → Voice Commander                │
└─────────┼───────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js API routes (32 routes, server)       │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌───────────────┐   │
│  │/api/cli │ │/api/agent│ │/api/plan│ │  /api/keys   │   │
│  └────┬────┘ └────┬─────┘ └────┬───┘ └───────┬───────┘   │
│       │           │            │             │            │
│  ┌────┴───────┐ ┌──┴────────┐ ┌┴───────────┐ │           │
│  │/api/voice  │ │/api/      │ │/api/       │ │           │
│  │(tts+asr)   │ │workflows  │ │promptpay   │ │           │
│  └────┬───────┘ └────┬──────┘ └────┬───────┘ │           │
│       │           │            │             │           │
│  ┌────┴───────┐ ┌──┴────────┐ ┌┴──────────┐ │           │
│  │/api/image  │ │/api/      │ │/api/      │ │           │
│  │/api/video  │ │payments   │ │billing    │ │           │
│  └────┬───────┘ │/api/profile│/api/usage  │ │           │
│       │         │/api/dashboard│/api/memory│ │           │
│       │         │/api/permissions│/api/admin│           │
│       │         │/api/mcp   │/api/search │ │           │
│       │         │/api/research│/api/sandbox│           │
│       │         │/api/security│/api/prompt-gen│         │
│       │         │/api/agent-gen└────┬──────┘ │           │
│       │         │/api/settings /api/tasks                │
│       │         │/api/conversations /api/gdrive          │
│       │         │/api/gmail /api/outlook /api/privacy    │
│       │         └────┬──────┘ └────┬──────┘ │           │
│       └─────┬─────┴─────┬──────┘             │           │
│             │           │                    │           │
│             ▼           ▼                    ▼           │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────┐      │
│  │  validateRequest│ │ composePrompt│  │  Prisma  │      │
│  │  (api-keys.ts)  │ │ (glm.ts)     │  │  (PostgreSQL)│      │
│  └────────┬────────┘ └──────┬───────┘  └──────────┘      │
│           │                 │                             │
│           │                 ▼                             │
│           │     ┌───────────────────────┐                 │
│           │     │  z-ai-web-dev-sdk     │                 │
│           │     │  (zLM 1.0 + audio +   │                 │
│           │     │   image + video)      │                 │
│           │     └───────────┬───────────┘                 │
│           │                 │                             │
│           ▼                 ▼                             │
│      NDJSON stream  ←  content deltas                     │
│                                                            │
│  ZLM-1.0 Local path: composePrompt short-circuits to     │
│  the local-model.ts heuristic engine — no SDK calls.      │
│  local-media.ts mirrors this for offline SVG/WAV/ASCII.    │
│                                                            │
│  Memory mechanism: memory-mechanism.ts extracts facts    │
│  via GLM after each turn, scores importance (1-5), and    │
│  a decay pass prunes stale low-value memories. Injected  │
│  into composePrompt when the memory toggle is on.         │
│                                                            │
│  Security scanner: security-scanner.ts walks src/, runs   │
│  20+ OWASP RegExp rules, returns findings grouped by     │
│  severity. Exposed via POST /api/security.                │
│                                                            │
│  Privacy: privacy.ts aggregates all user-scoped tables   │
│  (UserProfile, Memory, UsageRecord, Invoice, tasks,       │
│  conversations) for inventory + JSON export + erase.       │
│                                                            │
│  Connectors: gdrive.ts / gmail.ts / outlook.ts implement  │
│  list/search/read with mock-mode default + OAuth2 ready.  │
└─────────────────────────────────────────────────────────┘
```

## Request lifecycle (single-turn chat)

```
User types prompt + Enter
  │
  ▼
terminal.tsx → submit()
  │  builds messages[] from prior entries
  │  if memory toggle on → injects relevant memories into system context
  │  (memories can be auto-extracted by memory-mechanism.ts after each turn)
  ▼
POST /api/cli  { messages, mode, skill, modules, workspace, model }
  │  headers: { "X-API-Key": <active-key> }
  ▼
/api/cli route
  │  1. validateRequest(extractApiKey(req))
  │     → checks requireKey gate, key validity, rate limit
  │     → 401 / 429 if rejected
  │  2. if model === "ZLM-1.0 Local" → return heuristic output (NDJSON) and skip SDK
  │  3. streamCompletion(messages, { mode, skill, modules, workspace, model })
  ▼
glm.ts → composeSystemPrompt()
  │  [BASE] + [MODE_PROMPTS[mode]] + [skill.systemPrompt] + [modules[].context] + [workspaceBlock]
  │  (+ memories if usage.ts memory toggle is on)
  ▼
runStream(systemPrompt, messages, model)
  │  zai.chat.completions.create({ model, messages, stream: true })
  │  → ReadableStream<Uint8Array> of SSE bytes
  ▼
parseSseStream()  →  yields content deltas (string)
  │
  ▼
route handler frames each delta as NDJSON: {"type":"delta","content":"..."}
  │  fire-and-forget: usage.ts records per-request token counts
  ▼
client reads stream → JSON.parse each line → updateEntry(content += delta)
  │
  ▼
Markdown renders incrementally
  │
  ▼
After turn completes (async):
  memory-mechanism.ts → GLM extracts up to 5 memories
  → db.memory.create (with importance 1-5)
  → decay pruner trims low-importance stale entries
```

## The Connector pipeline

The `composeSystemPrompt()` function in `glm.ts` is the composition engine:

```typescript
function composeSystemPrompt(opts: ComposeOptions): string {
  return [
    BASE_SYSTEM_PROMPT,           // terminal persona + rules
    MODE_PROMPTS[opts.mode],      // chat/explain/debug/generate/review/optimize
    SKILL_MAP.get(opts.skill)?.systemPrompt,    // expert persona layer
    opts.modules.map(m => MODULE_MAP.get(m)?.context).join("\n\n"),  // capability context
    workspaceBlock(opts.workspace),  // connected code snippet
  ].filter(Boolean).join("\n\n");
}
```

Each layer is independent. The client visualizes the active pipeline in the sidebar's Pipeline tab and in the footer summary (`chat · code-review · 2M · ws · agent:bug-hunter`).

## Streaming protocol

All AI routes (`/api/cli`, `/api/agent`, `/api/plan`, `/api/workflows`, `/api/prompt-gen`, `/api/agent-gen`) emit **NDJSON** — one JSON object per line:

| Event | Routes | Meaning |
| --- | --- | --- |
| `{"type":"delta","content":"..."}` | cli, plan, prompt-gen, agent-gen | Incremental text |
| `{"type":"plan","plan":{...}}` | plan | Parsed structured plan |
| `{"type":"step_start","index":N,...}` | agent | Agent step begins |
| `{"type":"delta","index":N,"content":"..."}` | agent | Step content |
| `{"type":"step_end","index":N}` | agent | Step completes |
| `{"type":"node_start","id":"...","agent":"..."}` | workflows | DAG node begins |
| `{"type":"node_end","id":"..."}` | workflows | DAG node completes |
| `{"type":"done"}` | all | Stream finished |
| `{"type":"error","content":"..."}` | all | Error |

Non-streaming routes (`/api/voice`, `/api/image`, `/api/video`, `/api/promptpay`, `/api/payments`, `/api/billing`, `/api/keys`, `/api/profile`, `/api/dashboard`, `/api/usage`, `/api/memory`, `/api/permissions`, `/api/admin`, `/api/mcp`, `/api/search`, `/api/research`, `/api/sandbox`, `/api/security`, `/api/settings`, `/api/tasks`, `/api/conversations`, `/api/gdrive`, `/api/gmail`, `/api/outlook`, `/api/privacy`, `/api/route`) return JSON bodies.

### The SSE parsing detail

The `z-ai-web-dev-sdk`'s `stream: true` returns a raw `ReadableStream<Uint8Array>` of **SSE-encoded bytes** (`data: {...}\n\ndata: [DONE]`), not parsed objects. The `parseSseStream()` helper in `glm.ts`:
1. Reads chunks via `getReader()`
2. Decodes with `TextDecoder` (streaming mode)
3. Buffers by newline
4. For each `data:` line, `JSON.parse`s and extracts `choices[0].delta.content`
5. Stops at `data: [DONE]`

## Client/server boundary

The `z-ai-web-dev-sdk` uses Node's `fs/promises` and crashes the browser bundle if imported client-side. The codebase enforces this boundary:

| File | Safe for | Contents |
| --- | --- | --- |
| `src/lib/glm.ts` | **Server only** | SDK instance, `composeSystemPrompt`, `streamCompletion`, `streamAgent`, `generatePlan`, SSE parser, dispatch to `local-model.ts` |
| `src/lib/local-model.ts` | **Server only** | ZLM-1.0 Local heuristic engine (pattern-matching responses, no API calls) |
| `src/lib/zlm-modes.ts` | Client + server | 6 mode definitions |
| `src/lib/skills.ts` | Client + server | 10 skill definitions + system prompts |
| `src/lib/modules.ts` | Client + server | 8 module definitions + context strings |
| `src/lib/agents.ts` | Client + server | 3 agent definitions + types |
| `src/lib/workflows.ts` | Client + server | 3 workflow presets + DAG types |
| `src/lib/workflow-runner.ts` | **Server only** | DAG execution (topological order, NDJSON events) |
| `src/lib/voice.ts` | **Server only** | `zai.audio.tts.create()` + `zai.audio.asr.create()` wrappers |
| `src/lib/voice-commands.ts` | Client + server | Parses ASR transcript → slash / mode / panel / submit |
| `src/lib/media.ts` | **Server only** | Image/video generation via z.ai SDK |
| `src/lib/local-media.ts` | Client + server | Offline SVG / WAV / ASCII / frame-sequence generator (ZLM-1.0 Local) |
| `src/lib/media-types.ts` | Client + server | Media type definitions |
| `src/lib/promptpay.ts` | Client + server | EMVCo PromptPay QR payload + CRC-16 |
| `src/lib/payments.ts` | Client + server | 4 plans + checkout + credits |
| `src/lib/billing.ts` | **Server only** | Invoices + plan-based limits |
| `src/lib/usage.ts` | **Server only** | Per-request token tracking + toggles |
| `src/lib/memory.ts` | **Server only** | Per-user memory CRUD (fact/preference/note/context) |
| `src/lib/memory-mechanism.ts` | **Server only** | GLM-based auto-extraction, importance scoring, decay pruning |
| `src/lib/permissions.ts` | Client + server | 13 permission keys + 4 role presets |
| `src/lib/sandbox.ts` | **Server only** | Isolated JS execution |
| `src/lib/mcp-commands.ts` | Client + server | Allowlisted shell commands |
| `src/lib/mcp-runner.ts` | **Server only** | MCP runner with approval gate |
| `src/lib/web-tools.ts` | **Server only** | Web search + page reader |
| `src/lib/web-tools-client.ts` | Client + server | Web-tool types |
| `src/lib/security-scanner.ts` | **Server only** | OWASP Top 10 RegExp rules + scan runner |
| `src/lib/prompt-gen.ts` | **Server only** | GLM prompt generator (streams JSON) |
| `src/lib/agent-gen.ts` | **Server only** | GLM agent definition generator (streams JSON) |
| `src/lib/plan.ts` | Client + server | `CodingPlan` schema + `parsePlan()` |
| `src/lib/connector.ts` | Client + server | Pipeline composition metadata |
| `src/lib/settings.ts` | Client + server | `settings.json` schema + helpers (workspace, safety, editor, visual, performance — 25+ options) |
| `src/lib/tasks.ts` | Client + server | Task types + helpers (priorities, statuses, tags) |
| `src/lib/conversations.ts` | Client + server | Conversation types + helpers (save/load/delete) |
| `src/lib/privacy.ts` | **Server only** | GDPR data inventory + JSON export + erase |
| `src/lib/gdrive.ts` | **Server only** | Google Drive connector (OAuth2 ready, mock default) |
| `src/lib/gmail.ts` | **Server only** | Google Gmail connector (OAuth2 ready) |
| `src/lib/outlook.ts` | **Server only** | Outlook/Microsoft Graph connector (OAuth2 ready) |
| `src/lib/models.ts` | Client + server | 20 GLM cloud models + ZLM-1.0 Local (21 total) |
| `src/lib/api-keys.ts` | **Server only** | Key CRUD, validation, rate limiting |
| `src/lib/api-keys-client.ts` | Client + server | Types + localStorage helpers |
| `src/lib/db.ts` | **Server only** | Prisma client singleton |
| `src/lib/utils.ts` | Client + server | `cn()` (clsx + tailwind-merge) |

## API key & rate-limiting layer

```
Request arrives
  │
  ▼
extractApiKey(req)  →  reads X-API-Key header or ?apiKey= query
  │
  ▼
validateRequest(apiKey)
  │
  ├─ getKeyConfig()  →  reads .dev/key-config.json
  │   └─ requireKey === false?  →  ok (pass through)
  │
  ├─ no key?  →  401 "API key required"
  │
  ├─ db.apiKey.findUnique({ keyHash: sha256(key) })
  │   └─ not found?  →  401 "Invalid API key"
  │
  ├─ !active?  →  401 "revoked"
  ├─ expired?  →  401 "expired"
  │
  ├─ checkRateLimit(keyHash, rateLimitPerHour)
  │   └─ in-memory sliding window (1 hour)
  │   └─ exceeded?  →  429 "Rate limit exceeded (N/hour)"
  │
  └─ ok  →  fire-and-forget: usageCount++, lastUsedAt = now
```

## Directory structure

```
src/
├── app/
│   ├── api/                        # 32 routes
│   │   ├── cli/route.ts            # single-turn streaming
│   │   ├── agent/route.ts          # multi-step plan→execute
│   │   ├── plan/route.ts           # structured Coding Plan
│   │   ├── workflows/route.ts      # multi-agent DAG orchestration
│   │   ├── voice/route.ts          # TTS + ASR
│   │   ├── image/route.ts          # text-to-image (or local SVG offline)
│   │   ├── video/route.ts          # text-to-video (polling)
│   │   ├── promptpay/route.ts      # Thai QR payment generator
│   │   ├── payments/route.ts       # plan checkout + credits
│   │   ├── billing/route.ts        # invoices + plan limits
│   │   ├── keys/route.ts           # API key CRUD + config
│   │   ├── profile/route.ts        # user profile + login
│   │   ├── dashboard/route.ts      # overview aggregate
│   │   ├── usage/route.ts          # per-request token tracking + toggles
│   │   ├── memory/route.ts         # per-user memories
│   │   ├── permissions/route.ts    # RBAC keys + role presets
│   │   ├── admin/route.ts          # admin stats + key mgmt
│   │   ├── mcp/route.ts            # allowlisted shell commands
│   │   ├── search/route.ts         # live web search + reader
│   │   ├── research/route.ts       # web pages + GLM summarization
│   │   ├── sandbox/route.ts        # isolated JS execution
│   │   ├── security/route.ts       # OWASP scanner (POST → findings)
│   │   ├── prompt-gen/route.ts     # GLM prompt generator (streaming)
│   │   ├── agent-gen/route.ts      # GLM agent definition generator (streaming)
│   │   ├── settings/route.ts       # settings.json read/write
│   │   ├── tasks/route.ts          # task CRUD + stats
│   │   ├── conversations/route.ts  # save/load/delete conversations
│   │   ├── gdrive/route.ts         # Google Drive connector
│   │   ├── gmail/route.ts          # Google Gmail connector
│   │   ├── outlook/route.ts        # Outlook/Microsoft Graph connector
│   │   ├── privacy/route.ts        # GDPR data inventory + export/erase
│   │   └── route.ts                # health check
│   ├── layout.tsx                  # fonts, metadata, Toaster
│   ├── page.tsx                    # <Terminal /> (only route)
│   └── globals.css                 # glassmorphic design system + animations
├── components/
│   ├── terminal/                   # 29 components
│   │   ├── terminal.tsx            # main shell, state, slash commands
│   │   ├── sidebar.tsx             # 24 tabs
│   │   ├── model-selector.tsx      # 20 GLM models + ZLM-1.0 Local (21)
│   │   ├── plan-view.tsx           # interactive plan roadmap
│   │   ├── agent-view.tsx          # agent plan + streaming steps
│   │   ├── workflows-panel.tsx     # multi-agent DAG visualization
│   │   ├── voice-panel.tsx         # TTS playback + ASR push-to-talk + mic commander
│   │   ├── promptpay-panel.tsx     # Thai QR code generator
│   │   ├── dashboard-panel.tsx     # overview (profile/usage/billing/toggles)
│   │   ├── memory-panel.tsx        # memory CRUD
│   │   ├── permissions-panel.tsx   # RBAC matrix
│   │   ├── admin-panel.tsx         # admin dashboard + key mgmt
│   │   ├── payments-panel.tsx      # plan checkout + credits
│   │   ├── media-panel.tsx         # image + video generation
│   │   ├── search-panel.tsx        # web search UI
│   │   ├── research-panel.tsx      # reader + summarization
│   │   ├── sandbox-panel.tsx       # isolated JS execution
│   │   ├── keys-panel.tsx          # API key management UI
│   │   ├── mcp-panel.tsx           # MCP shell connector
│   │   ├── security-panel.tsx      # OWASP scanner UI (findings + severity filters)
│   │   ├── generators-panel.tsx    # /gen-prompt + /gen-agent UI
│   │   ├── settings-panel.tsx      # settings.json editor (25+ options)
│   │   ├── tasks-panel.tsx         # task manager UI
│   │   ├── conversations-panel.tsx # save/load/delete conversations
│   │   ├── connectors-panel.tsx    # Drive + Gmail + Outlook hub
│   │   ├── privacy-panel.tsx       # GDPR data inventory + export/erase
│   │   ├── code-block.tsx          # Prism syntax highlight + copy
│   │   ├── markdown.tsx            # GFM renderer
│   │   └── icon.tsx                # lucide icon resolver
│   └── ui/                         # 45+ shadcn/ui components
└── lib/                            # 41 files (server-only + client-safe)
    ├── glm.ts                      # SERVER: SDK, composition, streaming, dispatch
    ├── local-model.ts              # SERVER: ZLM-1.0 Local heuristic engine
    ├── zlm-modes.ts                # 6 CLI modes
    ├── skills.ts                   # 10 expert skills
    ├── modules.ts                  # 8 context modules
    ├── agents.ts                   # 3 multi-step agents
    ├── workflows.ts                # 3 workflow presets + DAG types
    ├── workflow-runner.ts          # SERVER: DAG execution
    ├── models.ts                   # 20 GLM models + ZLM-1.0 Local (21)
    ├── voice.ts                    # SERVER: TTS + ASR
    ├── voice-commands.ts           # client-safe ASR transcript parser
    ├── media.ts                    # SERVER: image/video
    ├── local-media.ts              # client-safe offline SVG/WAV/ASCII generator
    ├── media-types.ts              # media type definitions
    ├── promptpay.ts                # PromptPay QR + CRC
    ├── payments.ts                 # plan catalog + credits
    ├── billing.ts                  # SERVER: invoices + limits
    ├── usage.ts                    # SERVER: token tracking + toggles
    ├── memory.ts                   # SERVER: per-user memories
    ├── memory-mechanism.ts         # SERVER: GLM auto-extraction + importance + decay
    ├── permissions.ts              # 13 keys + 4 roles
    ├── sandbox.ts                  # SERVER: isolated JS
    ├── mcp-commands.ts             # allowlist
    ├── mcp-runner.ts               # SERVER: runner + approval
    ├── web-tools.ts                # SERVER: search + reader
    ├── web-tools-client.ts         # client-safe types
    ├── security-scanner.ts         # SERVER: OWASP scanner rules + runner
    ├── prompt-gen.ts               # SERVER: GLM prompt generator
    ├── agent-gen.ts                # SERVER: GLM agent definition generator
    ├── plan.ts                     # CodingPlan schema + parser
    ├── connector.ts                # pipeline composition
    ├── settings.ts                 # settings.json schema (25+ options)
    ├── tasks.ts                    # task types + helpers
    ├── conversations.ts            # conversation types + helpers
    ├── privacy.ts                  # SERVER: GDPR inventory + export/erase
    ├── gdrive.ts                   # SERVER: Google Drive connector
    ├── gmail.ts                    # SERVER: Google Gmail connector
    ├── outlook.ts                  # SERVER: Outlook/Microsoft Graph connector
    ├── api-keys.ts                 # SERVER: key management
    ├── api-keys-client.ts          # client-safe key helpers
    ├── db.ts                       # Prisma client (singleton)
    └── utils.ts                    # cn()
prisma/schema.prisma                # 10 models
Makefile                            # 17 user-facing targets (cross-platform)
scripts/                            # 4 validation scripts
  tech-stack-scaner.sh
  validate-env.sh
  validate-network.sh
  validate-workers.sh
```

## Prisma data model (10 models)

The schema lives in `prisma/schema.prisma`. **10 models**:

1. **User** — base user (id, email, name, timestamps). Legacy.
2. **Post** — example post model (title, content, published, authorId). Legacy.
3. **ApiKey** — `keyHash` (sha256), `lastFour`, `name`, `rateLimitPerHour`, `usageCount`, `active`, `lastUsedAt`, `expiresAt`, timestamps. Indexed by `keyHash` and `active`.
4. **PaymentOrder** — `reference`, `email`, `plan`, `amountCents`, `currency`, `status` (pending/paid/failed/refunded), `provider` (mock/stripe/paypal), `providerTxId`, `credits`, `paidAt`.
5. **Role** — RBAC role (`name` = admin/developer/viewer/guest, `permissions` = comma-separated keys, `active`).
6. **ApiKeyRole** — join table (apiKeyId ↔ roleName, unique on the pair).
7. **UserProfile** — `keyHash` (unique), `email`, `name`, `plan` (free/starter/pro/team/enterprise), `credits`, `tokensUsed`, `requestCount`, `internetEnabled`, `memoryEnabled`, `lastLoginAt`. The first API-key login auto-creates a profile.
8. **UsageRecord** — one row per API request: `keyHash`, `endpoint`, `model`, `inputTokens`, `outputTokens`, `durationMs`, `ok`, `createdAt`. Indexed by `keyHash`, `endpoint`, `createdAt`.
9. **Memory** — per-user memories: `keyHash`, `category` (fact/preference/note/context), `content`, `importance` (1–5), timestamps.
10. **Invoice** — `keyHash`, `number` (unique), `type` (plan/usage), `description`, `amountCents`, `currency`, `status`, `periodStart`, `periodEnd`, `paidAt`.

Plus the file-based config: `.dev/key-config.json` (`{ "requireKey": false }`) and the in-memory rate-limiter (`Map<keyHash, number[]>` sliding 1hr window).

Run `make db-push` (or `bun run db:push`) after schema changes. Import the client via `import { db } from "@/lib/db"`. Primitive types cannot be lists — use a JSON string or a relation for arrays.

## Key design decisions

### Why NDJSON over SSE for the wire?
NDJSON (newline-delimited JSON) is simpler to parse on both ends — no `data:` prefix stripping, no `event:` field handling. The client reads with `ReadableStream` + `TextDecoder`, buffers by `\n`, and `JSON.parse`s each line. It's robust and framework-agnostic.

### Why server-side prompt composition?
The system prompt can be large (base + mode + skill + modules + workspace). Composing it server-side keeps the client payload small and the composition logic centralized. The client sends only the pipeline config (`mode`, `skill`, `modules[]`, `workspace`, `model`); the server assembles the full prompt.

### Why in-memory rate limiting (not Redis)?
zLM-CLI is a single-instance app. An in-memory `Map<keyHash, number[]>` sliding window is sufficient and avoids infra dependencies. The tradeoff: rate limits reset on server restart. For multi-instance deployments, swap `checkRateLimit()` for a Redis-backed implementation.

### Why sha256-hashed keys (not plaintext)?
If the DB leaks, hashed keys are useless to an attacker. The raw key is shown to the user exactly once at creation. The `lastFour` column lets the UI identify keys without storing the full value.

### Why a file-based config for `requireKey` (not a DB row)?
It's a single boolean. A JSON file (`.dev/key-config.json`) avoids a schema migration and a Prisma query on every request. The file is read once per request (could be cached further if needed).

### Why only one user-visible route (`/`)?
The terminal is the product. Everything else is an API. This keeps the UX focused and the routing trivial.

### Why a local model (ZLM-1.0 Local)?
For air-gapped environments, demos, and zero-cost smoke testing. The local model short-circuits `composeSystemPrompt()` to a heuristic engine (no SDK calls). It's not a replacement for zLM 1.0 but a fallback that lets the CLI run when the network or API quota is unavailable.

### Why a DAG runner for workflows (not just a longer agent)?
Agents run a single planner → executor loop for one goal. Workflows chain multiple specialized agents in a dependency graph (e.g. `architect → frontend-dev → backend-dev → tester → reviewer`) so each node can hand off context to the next. The DAG preserves topological order and lets later agents consume the merged output of their predecessors.

### Why is voice implemented with `zai.audio.tts/asr.create()`?
It reuses the same SDK + credentials already in the server — no separate vendor config. TTS streams audio bytes back to `<audio>`; ASR accepts multipart audio from the browser `MediaRecorder`. The 7 voices cover EN + TH + ZH personas.

### Why PromptPay (EMVCo QR)?
A self-contained, no-third-party payment method: the QR payload is built locally (`promptpay.ts`) and rendered to PNG. No gateway roundtrip. Useful for in-app credit top-ups in Thailand.

### Why 13 RBAC permission keys + 4 roles?
Fine-grained enough to express "developer can run agents but not manage keys" or "viewer can use search but not sandbox" — without the combinatorial explosion of per-feature ACLs. The 4 presets (admin / developer / viewer / guest) cover the typical team shapes; custom roles can be added later.

### Why a separate `memory-mechanism.ts` on top of `memory.ts`?
`memory.ts` is the CRUD layer — read/write/delete Memory rows. `memory-mechanism.ts` is the *intelligence* layer: GLM scans the conversation, extracts at most 5 facts worth remembering, scores each one's importance (1–5), and a periodic decay pass prunes low-importance stale rows. Splitting them keeps the CRUD layer free of SDK calls and lets the mechanism evolve (vector recall, semantic deduplication, …) without touching the storage layer.

### Why an OWASP scanner built-in (vs. a CI-only tool)?
Developers ask zLM-CLI to *write* code all day; surfacing vulnerabilities in the same terminal where the code is generated closes the loop without context-switching to a separate SAST tool. The 20+ RegExp rules are intentionally cheap (no AST parsing) so a scan runs in seconds on the whole `src/` tree, and findings are severity-tagged so the same RBAC + plan-limit machinery can later gate "auto-fix this finding" agents.

### Why GLM-backed prompt/agent generators?
Most users won't hand-author a 200-line system prompt or a multi-step agent definition. Letting GLM generate one from a one-line description — and streaming the structured JSON back so the user can edit it before saving — turns "I want an agent that drafts release notes" into a 30-second task instead of a 30-minute prompt-engineering session.

### Why a GDPR privacy module built-in?
With user profiles, memories, usage records, invoices, conversations, and tasks all persisted per-keyHash, GDPR Articles 15 (right of access), 20 (right to portability), and 17 (right to erasure) require the user to see, export, and delete all of it. `privacy.ts` aggregates every user-scoped table into one inventory + JSON export + cascade-erase flow — so a new user-scoped Prisma model can be added without forgetting the privacy obligations.

### Why cloud connectors (Drive/Gmail/Outlook) with mock mode default?
OAuth2 setup is friction. The connectors ship in mock mode so the UI is fully demonstrable end-to-end (list/search/read return representative mock data); each lib has the real OAuth2 flow scaffolded so flipping to live credentials is a config change, not a rewrite.

### Why a Task Manager + Conversation Manager in a coding terminal?
Plans and agents produce artifacts (steps, diffs, code) that the user often wants to track alongside the chat that produced them. `/tasks` gives them a structured todo list (priorities, statuses, tags, stats) and `/save` + `/load` give them Prisma-backed conversation persistence — so a session can be closed and resumed without losing context.

### Why a settings.json file (not DB rows)?
Workspace, safety, editor, visual, and performance options (25+) are global, not per-user. A single JSON file (`settings.json`) is easier to edit by hand, version-control, and ship as part of the repo. Per-user toggles (internet/memory) still live on `UserProfile` because they are auth-scoped.

## Gateway & ports

The sandbox uses Caddy as a gateway (port 81 → 3000). For mini-services on other ports, requests use `?XTransformPort=<port>` query param — the gateway reads it and reverse-proxies to `localhost:<port>`. All client fetch calls use relative paths only; never absolute `http://localhost:<port>` URLs.

---

For the visual diagram, see [SYSTEM-ARCHITECTURE-DIAGRAM.md](SYSTEM-ARCHITECTURE-DIAGRAM.md). For the full technology list, see [TECH-STACK.md](TECH-STACK.md).
