# Master Omega — Advanced Professional AI Chat Fallback: Full Free Provider Integration

**Branch:** `feature/master-omega-advance-professional-chat-fallback`
**App:** `apps/zchat`
**Plan Type:** Full Mode
**Date:** 2026-06-21

---

## Summary

Upgrade `apps/zchat` from a 3-strategy hardcoded fallback to a **Master Omega** multi-provider AI chat system with:

- **9-tier fallback chain** covering every major free/freemium LLM provider
- **Dynamic strategy loader** driven by environment variables
- **Provider health monitoring** with circuit breaker pattern
- **Verbose structured logging** for full observability
- **Chat persistence** via localStorage
- **Rate limiting** per-provider
- **Message history** (multi-turn conversation context)
- **Export** (Markdown / JSON)
- **Unit tests** with Jest (all provider adapters + orchestrator)
- **Mandatory docs checkpoint** on completion

---

## Settings

```
Tests: YES — unit tests required (Jest)
Logging: VERBOSE — DEBUG-level structured logs
Docs: MANDATORY checkpoint at completion
Roadmap: Not linked (no ROADMAP.md found)
```

---

## Provider Fallback Chain (Priority Order)

| Priority | Provider | Model | Free Tier | Notes |
|---|---|---|---|---|
| 1 | **Google Gemini** | `gemini-2.0-flash` | 15 RPM free | Best free quality |
| 2 | **Groq** | `llama-3.3-70b-versatile` | 30 RPM free | Ultra-fast inference |
| 3 | **Cohere** | `command-r` | Trial / free tier | Good for Q&A |
| 4 | **Hugging Face** | `microsoft/DialoGPT-large` | Inference API free | Open weights |
| 5 | **OpenRouter** | `meta-llama/llama-3.2-3b-instruct:free` | Fully free models | Aggregator router |
| 6 | **Mistral AI** | `mistral-small-latest` | Free tier | European LLM |
| 7 | **Together AI** | `meta-llama/Llama-3.2-3B-Instruct-Turbo` | $25 free credit | Fast open models |
| 8 | **Ollama (Local)** | `llama3.2` | 100% free, local | Requires local server |
| 9 | **Smart Offline** | Built-in | Always works | Intelligent fallback |

---

## Architecture

```
User Input
    |
    v
StrategyOrchestrator
  - loadEnabledStrategies()
  - Promise.race + timeout
  - Circuit breaker per provider
  - Verbose DEBUG logging
    |
    +-- GeminiAdapter
    +-- GroqAdapter
    +-- CohereAdapter
    +-- HuggingFaceAdapter
    +-- OpenRouterAdapter
    +-- MistralAdapter
    +-- TogetherAIAdapter
    +-- OllamaAdapter
    +-- SmartOfflineAdapter
```

---

## Phase 0 — Environment

### Task 0.1 — Update .env.example

Add all provider keys and feature flags:
- REACT_APP_GEMINI_ENABLED / REACT_APP_GEMINI_API_KEY / REACT_APP_GEMINI_MODEL
- REACT_APP_GROQ_ENABLED / REACT_APP_GROQ_API_KEY / REACT_APP_GROQ_MODEL
- REACT_APP_COHERE_ENABLED / REACT_APP_COHERE_API_KEY
- REACT_APP_HUGGINGFACE_ENABLED / REACT_APP_HUGGINGFACE_API_KEY
- REACT_APP_OPENROUTER_ENABLED / REACT_APP_OPENROUTER_API_KEY
- REACT_APP_MISTRAL_ENABLED / REACT_APP_MISTRAL_API_KEY
- REACT_APP_TOGETHER_ENABLED / REACT_APP_TOGETHER_API_KEY
- REACT_APP_OLLAMA_ENABLED / REACT_APP_OLLAMA_BASE_URL
- REACT_APP_OFFLINE_ENABLED
- Feature flags: ENABLE_CHAT_HISTORY, ENABLE_EXPORT, ENABLE_RATE_LIMIT
- Circuit breaker: FALLBACK_CIRCUIT_BREAKER_THRESHOLD, FALLBACK_CIRCUIT_BREAKER_COOLDOWN_MS

---

## Phase 1 — Provider Adapters

### Task 1.1 — Logger Utility
Create structured logger: `[OMEGA-CHAT][PROVIDER][LEVEL] message`
- log.debug() — only when REACT_APP_DEBUG=true
- log.info() / log.warn() / log.error() — always

### Task 1.2 — Circuit Breaker
Class CircuitBreaker(name, threshold, cooldownMs):
- isOpen() — returns true if in cooldown
- recordSuccess() — resets failure count
- recordFailure() — increments count, opens when >= threshold
- Half-open reset after cooldown expires

### Task 1.3 — All 9 Provider Adapters
Each: { name, enabled, timeout, call(message, history) }

1. **geminiAdapter** — POST /v1beta/models/{model}:generateContent
2. **groqAdapter** — POST /openai/v1/chat/completions (OpenAI-compatible)
3. **cohereAdapter** — POST /v1/chat (with chat_history format)
4. **huggingFaceAdapter** — POST /models/{model} (inference API)
5. **openRouterAdapter** — POST /api/v1/chat/completions
6. **mistralAdapter** — POST /v1/chat/completions
7. **togetherAdapter** — POST /v1/chat/completions
8. **ollamaAdapter** — POST /api/chat (local, stream:false)
9. **smartOfflineAdapter** — Pattern-matching intelligent offline responses

---

## Phase 2 — Strategy Orchestrator

### Task 2.1 — callAIWithFallback(message, history)
- Filter adapters by .enabled
- For each adapter:
  - Check circuit breaker (skip if open, log WARN)
  - Promise.race(adapter.call(), timeout)
  - On success: recordSuccess(), return { content, source, latencyMs }
  - On failure: recordFailure(), log ERROR, continue
- If all fail: throw Error with provider count

---

## Phase 3 — Feature Modules

### Task 3.1 — Chat Persistence (localStorage)
- persistChat.save(messages) — store last MAX_STORED messages
- persistChat.load() — restore with Date parsing
- persistChat.clear() — wipe storage

### Task 3.2 — Rate Limiter
- createRateLimiter(maxRequests, windowMs)
- .check() — throws if rate exceeded (with retryAfterMs in message)
- .remaining() — returns count left

### Task 3.3 — Export Utility
- exportAsMarkdown(messages) — role labels, source badge, timestamp
- exportAsJSON(messages) — with exportedAt ISO timestamp
- triggerDownload(content, filename, mimeType)

---

## Phase 4 — React Component Rewrite

### Task 4.1 — Rewrite ai-chat-fallback.jsx

New component tree:
```
AIChatFallback
  Sidebar
    NewChatButton
    ProviderStatusPanel (per-provider: enabled/circuit-open/disabled)
    ExportButtons (MD + JSON)
  ChatHeader
  MessageList
    MessageBubble (with ProviderBadge + latency chip)
  LoadingIndicator
  ErrorBanner (with retry)
  InputBar (+ rate limit counter)
```

Key state additions:
- conversationHistory: last N turns for multi-turn context
- providerStatuses: real-time circuit breaker state display
- latency: last response latencyMs
- rateLimitRemaining: display in InputBar

ZEAZ design system: glassmorphism, Outfit font, CSS variables, micro-animations

---

## Phase 5 — Unit Tests

### Task 5.1 — Jest test suites (7 suites)

A. CircuitBreaker (4 tests)
B. Logger utility (3 tests)
C. Provider adapters — mocked fetch (3 tests per adapter x 9 = 27 tests)
D. Orchestrator (5 tests)
E. Chat persistence (3 tests)
F. Rate limiter (3 tests)
G. Export utility (4 tests)

Total: ~49 unit tests

---

## Phase 6 — Documentation (MANDATORY CHECKPOINT)

### Task 6.1 — Update README.md
- Architecture diagram
- Quick-start: which providers to enable first (Gemini + Groq recommended)
- Environment variable reference

### Task 6.2 — Update DEVELOPER_GUIDE.md
- How to add a new provider adapter
- Circuit breaker tuning guide
- Ollama local provider setup

### Task 6.3 — Create PROVIDER_SETUP.md
- Step-by-step sign-up for each free provider
- Links to API key pages
- Rate limits and model recommendations

---

## Phase 7 — Commit

### Task 7.1 — Stage and commit
```bash
git add apps/zchat/
make gpg-finalize COMMIT_MSG="feat(f5): add Master Omega AI chat fallback — 9-provider free tier integration with circuit breaker, persistence, rate limiting, and tests"
```

---

## Implementation Checklist

- [ ] 0.1 Update .env.example (all 9 providers + feature flags)
- [ ] 1.1 Logger utility
- [ ] 1.2 CircuitBreaker class
- [ ] 1.3 Gemini adapter
- [ ] 1.4 Groq adapter
- [ ] 1.5 Cohere adapter
- [ ] 1.6 HuggingFace adapter
- [ ] 1.7 OpenRouter adapter
- [ ] 1.8 Mistral adapter
- [ ] 1.9 Together AI adapter
- [ ] 1.10 Ollama adapter
- [ ] 1.11 SmartOffline adapter
- [ ] 2.1 Orchestrator with circuit breaker
- [ ] 3.1 Chat persistence
- [ ] 3.2 Rate limiter
- [ ] 3.3 Export utility
- [ ] 4.1 Rewrite ai-chat-fallback.jsx (full feature)
- [ ] 5.1 Unit tests (7 suites, ~49 tests)
- [ ] 6.1 Update README.md (MANDATORY)
- [ ] 6.2 Update DEVELOPER_GUIDE.md (MANDATORY)
- [ ] 6.3 Create PROVIDER_SETUP.md (MANDATORY)
- [ ] 7.1 git add + make gpg-finalize

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| API key missing | High | Medium | SmartOffline always fallback |
| CORS errors | Medium | Medium | Document proxy workaround |
| HuggingFace cold start (503) | High | Low | Circuit breaker skips after 3 failures |
| Ollama not running | High | Low | Disabled by default |
| Free tier rate limit hit | Medium | Medium | Client-side rate limiter + WARN log |

---

## Security Notes

- API keys NEVER logged (only key presence: true/false)
- No eval, no dynamic imports of secrets
- .env.local is git-ignored
- .env.example contains zero real values
