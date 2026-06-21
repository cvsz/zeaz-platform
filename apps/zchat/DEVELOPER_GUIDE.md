# Developer Guide

This app is intentionally small and modular. The main chat experience lives in `ai-chat-fallback.jsx`, while the reusable behavior is split into focused modules under `src/`.

## Architecture

- `ai-chat-fallback.jsx` renders the UI and coordinates state
- `src/main.jsx` mounts the component into `index.html`
- `src/orchestrator.js` runs the fallback chain
- `src/providers.js` contains the provider adapters
- `src/circuitBreaker.js` tracks provider health
- `src/logger.js` emits structured logs
- `src/chatPersistence.js` stores messages in `localStorage`
- `src/rateLimiter.js` enforces client-side request limits
- `src/exportChat.js` exports Markdown and JSON

## Env Handling

The app reads `REACT_APP_*` variables at runtime in both tests and the browser bundle. The Vite config maps those environment variables into `process.env.*` at build time so the same source code works in both contexts.

## Logging

Use the structured logger from `src/logger.js` instead of `console.*` directly.

```js
import { log } from './src/logger';

log.info('UI', 'Message sent', { chars: text.length });
log.warn('ORCHESTRATOR', 'Provider skipped', { provider: name });
log.error('GROQ', 'Provider failed', err);
```

Logging rules:

- keep log payloads small and structured
- never print API keys or secrets
- prefer `debug` for verbose tracing and `info` for normal lifecycle events

## Adding a Provider

1. Add a new adapter object to `src/providers.js`
2. Give it a `name`, `enabled` getter, `timeout` getter, and async `call(message, history)` method
3. Add it to `ALL_ADAPTERS` in the desired fallback order
4. Document the new env variables in `.env.example` and `PROVIDER_SETUP.md`

## Testing Notes

The unit test suite is in `ai-chat-fallback.test.js`. It covers:

- circuit breaker behavior
- logger behavior
- provider adapters
- orchestrator fallback
- persistence
- rate limiting
- export formatting

## Build Notes

The app is bundled with Vite. If you add new runtime env keys, make sure they are included in `.env.example` and referenced through the existing `process.env.REACT_APP_*` pattern so the build-time mapping continues to work.
