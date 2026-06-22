# SYSTEM ARCHITECTURE DIAGRAM

> Visual maps of zLM-CLI's architecture. All diagrams are ASCII so they render in any markdown viewer and version-control cleanly.

## 1. System overview

```
                          ┌───────────────────────────┐
                          │        User Browser        │
                          │  ┌─────────────────────┐   │
                          │  │   zLM-CLI Terminal   │   │
                          │  │  (Next.js page.tsx)  │   │
                          │  └──────────┬──────────┘   │
                          │             │              │
                          │  localStorage: active API  │
                          │  key (X-API-Key header)    │
                          │  + MediaRecorder (ASR)     │
                          │  + <audio> (TTS playback)  │
                          │  + mic button (Voice Cmd)  │
                          └─────────────┼──────────────┘
                                        │
                              HTTPS / relative paths
                                        │
                          ┌─────────────▼──────────────┐
                          │      Caddy Gateway (:81)    │
                          │  • reverse proxy → :3000    │
                          │  • XTransformPort → :N      │
                          └─────────────┬──────────────┘
                                        │
                          ┌─────────────▼──────────────┐
                          │   Next.js 16 Dev Server     │
                          │        (port 3000)          │
                          │                             │
                          │  ┌───────────────────────┐  │
                          │  │    App Router (/)     │  │
                          │  │  ┌─────────────────┐  │  │
                          │  │  │  Terminal UI    │  │  │
                          │  │  │  • prompt input  │  │  │
                          │  │  │  • 24-tab sidebar│  │  │
                          │  │  │  • model select  │  │  │
                          │  │  │    (20+1 models) │  │  │
                          │  │  │  • entries list  │  │  │
                          │  │  │  • mic (Voice    │  │  │
                          │  │  │    Commander)    │  │  │
                          │  │  └─────────────────┘  │  │
                          │  └───────────────────────┘  │
                          │                             │
                          │  ┌───────────────────────┐  │
                          │  │   API Routes (server) │  │
                          │  │  32 routes total:     │  │
                          │  │  cli · agent · plan   │  │
                          │  │  workflows · voice    │  │
                          │  │  image · video        │  │
                          │  │  promptpay · payments │  │
                          │  │  billing · keys       │  │
                          │  │  profile · dashboard  │  │
                          │  │  usage · memory       │  │
                          │  │  permissions · admin  │  │
                          │  │  mcp · search         │  │
                          │  │  research · sandbox   │  │
                          │  │  security · settings  │  │
                          │  │  tasks · conversations│  │
                          │  │  prompt-gen · agent-gen│  │
                          │  │  gdrive · gmail       │  │
                          │  │  outlook · privacy    │  │
                          │  │  route (health)       │  │
                          │  └───────────┬───────────┘  │
                          └──────────────┼──────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
          ┌─────────▼─────────┐ ┌────────▼────────┐ ┌────────▼────────┐
          │  src/lib/glm.ts   │ │ api-keys.ts     │ │   Prisma ORM    │
          │  local-model.ts   │ │ permissions.ts  │ │   (PostgreSQL)      │
          │  (server-only)    │ │ privacy.ts      │ │   10 models:    │
          │                   │ │ (validation)    │ │   User · Post   │
          │  • composePrompt  │ │ • validateKey   │ │   ApiKey        │
          │  • streamComplete │ │ • rateLimit     │ │   PaymentOrder  │
          │  • streamAgent    │ │ • hasPermission │ │   Role          │
          │  • generatePlan   │ │   (13×4 RBAC)   │ │   ApiKeyRole    │
          │  • runWorkflow    │ │ • trackUsage    │ │   UserProfile   │
          │  • parseSseStream │ │ • gdprInventory │ │   UsageRecord   │
          │  • extractMemories│ │ • gdprExport    │ │   Memory        │
          │    (memory-mech)  │ │ • gdprErase     │ │   Invoice       │
          │  • scanSecurity   │ │                 │ │  + .dev/        │
          │    (OWASP rules)  │ │                 │ │    key-config   │
          │  • genPrompt      │ │                 │ │    .json file   │
          │  • genAgent       │ │                 │ │                 │
          │  • ZLM-1.0 local  │ │                 │ │                 │
          │    heuristic      │ │                 │ │                 │
          │  • connectors     │ │                 │ │                 │
          │    (gdrive/gmail/ │ │                 │ │                 │
          │     outlook)      │ │                 │ │                 │
          └────────┬──────────┘ └─────────────────┘ └─────────────────┘
                   │
                   ▼
          ┌────────────────────────────┐
          │     z-ai-web-dev-sdk       │
          │      (zLM 1.0 model)       │
          │                            │
          │  • chat.completions.create │
          │    (SSE stream, 20 models) │
          │  • audio.tts.create        │
          │    (7 voices)              │
          │  • audio.asr.create        │
          │  • images.generate         │
          │  • videos.generate         │
          │  • functions.invoke        │
          │    ("web_search",          │
          │     "page_reader")          │
          └────────────────────────────┘
```

## 2. Request flow — single-turn chat

```
┌──────────┐                ┌──────────┐                ┌──────────┐
│  Client  │                │ /api/cli │                │  zLM 1.0 │
│  (React) │                │ (route)  │                │   (SDK)  │
└────┬─────┘                └────┬─────┘                └────┬─────┘
     │                           │                           │
     │  POST /api/cli            │                           │
     │  { messages, mode,        │                           │
     │    skill, modules,        │                           │
     │    workspace, model }     │                           │
     │  headers: X-API-Key       │                           │
     ├──────────────────────────▶│                           │
     │                           │                           │
     │                           │  validateRequest(key)     │
     │                           │  ├─ requireKey?           │
     │                           │  ├─ key exists & active?  │
     │                           │  ├─ expired?              │
     │                           │  └─ rate limit?           │
     │                           │                           │
     │                           │  composeSystemPrompt()    │
     │                           │  [base]+[mode]+[skill]    │
     │                           │  +[modules]+[workspace]   │
     │                           │                           │
     │                           │  streamCompletion()       │
     │                           │  zai.chat.completions     │
     │                           │  .create({stream:true})   │
     │                           ├──────────────────────────▶│
     │                           │                           │
     │                           │  ◀── SSE byte stream ──── │
     │                           │  data:{...delta...}       │
     │                           │  data:[DONE]              │
     │                           │                           │
     │                           │  parseSseStream()         │
     │                           │  yields content deltas    │
     │                           │                           │
     │  ◀── NDJSON stream ───────│                           │
     │  {"type":"delta",         │                           │
     │   "content":"..."}        │                           │
     │  {"type":"delta",...}     │                           │
     │  {"type":"done"}          │                           │
     │                           │                           │
     │  render incrementally     │                           │
     │  via <Markdown />         │                           │
     │                           │                           │
```

## 3. The Connector pipeline

```
         ┌─────────────────────────────────────────────┐
         │          composeSystemPrompt(opts)           │
         └─────────────────────┬───────────────────────┘
                               │
         ┌─────────────────────▼───────────────────────┐
         │  1. BASE_SYSTEM_PROMPT                       │
         │     "You are zLM-CLI, an elite pair-         │
         │      programmer in a terminal…"              │
         ├─────────────────────────────────────────────┤
         │  2. MODE_PROMPTS[mode]                       │
         │     chat | explain | debug | generate |      │
         │     review | optimize                        │
         ├─────────────────────────────────────────────┤
         │  3. SKILL.systemPrompt  (optional)           │
         │     code-review | refactor | security-audit  │
         │     | performance-audit | add-tests | …      │
         ├─────────────────────────────────────────────┤
         │  4. MODULES[].context  (each active module)  │
         │     filesystem | git | npm | regex | http |  │
         │     json | sql | docker                      │
         ├─────────────────────────────────────────────┤
         │  5. workspaceBlock(workspace)  (optional)    │
         │     "CONNECTED WORKSPACE — the following     │
         │      code is the user's current context…"    │
         ├─────────────────────────────────────────────┤
         │  6. (agent executorPrompt — if agent mode)   │
         └─────────────────────┬───────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   zLM 1.0 (model)   │
                    │   via z-ai SDK      │
                    └─────────────────────┘
```

## 4. Agent execution flow (plan → execute)

```
┌──────────┐          ┌─────────────┐          ┌──────────┐
│  Client  │          │ /api/agent  │          │  zLM 1.0 │
└────┬─────┘          └──────┬──────┘          └────┬─────┘
     │                       │                      │
     │  POST /api/agent      │                      │
     │  { agentType, goal,   │                      │
     │    skill, modules,    │                      │
     │    workspace, model } │                      │
     ├──────────────────────▶│                      │
     │                       │                      │
     │                       │  ─── PLANNER ───     │
     │                       │  completeOnce()      │
     │                       │  "Respond with JSON  │
     │                       │   array of steps"    │
     │                       ├─────────────────────▶│
     │                       │                      │
     │                       │  ◀── JSON steps ──── │
     │                       │  [{title,detail},…]  │
     │                       │                      │
     │  ◀── {"type":"plan",  │                      │
     │       "steps":[…]}    │                      │
     │                       │                      │
     │                       │  ─── EXECUTOR ───    │
     │                       │  for each step:      │
     │                       │    runStream(step)   │
     │  ◀── step_start ──────│                      │
     │  ◀── delta ───────────│  ◀── SSE stream ──── │
     │  ◀── delta ───────────│                      │
     │  ◀── step_end ────────│                      │
     │                       │  (next step…)        │
     │  ◀── step_start ──────│                      │
     │  ◀── delta ───────────│  ◀── SSE stream ──── │
     │  ◀── step_end ────────│                      │
     │  ◀── done ────────────│                      │
     │                       │                      │
```

## 5. API key validation flow

```
                    Incoming request
                          │
                          ▼
              ┌───────────────────────┐
              │  extractApiKey(req)   │
              │  header or ?apiKey=   │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  getKeyConfig()       │
              │  (.dev/key-config.json)│
              └───────────┬───────────┘
                          │
                ┌─────────┴─────────┐
                │ requireKey === false?
                │                   │
           YES  │                   │ NO
                ▼                   ▼
          ┌──────────┐    ┌─────────────────┐
          │  ✓ pass  │    │  key provided?  │
          └──────────┘    └────────┬────────┘
                               │   │
                          NO   │   │ YES
                              ▼   ▼
                    ┌──────────┐  ┌────────────────────┐
                    │ 401      │  │ sha256(key) → DB   │
                    │ "key     │  │ findUnique         │
                    │  required"│ └─────────┬──────────┘
                    └──────────┘            │
                                   ┌────────┴────────┐
                              not  │     found?      │
                                   ▼                 ▼
                          ┌──────────┐      ┌────────────────┐
                          │ 401      │      │  active?       │
                          │ "invalid"│      │  expired?      │
                          └──────────┘      └───────┬────────┘
                                                    │
                                              ✓ active
                                              ✓ not expired
                                                    │
                                                    ▼
                                        ┌────────────────────┐
                                        │ checkRateLimit()   │
                                        │ sliding 1hr window │
                                        └───────┬────────────┘
                                                │
                                       ┌────────┴────────┐
                                  over │                 │ ok
                                       ▼                 ▼
                                ┌──────────┐    ┌──────────────┐
                                │ 429      │    │ ✓ pass       │
                                │ "rate    │    │ usageCount++ │
                                │  limit"  │    │ lastUsed=now │
                                └──────────┘    └──────────────┘
```

## 6. Data model

```
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL (Prisma) — 10 models                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐    ┌─────────────────┐                   │
│  │      User       │    │      Post       │  (legacy examples) │
│  ├─────────────────┤    ├─────────────────┤                   │
│  │ id      String  │    │ id      String  │                   │
│  │ email   String  │    │ title   String  │                   │
│  │ name    String? │    │ content String? │                   │
│  │ createdAt DateTime│  │ published Bool  │                   │
│  │ updatedAt DateTime│  │ authorId String │                   │
│  └─────────────────┘    │ createdAt DateTime│                  │
│                         │ updatedAt DateTime│                  │
│                         └─────────────────┘                   │
│                                                               │
│  ┌─────────────────────────────────────────┐                  │
│  │                  ApiKey                  │                  │
│  ├─────────────────────────────────────────┤                  │
│  │ id              String   @id            │                  │
│  │ keyHash         String   @unique (sha256) │                │
│  │ lastFour        String                  │                  │
│  │ name            String                  │                  │
│  │ rateLimitPerHour Int      @default(60)  │                  │
│  │ usageCount      Int      @default(0)    │                  │
│  │ active          Boolean  @default(true) │                  │
│  │ lastUsedAt      DateTime?               │                  │
│  │ expiresAt       DateTime?               │                  │
│  │ createdAt       DateTime  @default(now) │                  │
│  │ updatedAt       DateTime  @updatedAt    │                  │
│  └─────────────────────────────────────────┘                  │
│  @@index([keyHash])  @@index([active])                        │
│                                                               │
│  ┌─────────────────────────┐  ┌─────────────────────────┐     │
│  │     PaymentOrder        │  │        Role             │     │
│  ├─────────────────────────┤  ├─────────────────────────┤     │
│  │ reference String @unique│  │ name String @unique      │     │
│  │ email, plan, amountCents│  │ permissions String (csv) │     │
│  │ currency, status,       │  │ active Bool              │     │
│  │ provider, providerTxId, │  └─────────────────────────┘     │
│  │ credits, paidAt         │                                  │
│  └─────────────────────────┘  ┌─────────────────────────┐     │
│  @@index([status])            │      ApiKeyRole         │     │
│  @@index([email])             ├─────────────────────────┤     │
│                               │ apiKeyId, roleName      │     │
│                               │ @@unique([apiKeyId,role])│    │
│                               │ @@index([apiKeyId])      │    │
│                               └─────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────┐                  │
│  │              UserProfile                 │                  │
│  ├─────────────────────────────────────────┤                  │
│  │ keyHash String @unique                  │                  │
│  │ email, name                             │                  │
│  │ plan (free/starter/pro/team/enterprise) │                  │
│  │ credits, tokensUsed, requestCount       │                  │
│  │ internetEnabled Bool @default(true)     │                  │
│  │ memoryEnabled Bool @default(true)       │                  │
│  │ lastLoginAt DateTime?                   │                  │
│  └─────────────────────────────────────────┘                  │
│  @@index([keyHash])                                           │
│                                                               │
│  ┌─────────────────────────┐  ┌─────────────────────────┐     │
│  │     UsageRecord         │  │        Memory           │     │
│  ├─────────────────────────┤  ├─────────────────────────┤     │
│  │ keyHash, endpoint       │  │ keyHash, category       │     │
│  │ model, inputTokens      │  │   (fact/preference/      │    │
│  │ outputTokens, durationMs│  │    note/context)         │     │
│  │ ok Bool, createdAt      │  │ content, importance (1-5)│     │
│  └─────────────────────────┘  └─────────────────────────┘     │
│  @@index([keyHash])            @@index([keyHash])              │
│  @@index([endpoint])           @@index([category])             │
│  @@index([createdAt])                                         │
│                                                               │
│  ┌─────────────────────────────────────────┐                  │
│  │              Invoice                     │                  │
│  ├─────────────────────────────────────────┤                  │
│  │ keyHash, number String @unique          │                  │
│  │ type (plan/usage), description          │                  │
│  │ amountCents, currency, status           │                  │
│  │ periodStart, periodEnd, paidAt          │                  │
│  └─────────────────────────────────────────┘                  │
│  @@index([keyHash])  @@index([status])                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            .dev/key-config.json (file)                       │
│  { "requireKey": false }                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           In-memory rate limiter (Map)                       │
│  keyHash → [timestamp, timestamp, …]  (sliding 1hr)         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│             settings.json (global, file)                     │
│  { workspace, safety, editor, visual, performance — 25+ opts }│
└─────────────────────────────────────────────────────────────┘
```

## 7. Component tree

```
<page.tsx>
  └── <Terminal />                          (main shell, all state)
        ├── <Sidebar />                     (desktop: persistent, mobile: drawer)
        │     ├── <TabButton /> × 24        (Home | Skills | Modules | Pipeline | Keys | Media | Admin | MCP | Pay | Search | Research | Sandbox | Perms | Memory | Voice | Flows | PayQR | Gen | Sec | Drive | Gmail | Outlook | Connectors | Privacy | Settings | Tasks | Chats)
        │     ├── <DashboardPanel />        (profile/usage/billing + internet/memory toggles)
        │     ├── <SkillsPanel />           (10 skills, toggle)
        │     ├── <ModulesPanel />          (8 modules, grouped by category)
        │     ├── <PipelinePanel />         (6 stages + agents + workspace)
        │     ├── <KeysPanel />             (API key CRUD + require-key toggle)
        │     ├── <MediaPanel />            (image + video generation)
        │     ├── <AdminPanel />            (admin dashboard + key mgmt + registry breakdown)
        │     ├── <McpPanel />              (allowlisted shell commands + approval)
        │     ├── <PaymentsPanel />         (4 plans + checkout + credits)
        │     ├── <SearchPanel />           (live web search)
        │     ├── <ResearchPanel />         (web reader + summarization)
        │     ├── <SandboxPanel />          (isolated JS execution)
        │     ├── <PermissionsPanel />      (13 keys × 4 roles matrix)
        │     ├── <MemoryPanel />           (per-user memory CRUD)
        │     ├── <VoicePanel />            (TTS playback + ASR push-to-talk + mic commander)
        │     ├── <WorkflowsPanel />        (3 presets + DAG visualization)
        │     ├── <PromptPayPanel />        (Thai QR generator)
        │     ├── <GeneratorsPanel />       (/gen-prompt + /gen-agent UI)
        │     ├── <SecurityPanel />         (OWASP scanner findings + severity filters)
        │     ├── <ConnectorsPanel />       (Drive + Gmail + Outlook hub)
        │     ├── <PrivacyPanel />          (GDPR inventory + JSON export + erase)
        │     ├── <SettingsPanel />         (settings.json editor, 25+ options)
        │     ├── <TasksPanel />            (task manager — priorities/statuses/tags/stats)
        │     └── <ConversationsPanel />    (save/load/delete conversations)
        ├── <header>
        │     ├── panel toggle button
        │     ├── traffic-light dots
        │     ├── title (zLM 1.0 · Coding CLI)
        │     ├── <ModelSelector />         (20 GLM models + ZLM-1.0 Local = 21)
        │     ├── pipeline badges           (skill | mods | pipe | plan | keys)
        │     └── action buttons            (About | Clear)
        ├── <output scroll area>
        │     └── entries.map(entry =>
        │         entry.kind === "agent" ? <AgentView />
        │         : entry.kind === "plan" ? <PlanView />
        │         : entry.kind === "workflow" ? <WorkflowsPanel />
        │         : <EntryView />
        │       )
        │     + <ExamplePrompts />          (when no conversation)
        ├── <jump-to-bottom button>         (conditional)
        └── <footer>
              ├── pipeline chips            (active skill/modules/workspace/agent)
              ├── <textarea />              (prompt input; ASR fills this)
              ├── mic button                (Voice Commander — ASR + voice-commands.ts)
              └── run/stop button
```

## 8. Wire format — NDJSON stream

```
Client ◀──────────────── Server (NDJSON, one JSON per line)

{"type":"delta","content":"```"}
{"type":"delta","content":"typescript"}
{"type":"delta","content":"\n"}
{"type":"delta","content":"const sum = (a: number, b: number) => a + b;"}
{"type":"delta","content":"\n```"}
{"type":"done"}

────────────────────────────────────────────────────────

Agent route adds:
{"type":"plan","steps":[{"title":"Reproduce","detail":"…"},…]}
{"type":"step_start","index":0,"title":"Reproduce"}
{"type":"delta","index":0,"content":"…"}
{"type":"step_end","index":0}
{"type":"step_start","index":1,"title":"Isolate root cause"}
{"type":"delta","index":1,"content":"…"}
{"type":"step_end","index":1}
{"type":"done"}

────────────────────────────────────────────────────────

Workflows route adds (multi-agent DAG):
{"type":"node_start","id":"architect","agent":"architect"}
{"type":"delta","nodeId":"architect","content":"…"}
{"type":"node_end","id":"architect"}
{"type":"node_start","id":"frontend-dev","agent":"architect"}
{"type":"delta","nodeId":"frontend-dev","content":"…"}
{"type":"node_end","id":"frontend-dev"}
{"type":"done"}

────────────────────────────────────────────────────────

Plan route adds:
{"type":"delta","content":"{\"title\":\"…\",…}"}   (raw JSON streaming)
{"type":"plan","plan":{"title":"…","phases":[…],…}} (parsed structure)
{"type":"done"}

Error cases:
{"type":"error","content":"API key required…"}
{"type":"error","content":"Rate limit exceeded (60/hour)…"}
{"type":"error","content":"Forbidden: missing permission 'sandbox.execute'…"}
{"type":"error","content":"Stream error: …"}

────────────────────────────────────────────────────────

Non-streaming routes return JSON bodies:
/api/voice?action=tts  →  { "audio": "data:audio/mpeg;base64,…" }
/api/voice?action=asr  →  { "text": "transcribed prompt" }
/api/promptpay         →  { "qr": "data:image/png;base64,…", "payload": "000201…" }
/api/image             →  { "url": "https://…", "revised": "…" } (or { svg } when ZLM-1.0 Local)
/api/video             →  { "id":"…", "status":"pending" } → poll → { "url":"…" }
/api/security          →  { "ok":true, "filesScanned":N, "findings":[{id,rule,severity,category,description,file,line,snippet,recommendation}], "summary":{"critical":N,"high":N,"medium":N,"low":N,"info":N}, "durationMs":N }
/api/keys · /api/payments · /api/billing · /api/profile
/api/dashboard · /api/usage · /api/memory
/api/permissions · /api/admin · /api/mcp
/api/search · /api/research · /api/sandbox
/api/settings · /api/tasks · /api/conversations
/api/gdrive · /api/gmail · /api/outlook · /api/privacy

Streaming routes (NDJSON) for prompt-gen / agent-gen:
/api/prompt-gen        →  {"type":"delta","content":"…"} … {"type":"done","prompt":{title,systemPrompt,userTemplate,tips[]}}
/api/agent-gen         →  {"type":"delta","content":"…"} … {"type":"done","agent":{name,id,tagline,description,plannerPrompt,executorPrompt,maxSteps}}
```

---

For the prose explanation of these diagrams, see [ARCHITECTURE.md](ARCHITECTURE.md). For the technology list, see [TECH-STACK.md](TECH-STACK.md).
