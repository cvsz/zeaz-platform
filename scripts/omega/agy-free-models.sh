#!/usr/bin/env bash
set -Eeuo pipefail

REPO="${REPO:-/home/zeazdev/zeaz-platform}"
OUT="${OUT:-$REPO/.agy/models.free.json}"
CMD="${1:-generate}"

cd "$REPO"

mkdir -p "$(dirname "$OUT")"

generate() {
  node - "$OUT" <<'NODE'
const fs = require("fs");
const https = require("https");

const out = process.argv[2];

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "zeaz-AGY-free-model-generator" } }, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        }
      });
    }).on("error", reject);
  });
}

function bool(v) {
  return Boolean(v);
}

function supports(params, key) {
  return Array.isArray(params) && params.includes(key);
}

function profileFromOpenRouter(model) {
  const params = model.supported_parameters || [];
  const idSafe = String(model.id).replace(/[^a-zA-Z0-9._:-]+/g, "-");

  return {
    id: `openrouter-free-${idSafe}`,
    provider: "openrouter",
    model: model.id,
    base_url: "https://openrouter.ai/api/v1",
    api_key_env: "OPENROUTER_API_KEY",
    cost_class: "free",
    source: "openrouter-api",
    context_window: model.context_length || model.top_provider?.context_length || 0,
    max_output_tokens: model.top_provider?.max_completion_tokens || 4096,
    temperature: 0.2,
    supports_tool_calling: supports(params, "tools") || supports(params, "tool_choice"),
    supports_vision: String(model.architecture?.modality || "").includes("image"),
    supports_json_mode: supports(params, "response_format") || supports(params, "structured_outputs"),
    supports_reasoning: supports(params, "reasoning") || bool(model.reasoning),
    recommended_for: model.id.includes("code") || model.name?.toLowerCase().includes("code")
      ? ["free", "coding", "agent", "review"]
      : ["free", "general", "fallback"]
  };
}

function staticProfiles() {
  return [
    {
      id: "openrouter-free-router",
      provider: "openrouter",
      model: "openrouter/free",
      base_url: "https://openrouter.ai/api/v1",
      api_key_env: "OPENROUTER_API_KEY",
      cost_class: "free-router",
      source: "openrouter",
      context_window: 32768,
      max_output_tokens: 4096,
      temperature: 0.2,
      supports_tool_calling: false,
      supports_vision: false,
      supports_json_mode: false,
      supports_reasoning: false,
      recommended_for: ["free", "fallback", "experiments"]
    },

    {
      id: "gemini-free-flash",
      provider: "gemini",
      model: "gemini-2.5-flash",
      base_url: "https://generativelanguage.googleapis.com",
      api_key_env: "GEMINI_API_KEY",
      cost_class: "free-tier-quota",
      source: "manual-free-tier",
      context_window: 1048576,
      max_output_tokens: 8192,
      temperature: 0.2,
      supports_tool_calling: true,
      supports_vision: true,
      supports_json_mode: true,
      supports_reasoning: true,
      recommended_for: ["free-tier", "long-context", "multimodal", "agent"]
    },
    {
      id: "gemini-free-flash-lite",
      provider: "gemini",
      model: "gemini-2.5-flash-lite",
      base_url: "https://generativelanguage.googleapis.com",
      api_key_env: "GEMINI_API_KEY",
      cost_class: "free-tier-quota",
      source: "manual-free-tier",
      context_window: 1048576,
      max_output_tokens: 8192,
      temperature: 0.2,
      supports_tool_calling: true,
      supports_vision: true,
      supports_json_mode: true,
      supports_reasoning: false,
      recommended_for: ["free-tier", "fast", "low-cost", "routing"]
    },
    {
      id: "gemini-free-2-flash",
      provider: "gemini",
      model: "gemini-2.0-flash",
      base_url: "https://generativelanguage.googleapis.com",
      api_key_env: "GEMINI_API_KEY",
      cost_class: "free-tier-quota",
      source: "manual-free-tier",
      context_window: 1048576,
      max_output_tokens: 8192,
      temperature: 0.2,
      supports_tool_calling: true,
      supports_vision: true,
      supports_json_mode: true,
      supports_reasoning: false,
      recommended_for: ["free-tier", "fast", "stable"]
    },

    {
      id: "ollama-qwen2.5-coder-14b",
      provider: "ollama",
      model: "qwen2.5-coder:14b",
      base_url: "http://127.0.0.1:11434/v1",
      api_key_env: "OLLAMA_API_KEY",
      cost_class: "local-no-cost",
      source: "manual-local",
      context_window: 32768,
      max_output_tokens: 4096,
      temperature: 0.2,
      supports_tool_calling: false,
      supports_vision: false,
      supports_json_mode: false,
      supports_reasoning: false,
      recommended_for: ["local", "coding", "offline", "safe-cost"]
    },
    {
      id: "ollama-qwen2.5-coder-7b",
      provider: "ollama",
      model: "qwen2.5-coder:7b",
      base_url: "http://127.0.0.1:11434/v1",
      api_key_env: "OLLAMA_API_KEY",
      cost_class: "local-no-cost",
      source: "manual-local",
      context_window: 32768,
      max_output_tokens: 4096,
      temperature: 0.2,
      supports_tool_calling: false,
      supports_vision: false,
      supports_json_mode: false,
      supports_reasoning: false,
      recommended_for: ["local", "coding", "low-vram", "offline"]
    },
    {
      id: "ollama-deepseek-coder-v2",
      provider: "ollama",
      model: "deepseek-coder-v2",
      base_url: "http://127.0.0.1:11434/v1",
      api_key_env: "OLLAMA_API_KEY",
      cost_class: "local-no-cost",
      source: "manual-local",
      context_window: 32768,
      max_output_tokens: 4096,
      temperature: 0.2,
      supports_tool_calling: false,
      supports_vision: false,
      supports_json_mode: false,
      supports_reasoning: false,
      recommended_for: ["local", "coding", "offline"]
    },
    {
      id: "ollama-deepseek-r1-8b",
      provider: "ollama",
      model: "deepseek-r1:8b",
      base_url: "http://127.0.0.1:11434/v1",
      api_key_env: "OLLAMA_API_KEY",
      cost_class: "local-no-cost",
      source: "manual-local",
      context_window: 32768,
      max_output_tokens: 4096,
      temperature: 0.2,
      supports_tool_calling: false,
      supports_vision: false,
      supports_json_mode: false,
      supports_reasoning: true,
      recommended_for: ["local", "reasoning", "debugging"]
    },
    {
      id: "ollama-llama3.2-3b",
      provider: "ollama",
      model: "llama3.2:3b",
      base_url: "http://127.0.0.1:11434/v1",
      api_key_env: "OLLAMA_API_KEY",
      cost_class: "local-no-cost",
      source: "manual-local",
      context_window: 131072,
      max_output_tokens: 4096,
      temperature: 0.2,
      supports_tool_calling: false,
      supports_vision: false,
      supports_json_mode: false,
      supports_reasoning: false,
      recommended_for: ["local", "fast", "low-vram"]
    },
    {
      id: "lmstudio-local-free",
      provider: "openai-compatible",
      model: "local-model",
      base_url: "http://127.0.0.1:1234/v1",
      api_key_env: "LMSTUDIO_API_KEY",
      cost_class: "local-no-cost",
      source: "manual-local",
      context_window: 32768,
      max_output_tokens: 4096,
      temperature: 0.2,
      supports_tool_calling: false,
      supports_vision: false,
      supports_json_mode: false,
      supports_reasoning: false,
      recommended_for: ["local", "lm-studio", "offline"]
    }
  ];
}

(async () => {
  const profiles = [...staticProfiles()];
  const warnings = [];

  try {
    const data = await getJson("https://openrouter.ai/api/v1/models");
    const free = (data.data || []).filter((m) => {
      const prompt = String(m.pricing?.prompt ?? "");
      const completion = String(m.pricing?.completion ?? "");
      return m.id?.endsWith(":free") || (prompt === "0" && completion === "0");
    });

    for (const model of free) {
      profiles.push(profileFromOpenRouter(model));
    }
  } catch (err) {
    warnings.push(`failed to fetch OpenRouter free model catalog: ${err.message}`);
  }

  const seen = new Set();
  const unique = [];

  for (const profile of profiles) {
    if (seen.has(profile.id)) continue;
    seen.add(profile.id);
    unique.push(profile);
  }

  unique.sort((a, b) => a.id.localeCompare(b.id));

  const result = {
    version: 1,
    generated_at: new Date().toISOString(),
    source: "scripts/omega/agy-free-models.sh",
    default_profile: "openrouter-free-router",
    cost_policy: "free-first; local-no-cost preferred; hosted free-tier depends on provider quota",
    profiles: unique,
    routes: {
      free: "openrouter-free-router",
      free_coder: unique.find((p) => p.model.includes("code") && p.provider === "openrouter")?.id || "ollama-qwen2.5-coder-14b",
      free_local: "ollama-qwen2.5-coder-14b",
      free_fast: "gemini-free-flash-lite",
      free_long_context: "gemini-free-flash",
      free_reasoning: "ollama-deepseek-r1-8b",
      free_lmstudio: "lmstudio-local-free"
    },
    warnings
  };

  fs.writeFileSync(out, JSON.stringify(result, null, 2) + "\n");
  console.log(`wrote ${out}`);
  console.log(`profiles: ${unique.length}`);
  if (warnings.length) {
    console.log("warnings:");
    for (const warning of warnings) console.log(`- ${warning}`);
  }
})();
NODE
}

validate() {
  node - "$OUT" <<'NODE'
const fs = require("fs");
const file = process.argv[2];
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const errors = [];
const ids = new Set();

if (data.version !== 1) errors.push("version must be 1");
if (!Array.isArray(data.profiles)) errors.push("profiles must be array");

for (const [i, p] of (data.profiles || []).entries()) {
  for (const key of ["id", "provider", "model", "base_url", "api_key_env"]) {
    if (!p[key] || typeof p[key] !== "string") errors.push(`profiles[${i}].${key} invalid`);
  }
  if (ids.has(p.id)) errors.push(`duplicate profile id: ${p.id}`);
  ids.add(p.id);

  const serialized = JSON.stringify(p);
  if (/sk-[A-Za-z0-9]|AIza|ghp_|github_pat_|xoxb-|xoxp-/.test(serialized)) {
    errors.push(`possible secret embedded in profile: ${p.id}`);
  }
}

for (const [route, id] of Object.entries(data.routes || {})) {
  if (!ids.has(id)) errors.push(`route ${route} points to missing profile ${id}`);
}

console.log(JSON.stringify({ ok: errors.length === 0, profiles: data.profiles?.length || 0, errors }, null, 2));
process.exit(errors.length ? 1 : 0);
NODE
}

list() {
  node - "$OUT" <<'NODE'
const fs = require("fs");
const data = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

for (const p of data.profiles || []) {
  console.log(`${p.id}\t${p.provider}\t${p.model}\t${p.cost_class || "unknown"}\tctx=${p.context_window}`);
}
NODE
}

routes() {
  node - "$OUT" <<'NODE'
const fs = require("fs");
const data = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

for (const [route, id] of Object.entries(data.routes || {})) {
  console.log(`${route} -> ${id}`);
}
NODE
}

case "$CMD" in
  generate) generate ;;
  validate) validate ;;
  list) list ;;
  routes) routes ;;
  *)
    echo "Usage: $0 {generate|validate|list|routes}"
    exit 2
    ;;
esac
