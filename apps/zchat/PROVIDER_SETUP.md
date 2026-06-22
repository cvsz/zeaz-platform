# Provider Setup

This guide lists the free or free-tier providers used by ZeaZ Omega Chat and the minimum configuration needed to enable each one.

## Quick Start

1. Copy `.env.example` to `.env.local`.
2. Enable the providers you want to use.
3. Paste the matching API keys.
4. Restart the dev server.

```bash
cp .env.example .env.local
npm run dev
```

## Providers

| Provider | Signup Link | Env Vars |
| --- | --- | --- |
| Google Gemini | https://aistudio.google.com/app/apikey | `REACT_APP_GEMINI_ENABLED`, `REACT_APP_GEMINI_API_KEY`, `REACT_APP_GEMINI_MODEL`, `REACT_APP_GEMINI_TIMEOUT` |
| Groq | https://console.groq.com/keys | `REACT_APP_GROQ_ENABLED`, `REACT_APP_GROQ_API_KEY`, `REACT_APP_GROQ_MODEL`, `REACT_APP_GROQ_TIMEOUT` |
| Cohere | https://dashboard.cohere.com/api-keys | `REACT_APP_COHERE_ENABLED`, `REACT_APP_COHERE_API_KEY`, `REACT_APP_COHERE_MODEL`, `REACT_APP_COHERE_TIMEOUT` |
| Hugging Face | https://huggingface.co/settings/tokens | `REACT_APP_HUGGINGFACE_ENABLED`, `REACT_APP_HUGGINGFACE_API_KEY`, `REACT_APP_HUGGINGFACE_MODEL`, `REACT_APP_HUGGINGFACE_MODEL_CANDIDATES`, `REACT_APP_HUGGINGFACE_TIMEOUT` |
| OpenRouter | https://openrouter.ai/keys | `REACT_APP_OPENROUTER_ENABLED`, `REACT_APP_OPENROUTER_API_KEY`, `REACT_APP_OPENROUTER_MODEL`, `REACT_APP_OPENROUTER_TIMEOUT` |
| Mistral AI | https://console.mistral.ai/api-keys | `REACT_APP_MISTRAL_ENABLED`, `REACT_APP_MISTRAL_API_KEY`, `REACT_APP_MISTRAL_MODEL`, `REACT_APP_MISTRAL_TIMEOUT` |
| Together AI | https://api.together.xyz/settings/api-keys | `REACT_APP_TOGETHER_ENABLED`, `REACT_APP_TOGETHER_API_KEY`, `REACT_APP_TOGETHER_MODEL`, `REACT_APP_TOGETHER_TIMEOUT` |
| Ollama | https://ollama.com | `REACT_APP_OLLAMA_ENABLED`, `REACT_APP_OLLAMA_BASE_URL`, `REACT_APP_OLLAMA_MODEL`, `REACT_APP_OLLAMA_TIMEOUT` |
| Smart Offline | No signup required | `REACT_APP_OFFLINE_ENABLED` |

## Recommended Order

If you only want to enable one or two providers, start with:

1. Google Gemini
2. Groq
3. Smart Offline as the always-on fallback

## Notes

- API keys are only read from environment variables.
- Disabled providers remain visible in the status panel but are skipped by the orchestrator.
- Ollama is local-only and requires a running Ollama server on your machine.
- The Hugging Face provider automatically falls back across these free/open models:
  - `Qwen/Qwen2.5-0.5B-Instruct`
  - `Qwen/Qwen3-0.6B`
  - `TinyLlama/TinyLlama-1.1B-Chat-v1.0`
  - `microsoft/phi-2`
  - `openai-community/gpt2`
  - `Qwen/Qwen2.5-1.5B-Instruct`
  - `Qwen/Qwen3-1.7B`
  - `Qwen/Qwen3-4B`
  - `Qwen/Qwen3-4B-Instruct-2507`
  - `Qwen/Qwen2.5-7B-Instruct`
  - `mistralai/Mistral-7B-Instruct-v0.3`
  - `Qwen/Qwen3-8B`
  - `openai/gpt-oss-20b`
  - `deepseek-ai/DeepSeek-R1`
- Set `REACT_APP_HUGGINGFACE_MODEL_CANDIDATES` to seed the default order, or reorder models from the in-app Settings modal. Browser-saved order overrides env defaults.
