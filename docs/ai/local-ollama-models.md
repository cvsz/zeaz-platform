# Local Ollama Models

Last updated: 2026-07-01

`zeaz-platform` can use local Ollama models for offline coding, review, and automation workflows.

Source of truth: `configs/platform/local-models.json`.

Default local model:

```text
gpt-oss:20b-8k
```

Required local runtime:

```bash
ollama serve
ollama list
```

Environment:

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gpt-oss:20b-8k
```

Current local models from `ollama list`:

| Model | Role | Size |
|---|---|---:|
| `gpt-oss:20b-8k` | default | 13 GB |
| `gpt-oss:20b` | general | 13 GB |
| `qwen3:14b` | reasoning | 9.3 GB |
| `zcode-fast-safe:latest` | fast-coder | 4.7 GB |
| `qwen2.5-coder:7b` | fallback-coder | 4.7 GB |
| `zcode-turbo:latest` | quick | 1.9 GB |
| `qwen2.5-coder:3b` | lightweight-coder | 1.9 GB |
| `zcode:latest` | coder | 9.0 GB |
| `zcode-qwen25-coder:14b-tiny` | review-coder | 9.0 GB |
| `qwen2.5-coder:14b` | deep-coder | 9.0 GB |

Validation:

```bash
node scripts/platform/validate-local-ollama-models.mjs
```

Notes:

- The registry contains only model names and metadata, not secrets.
- Ollama is local-only and should not be exposed publicly through Cloudflare.
- Use Cloudflare routes for app surfaces, not for the local Ollama daemon.
