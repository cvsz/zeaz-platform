# Plan: AI Chat Fallback with Free Providers Support

Implement a full-featured AI Chat client in `apps/zchat/` with an intelligent fallback chain utilizing free tiers or API keys of multiple popular AI providers.

## Project Context
- **Application Directory**: `apps/zchat/`
- **Primary Component**: `apps/zchat/ai-chat-fallback.jsx`
- **HTML Client**: `apps/zchat/index.html`

## Settings
- **Tests**: Yes (write unit tests for the fallback orchestrator)
- **Logging**: Verbose (detailed DEBUG logs for connection attempts and fallback triggers)
- **Docs**: Yes (mandatory docs checkpoint)
- **Roadmap Milestone**: None

---

## Tasks

### Phase 1: Environment & Config Setups
- [ ] 1. Update `apps/zchat/.env.example` with API key placeholders for Gemini, Groq, Hugging Face, and Cohere.
- [ ] 2. Update config loading logic in `apps/zchat/ai-chat-fallback.jsx` to load and validate variables from process.env.

### Phase 2: AI Provider Integrations
- [ ] 3. Implement Google Gemini integration (`callGeminiAPI`) using the generativelanguage.googleapis.com endpoint.
- [ ] 4. Implement Groq integration (`callGroqAPI`) using the api.groq.com OpenAI-compatible endpoint.
- [ ] 5. Implement Hugging Face integration (`callHuggingFaceAPI`) using the api-inference.huggingface.co endpoint.
- [ ] 6. Implement Cohere integration (`callCohereAPI`) using the api.cohere.com chat endpoint.
- [ ] 7. Refactor the offline responder (`getOfflineResponse`) with enhanced local mock patterns.

### Phase 3: Fallback Orchestrator Integration
- [ ] 8. Update the strategy chain array in `callAIWithFallback` to sequence: Claude Sonnet -> Gemini -> Groq -> Hugging Face -> Cohere -> Offline Mode.
- [ ] 9. Apply dynamic timeouts for each strategy (Claude: 25s, Gemini: 15s, Groq: 15s, Hugging Face: 15s, Cohere: 15s, Offline: 100ms) and log each fallback event.

### Phase 4: UI & Styling Improvements
- [ ] 10. Update UI message elements to display the active provider name dynamically (e.g. "via Gemini", "via Groq").
- [ ] 11. Add a fallback execution progress indicator UI showing which provider is currently being tried.
- [ ] 12. Sync features and styles between the React component `ai-chat-fallback.jsx` and standalone HTML client `index.html`.

### Phase 5: Verification & Quality Gates
- [ ] 13. Implement unit tests in `apps/zchat/` to verify fallback state transitions and timeouts.
- [ ] 14. Verify offline fallback in browser using devtools network throttling.
