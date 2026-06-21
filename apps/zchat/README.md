# ZeaZ Omega Chat

ZeaZ Omega Chat is a React/Vite chat app with a 9-provider free fallback chain. It tries higher-priority providers first and falls back to the next one automatically when a provider fails or times out.

## Features

- 9-provider fallback chain
- Per-provider circuit breakers
- Client-side rate limiting
- Local chat persistence
- Markdown and JSON export
- Provider status panel and latency badges
- Smart offline responses when every API provider is unavailable

## Provider Order

1. Google Gemini
2. Groq
3. Cohere
4. Hugging Face
5. OpenRouter
6. Mistral AI
7. Together AI
8. Ollama
9. Smart Offline

### Hugging Face Free Model Chain

The Hugging Face provider now cycles through a curated set of free/open text-generation models before giving up:

1. `Qwen/Qwen2.5-0.5B-Instruct`
2. `Qwen/Qwen3-0.6B`
3. `TinyLlama/TinyLlama-1.1B-Chat-v1.0`
4. `microsoft/phi-2`
5. `openai-community/gpt2`
6. `Qwen/Qwen2.5-1.5B-Instruct`
7. `Qwen/Qwen3-1.7B`
8. `Qwen/Qwen3-4B`
9. `Qwen/Qwen3-4B-Instruct-2507`
10. `Qwen/Qwen2.5-7B-Instruct`
11. `mistralai/Mistral-7B-Instruct-v0.3`
12. `Qwen/Qwen3-8B`
13. `openai/gpt-oss-20b`
14. `deepseek-ai/DeepSeek-R1`

You can also reorder this list from the in-app `Settings` modal. The browser-saved order overrides the env defaults.

## Getting Started

```bash
npm install
npm run dev
```

Open the Vite dev server URL shown in the terminal.

## Make Targets

From the repository root, you can also use the shared build automation:

```bash
make zchat-install
make zchat-dev
make zchat-test
make zchat-build
make zchat-preview
make zchat-validate
```

## Node API for User Keys

This app now includes a small Node API that can issue user keys and verify them later.
The Settings modal also includes a UI for generating and copying a key from the browser app.
It also includes a third-party application flow so external apps can apply for access before you approve them.

Start the API server:

```bash
npm run api
```

Create a key:

```bash
curl -X POST http://127.0.0.1:8787/api/user-keys \
  -H 'Content-Type: application/json' \
  -H 'X-ZChat-Admin-Token: example-admin-token' \
  -d '{"userId":"user-123","label":"CLI access","expiresInDays":30}'
```

Verify a key:

```bash
curl -X POST http://127.0.0.1:8787/api/user-keys/verify \
  -H 'Content-Type: application/json' \
  -d '{"key":"zchat_..."}'
```

The API stores only a hash of the key material. The raw key is returned once at creation time and is never written to disk.

To keep the browser UI usable in local development, the server defaults to unprotected create/list access when `CHAT_API_ADMIN_TOKEN` is empty. If you set an admin token, keep the browser UI pointed at a trusted local server or call the API from a backend worker instead.

### Authorization endpoint

Other services can validate a user key with:

```bash
curl -X POST http://127.0.0.1:8787/api/auth/authorize \
  -H 'Content-Type: application/json' \
  -H 'X-ZChat-Api-Key: zchat_...' \
  -d '{"requiredScopes":["api:access","chat:write"]}'
```

The response returns the authenticated subject and granted scopes. Use this helper from other APIs to enforce permissions before handling the request.

### Third-party application flow

Third-party apps can apply with:

```bash
curl -X POST http://127.0.0.1:8787/api/third-party/apply \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"Acme Analytics",
    "contactEmail":"ops@example.com",
    "website":"https://example.com",
    "callbackUrl":"https://example.com/oauth/callback",
    "requestedScopes":["api:access","chat:read"]
  }'
```

Approve a pending application to generate OAuth client credentials:

```bash
curl -X POST http://127.0.0.1:8787/api/third-party/applications/<application-id>/approve \
  -H 'X-ZChat-Admin-Token: example-admin-token'
```

The approval response includes the generated OAuth client credentials once. The application record remains stored with its approval status and linked client id.

For OAuth-style client credentials, the approval response also includes `client_id` and `client_secret`.
Exchange them for a bearer token with:

```bash
curl -X POST http://127.0.0.1:8787/api/oauth/token \
  -H 'Content-Type: application/json' \
  -d '{
    "grant_type":"client_credentials",
    "client_id":"client_...",
    "client_secret":"..."
  }'
```

Use the returned `access_token` as `Authorization: Bearer <token>` for downstream API calls.

## Production Build

```bash
npm run build
```

## Configuration

Copy `.env.example` to `.env.local` and fill in the providers you want to enable.

```bash
cp .env.example .env.local
```

Key runtime flags:

- `REACT_APP_ENABLE_CHAT_HISTORY`
- `REACT_APP_ENABLE_RATE_LIMIT`
- `REACT_APP_SHOW_PROVIDER_BADGE`
- `REACT_APP_SHOW_LATENCY`
- `REACT_APP_ENABLE_EXPORT`
- `REACT_APP_FALLBACK_CIRCUIT_BREAKER_THRESHOLD`
- `REACT_APP_FALLBACK_CIRCUIT_BREAKER_COOLDOWN_MS`
- `REACT_APP_HUGGINGFACE_MODEL`
- `REACT_APP_HUGGINGFACE_MODEL_CANDIDATES`
- `REACT_APP_USER_KEY_API_BASE_URL`
- `REACT_APP_HUGGINGFACE_MODEL_REFRESH_INTERVAL_MS`

Provider keys are optional. Enable only the providers you want to use.

## Project Files

- `ai-chat-fallback.jsx` - Main chat component
- `src/orchestrator.js` - Fallback orchestration
- `src/providers.js` - Provider adapters
- `src/logger.js` - Structured logging
- `src/circuitBreaker.js` - Provider circuit breaker
- `src/chatPersistence.js` - localStorage persistence
- `src/rateLimiter.js` - Sliding window limiter
- `src/exportChat.js` - Markdown and JSON export
- `src/main.jsx` - React entry point
- `server/user-key-store.js` - Hash-based user key persistence
- `server/user-key-api.js` - Node HTTP API for issuing and verifying keys
- `server/index.js` - Standalone server entrypoint
- `API-SPEC.md` - HTTP API contract for the Node auth and third-party flows
- `CHANGELOG.md` - Release notes for app and API changes
- `.github/PULL_REQUEST_TEMPLATE.md` - Pull request checklist for staged zchat changes
- `.github/ISSUE_TEMPLATE/bug_report.md` - Bug report template
- `.github/ISSUE_TEMPLATE/feature_request.md` - Feature request template
- `.github/SECURITY.md` - Local security reporting guidance

## Troubleshooting

- If the app shows offline responses only, check that at least one provider is enabled in `.env.local`.
- If exports or persistence do not work in the browser, ensure localStorage is available and not blocked.
- If a provider fails repeatedly, its circuit breaker will pause it for the configured cooldown window.
