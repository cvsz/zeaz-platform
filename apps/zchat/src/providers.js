/**
 * @file providers.js
 * @description All 9 AI provider adapters for Master Omega fallback chain.
 *
 * Each adapter implements the interface:
 *   { name: string, enabled: boolean, timeout: number, call(message, history): Promise<string> }
 *
 * SECURITY: API keys are read from environment variables only.
 * Keys are NEVER logged — only their presence (boolean) is logged.
 */

import { log } from './logger';

// ---------------------------------------------------------------------------
// Utility: build OpenAI-compatible messages array from history
// ---------------------------------------------------------------------------
function buildMessages(message, history = []) {
  return [
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
    { role: 'user', content: message },
  ];
}

// ---------------------------------------------------------------------------
// PROVIDER 1 — Google Gemini
// Free tier: 15 RPM, 1500 RPD (gemini-2.0-flash)
// Sign up: https://aistudio.google.com/app/apikey
// ---------------------------------------------------------------------------
export const geminiAdapter = {
  name: 'Google Gemini',
  get enabled() {
    return (
      process.env.REACT_APP_GEMINI_ENABLED === 'true' &&
      Boolean(process.env.REACT_APP_GEMINI_API_KEY)
    );
  },
  get timeout() {
    return parseInt(process.env.REACT_APP_GEMINI_TIMEOUT, 10) || 20000;
  },
  async call(message, history = []) {
    const model = process.env.REACT_APP_GEMINI_MODEL || 'gemini-2.0-flash';
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    log.debug('GEMINI', `Calling model=${model}`, {
      keyPresent: Boolean(apiKey),
      historyTurns: history.length,
    });

    const contents = [
      ...history.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`Gemini HTTP ${response.status}: ${errBody.slice(0, 200)}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini: empty or missing response text');
    log.debug('GEMINI', 'Success', { chars: text.length });
    return text;
  },
};

// ---------------------------------------------------------------------------
// PROVIDER 2 — Groq
// Free tier: 30 RPM, ultra-fast inference (LLaMA 3.3 70B)
// Sign up: https://console.groq.com/keys
// ---------------------------------------------------------------------------
export const groqAdapter = {
  name: 'Groq (LLaMA)',
  get enabled() {
    return (
      process.env.REACT_APP_GROQ_ENABLED === 'true' &&
      Boolean(process.env.REACT_APP_GROQ_API_KEY)
    );
  },
  get timeout() {
    return parseInt(process.env.REACT_APP_GROQ_TIMEOUT, 10) || 15000;
  },
  async call(message, history = []) {
    const model = process.env.REACT_APP_GROQ_MODEL || 'llama-3.3-70b-versatile';
    log.debug('GROQ', `Calling model=${model}`, {
      keyPresent: Boolean(process.env.REACT_APP_GROQ_API_KEY),
      historyTurns: history.length,
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: buildMessages(message, history),
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq HTTP ${response.status}`);
    }
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Groq: empty response');
    log.debug('GROQ', 'Success', { chars: text.length });
    return text;
  },
};

// ---------------------------------------------------------------------------
// PROVIDER 3 — Cohere
// Free trial, 100 req/month free on command-r
// Sign up: https://dashboard.cohere.com/api-keys
// ---------------------------------------------------------------------------
export const cohereAdapter = {
  name: 'Cohere',
  get enabled() {
    return (
      process.env.REACT_APP_COHERE_ENABLED === 'true' &&
      Boolean(process.env.REACT_APP_COHERE_API_KEY)
    );
  },
  get timeout() {
    return parseInt(process.env.REACT_APP_COHERE_TIMEOUT, 10) || 25000;
  },
  async call(message, history = []) {
    const model = process.env.REACT_APP_COHERE_MODEL || 'command-r';
    log.debug('COHERE', `Calling model=${model}`, { historyTurns: history.length });

    const chatHistory = history.map((m) => ({
      role: m.role === 'assistant' ? 'CHATBOT' : 'USER',
      message: m.content,
    }));

    const response = await fetch('https://api.cohere.com/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_COHERE_API_KEY}`,
      },
      body: JSON.stringify({ model, message, chat_history: chatHistory }),
    });

    if (!response.ok) throw new Error(`Cohere HTTP ${response.status}`);
    const data = await response.json();
    const text = data?.text;
    if (!text) throw new Error('Cohere: empty response');
    log.debug('COHERE', 'Success', { chars: text.length });
    return text;
  },
};

// ---------------------------------------------------------------------------
// PROVIDER 4 — Hugging Face Inference API
// Free serverless inference on open models
// Sign up: https://huggingface.co/settings/tokens
// ---------------------------------------------------------------------------
const DEFAULT_HUGGINGFACE_FREE_MODELS = [
  'Qwen/Qwen3-0.6B',
  'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
  'Qwen/Qwen2.5-1.5B-Instruct',
  'microsoft/phi-2',
  'openai-community/gpt2',
  'Qwen/Qwen3-4B',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'Qwen/Qwen3-8B',
];

function parseModelList(rawValue) {
  return rawValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getHuggingFaceModelCandidates() {
  const override = process.env.REACT_APP_HUGGINGFACE_MODEL_CANDIDATES;
  if (override) {
    return [...new Set(parseModelList(override))];
  }

  const preferred = process.env.REACT_APP_HUGGINGFACE_MODEL?.trim();
  const models = [
    preferred || DEFAULT_HUGGINGFACE_FREE_MODELS[0],
    ...DEFAULT_HUGGINGFACE_FREE_MODELS,
  ].filter(Boolean);

  return [...new Set(models)];
}

async function fetchHuggingFaceModel(model, message) {
  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.REACT_APP_HUGGINGFACE_API_KEY}`,
    },
    body: JSON.stringify({
      inputs: message,
      parameters: { max_new_tokens: 200, return_full_text: false },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`HuggingFace HTTP ${response.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await response.json();
  if (data?.error) throw new Error(`HuggingFace: ${data.error}`);

  const raw = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
  if (!raw) throw new Error('HuggingFace: empty response');

  return raw;
}

export const huggingFaceAdapter = {
  name: 'Hugging Face',
  get enabled() {
    return (
      process.env.REACT_APP_HUGGINGFACE_ENABLED === 'true' &&
      Boolean(process.env.REACT_APP_HUGGINGFACE_API_KEY)
    );
  },
  get timeout() {
    return parseInt(process.env.REACT_APP_HUGGINGFACE_TIMEOUT, 10) || 30000;
  },
  async call(message) {
    const candidates = getHuggingFaceModelCandidates();
    log.debug('HUGGINGFACE', 'Model candidates selected', { candidates });

    let lastError = null;

    for (const model of candidates) {
      const attemptStart = Date.now();
      log.info('HUGGINGFACE', `Attempting model="${model}"`);

      try {
        const raw = await fetchHuggingFaceModel(model, message);
        const text = raw.startsWith(message) ? raw.slice(message.length).trim() : raw;
        const durationMs = Date.now() - attemptStart;
        log.info('HUGGINGFACE', `Success model="${model}"`, {
          chars: (text || raw).length,
          durationMs,
        });
        return text || raw;
      } catch (error) {
        lastError = error;
        log.warn('HUGGINGFACE', `Model failed model="${model}"`, error.message);
      }
    }

    throw new Error(
      `HuggingFace: all ${candidates.length} free models failed. Last error: ${lastError?.message ?? 'unknown'}`
    );
  },
};

// ---------------------------------------------------------------------------
// PROVIDER 5 — OpenRouter
// Free :free tagged models (Meta LLaMA, Mistral, etc.)
// Sign up: https://openrouter.ai/keys
// ---------------------------------------------------------------------------
export const openRouterAdapter = {
  name: 'OpenRouter',
  get enabled() {
    return (
      process.env.REACT_APP_OPENROUTER_ENABLED === 'true' &&
      Boolean(process.env.REACT_APP_OPENROUTER_API_KEY)
    );
  },
  get timeout() {
    return parseInt(process.env.REACT_APP_OPENROUTER_TIMEOUT, 10) || 25000;
  },
  async call(message, history = []) {
    const model =
      process.env.REACT_APP_OPENROUTER_MODEL ||
      'meta-llama/llama-3.2-3b-instruct:free';
    log.debug('OPENROUTER', `Calling model=${model}`, { historyTurns: history.length });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://zeaz.dev',
        'X-Title': 'ZeaZ Omega Chat',
      },
      body: JSON.stringify({
        model,
        messages: buildMessages(message, history),
      }),
    });

    if (!response.ok) throw new Error(`OpenRouter HTTP ${response.status}`);
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenRouter: empty response');
    log.debug('OPENROUTER', 'Success', { chars: text.length });
    return text;
  },
};

// ---------------------------------------------------------------------------
// PROVIDER 6 — Mistral AI
// Free tier available (la Plateforme)
// Sign up: https://console.mistral.ai/api-keys
// ---------------------------------------------------------------------------
export const mistralAdapter = {
  name: 'Mistral AI',
  get enabled() {
    return (
      process.env.REACT_APP_MISTRAL_ENABLED === 'true' &&
      Boolean(process.env.REACT_APP_MISTRAL_API_KEY)
    );
  },
  get timeout() {
    return parseInt(process.env.REACT_APP_MISTRAL_TIMEOUT, 10) || 20000;
  },
  async call(message, history = []) {
    const model = process.env.REACT_APP_MISTRAL_MODEL || 'mistral-small-latest';
    log.debug('MISTRAL', `Calling model=${model}`, { historyTurns: history.length });

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: buildMessages(message, history),
      }),
    });

    if (!response.ok) throw new Error(`Mistral HTTP ${response.status}`);
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Mistral: empty response');
    log.debug('MISTRAL', 'Success', { chars: text.length });
    return text;
  },
};

// ---------------------------------------------------------------------------
// PROVIDER 7 — Together AI
// $25 free credit on signup; pay-as-you-go after
// Sign up: https://api.together.xyz/settings/api-keys
// ---------------------------------------------------------------------------
export const togetherAdapter = {
  name: 'Together AI',
  get enabled() {
    return (
      process.env.REACT_APP_TOGETHER_ENABLED === 'true' &&
      Boolean(process.env.REACT_APP_TOGETHER_API_KEY)
    );
  },
  get timeout() {
    return parseInt(process.env.REACT_APP_TOGETHER_TIMEOUT, 10) || 25000;
  },
  async call(message, history = []) {
    const model =
      process.env.REACT_APP_TOGETHER_MODEL ||
      'meta-llama/Llama-3.2-3B-Instruct-Turbo';
    log.debug('TOGETHER', `Calling model=${model}`, { historyTurns: history.length });

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: buildMessages(message, history),
        max_tokens: 1024,
      }),
    });

    if (!response.ok) throw new Error(`Together HTTP ${response.status}`);
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Together: empty response');
    log.debug('TOGETHER', 'Success', { chars: text.length });
    return text;
  },
};

// ---------------------------------------------------------------------------
// PROVIDER 8 — Ollama (Local)
// 100% free — requires a local Ollama server
// Install: https://ollama.ai — then: ollama pull llama3.2
// Disabled by default (requires local setup)
// ---------------------------------------------------------------------------
export const ollamaAdapter = {
  name: 'Ollama (Local)',
  get enabled() {
    return process.env.REACT_APP_OLLAMA_ENABLED === 'true';
  },
  get timeout() {
    return parseInt(process.env.REACT_APP_OLLAMA_TIMEOUT, 10) || 60000;
  },
  async call(message, history = []) {
    const baseUrl =
      process.env.REACT_APP_OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.REACT_APP_OLLAMA_MODEL || 'llama3.2';
    log.debug('OLLAMA', `Calling local model=${model} at ${baseUrl}`, {
      historyTurns: history.length,
    });

    const messages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: false }),
    });

    if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
    const data = await response.json();
    const text = data?.message?.content;
    if (!text) throw new Error('Ollama: empty response');
    log.debug('OLLAMA', 'Success', { chars: text.length });
    return text;
  },
};

// ---------------------------------------------------------------------------
// PROVIDER 9 — Smart Offline
// Always available — no API key, no network required.
// Uses pattern-matching for helpful offline responses.
// ---------------------------------------------------------------------------
export const smartOfflineAdapter = {
  name: 'Smart Offline',
  get enabled() {
    return process.env.REACT_APP_OFFLINE_ENABLED !== 'false';
  },
  timeout: 200,
  // eslint-disable-next-line no-unused-vars
  async call(message, _history = []) {
    log.info('OFFLINE', 'Using smart offline fallback — all API providers unavailable');
    const lower = message.toLowerCase();

    const patterns = [
      {
        re: /\b(hi|hello|hey|greetings|howdy|สวัสดี)\b/i,
        response:
          "Hello! I'm running in **offline mode** — all AI providers are currently unavailable. I can still help with basic questions!",
      },
      {
        re: /\b(help|what can you|can you do|capabilities)\b/i,
        response:
          'In offline mode, I respond with pattern matching. For full AI capabilities, add your API keys to `.env.local` and reload. Supported free providers: Gemini, Groq, Cohere, HuggingFace, OpenRouter, Mistral.',
      },
      {
        re: /\b(who are you|what are you|your name|which ai)\b/i,
        response:
          'I\'m **ZeaZ Omega Chat** — an AI assistant with a 9-provider free fallback chain. Currently running in offline mode since no API keys are configured.',
      },
      {
        re: /\b(how are you|how\'s it|how is it)\b/i,
        response:
          'I\'m operational in offline fallback mode ✅. The fallback chain is working correctly — all API providers are unreachable, but the system is healthy.',
      },
      {
        re: /\b(time|date|today|now)\b/i,
        response: `The current date and time is: **${new Date().toLocaleString()}**`,
      },
      {
        re: /\b(test|testing|ping|check)\b/i,
        response:
          '✅ **Offline fallback is working.** The Master Omega circuit breaker chain is operational. To enable live AI: add API keys to `.env.local`.',
      },
      {
        re: /\b(provider|api|key|config|setup|configure)\b/i,
        response:
          '**Provider Setup:** Copy `.env.example` to `.env.local`, add your free API keys, and reload. Recommended: Gemini (15 RPM free) + Groq (30 RPM free). See `PROVIDER_SETUP.md` for step-by-step instructions.',
      },
    ];

    for (const { re, response } of patterns) {
      if (re.test(lower)) {
        return response;
      }
    }

    return (
      `⚠️ **Offline Mode Active**\n\n` +
      `I received your message: *"${message}"*\n\n` +
      `All AI providers are currently unavailable. To get full AI responses:\n` +
      `1. Copy \`.env.example\` → \`.env.local\`\n` +
      `2. Add at least one free API key (Gemini or Groq recommended)\n` +
      `3. Set \`REACT_APP_<PROVIDER>_ENABLED=true\`\n` +
      `4. Reload the page\n\n` +
      `**Free providers:** Gemini · Groq · Cohere · HuggingFace · OpenRouter · Mistral`
    );
  },
};

// ---------------------------------------------------------------------------
// Ordered list for orchestrator — priority from best to last resort
// ---------------------------------------------------------------------------
export const ALL_ADAPTERS = [
  geminiAdapter,
  groqAdapter,
  cohereAdapter,
  huggingFaceAdapter,
  openRouterAdapter,
  mistralAdapter,
  togetherAdapter,
  ollamaAdapter,
  smartOfflineAdapter,
];
