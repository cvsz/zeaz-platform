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

1. `Qwen/Qwen3-0.6B`
2. `TinyLlama/TinyLlama-1.1B-Chat-v1.0`
3. `Qwen/Qwen2.5-1.5B-Instruct`
4. `microsoft/phi-2`
5. `openai-community/gpt2`
6. `Qwen/Qwen3-4B`
7. `mistralai/Mistral-7B-Instruct-v0.3`
8. `Qwen/Qwen3-8B`

## Getting Started

```bash
npm install
npm run dev
```

Open the Vite dev server URL shown in the terminal.

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

## Troubleshooting

- If the app shows offline responses only, check that at least one provider is enabled in `.env.local`.
- If exports or persistence do not work in the browser, ensure localStorage is available and not blocked.
- If a provider fails repeatedly, its circuit breaker will pause it for the configured cooldown window.
