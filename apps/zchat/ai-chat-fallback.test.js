/**
 * @file ai-chat-fallback.test.js
 * @description Master Omega AI Chat Fallback — Unit Test Suite
 *
 * Suites:
 *   A. CircuitBreaker (4 tests)
 *   B. Logger utility (3 tests)
 *   C. Provider adapters — mocked fetch (3 tests each × 9 = 27 tests)
 *   D. Orchestrator (5 tests)
 *   E. Chat Persistence (3 tests)
 *   F. Rate Limiter (3 tests)
 *   G. Export Utility (4 tests)
 *
 * Total: ~49 tests
 */

// ---------------------------------------------------------------------------
// Global fetch mock
// ---------------------------------------------------------------------------
global.fetch = jest.fn();

function mockFetch(status, body) {
  global.fetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  // Reset environment variables to safe test defaults
  process.env.REACT_APP_DEBUG = 'false';
  process.env.REACT_APP_GEMINI_ENABLED = 'true';
  process.env.REACT_APP_GEMINI_API_KEY = 'test-gemini-key';
  process.env.REACT_APP_GROQ_ENABLED = 'true';
  process.env.REACT_APP_GROQ_API_KEY = 'test-groq-key';
  process.env.REACT_APP_COHERE_ENABLED = 'true';
  process.env.REACT_APP_COHERE_API_KEY = 'test-cohere-key';
  process.env.REACT_APP_HUGGINGFACE_ENABLED = 'true';
  process.env.REACT_APP_HUGGINGFACE_API_KEY = 'test-hf-key';
  process.env.REACT_APP_HUGGINGFACE_MODEL_CANDIDATES = 'microsoft/DialoGPT-large';
  process.env.REACT_APP_OPENROUTER_ENABLED = 'true';
  process.env.REACT_APP_OPENROUTER_API_KEY = 'test-or-key';
  process.env.REACT_APP_MISTRAL_ENABLED = 'true';
  process.env.REACT_APP_MISTRAL_API_KEY = 'test-mistral-key';
  process.env.REACT_APP_TOGETHER_ENABLED = 'false'; // disabled by default
  process.env.REACT_APP_OLLAMA_ENABLED = 'false';   // disabled by default
  process.env.REACT_APP_OFFLINE_ENABLED = 'true';
  process.env.REACT_APP_MAX_MESSAGES = '100';
  process.env.REACT_APP_GEMINI_TIMEOUT = '5000';
  process.env.REACT_APP_GROQ_TIMEOUT = '5000';
  process.env.REACT_APP_FALLBACK_CIRCUIT_BREAKER_THRESHOLD = '3';
  process.env.REACT_APP_FALLBACK_CIRCUIT_BREAKER_COOLDOWN_MS = '60000';
});

// ---------------------------------------------------------------------------
// Suite A: CircuitBreaker
// ---------------------------------------------------------------------------
const { CircuitBreaker } = require('./src/circuitBreaker');

describe('A. CircuitBreaker', () => {
  it('A1: starts in closed state (isOpen returns false)', () => {
    const cb = new CircuitBreaker('TestProvider', 3, 60000);
    expect(cb.isOpen()).toBe(false);
  });

  it('A2: opens after reaching failure threshold', () => {
    const cb = new CircuitBreaker('TestProvider', 3, 60000);
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.isOpen()).toBe(false); // 2 failures — still closed
    cb.recordFailure();
    expect(cb.isOpen()).toBe(true);  // 3 failures — open
  });

  it('A3: recordSuccess resets failure count and closes circuit', () => {
    const cb = new CircuitBreaker('TestProvider', 3, 60000);
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure(); // circuit open
    expect(cb.isOpen()).toBe(true);
    // Simulate cooldown passing
    cb.openUntil = Date.now() - 1;
    cb.isOpen(); // triggers half-open reset
    cb.recordSuccess();
    expect(cb.getFailureCount()).toBe(0);
    expect(cb.isOpen()).toBe(false);
  });

  it('A4: transitions to half-open after cooldown and allows next call', () => {
    const cb = new CircuitBreaker('TestProvider', 2, 100);
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.isOpen()).toBe(true);

    // Fast-forward cooldown
    cb.openUntil = Date.now() - 1;
    expect(cb.isOpen()).toBe(false); // half-open: resets
    expect(cb.getFailureCount()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Suite B: Logger
// ---------------------------------------------------------------------------
const { log } = require('./src/logger');

describe('B. Logger utility', () => {
  it('B1: suppresses debug messages when REACT_APP_DEBUG=false', () => {
    process.env.REACT_APP_DEBUG = 'false';
    const spy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    log.debug('TEST', 'debug message', { x: 1 });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('B2: emits debug messages when REACT_APP_DEBUG=true', () => {
    process.env.REACT_APP_DEBUG = 'true';
    const spy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    log.debug('TEST', 'debug message');
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('[OMEGA-CHAT][TEST][DEBUG]'),
      'debug message'
    );
    spy.mockRestore();
  });

  it('B3: always emits warn and error regardless of DEBUG setting', () => {
    process.env.REACT_APP_DEBUG = 'false';
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    log.warn('TEST', 'warn msg');
    log.error('TEST', 'err msg', new Error('fail'));
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
    errSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Suite C: Provider Adapters (mocked fetch)
// ---------------------------------------------------------------------------
const {
  geminiAdapter,
  groqAdapter,
  cohereAdapter,
  huggingFaceAdapter,
  openRouterAdapter,
  mistralAdapter,
  togetherAdapter,
  ollamaAdapter,
  smartOfflineAdapter,
} = require('./src/providers');
const {
  DEFAULT_HUGGINGFACE_FREE_MODELS,
  getResolvedHuggingFaceModelCandidates,
  normalizeHuggingFaceModelCandidates,
  resetHuggingFaceModelCandidates,
  saveHuggingFaceModelCandidates,
} = require('./src/huggingFaceModels');

// --- C1: Gemini ---
describe('C1. geminiAdapter', () => {
  it('returns text on successful 200 response', async () => {
    mockFetch(200, {
      candidates: [{ content: { parts: [{ text: 'Hello from Gemini' }] } }],
    });
    const result = await geminiAdapter.call('test', []);
    expect(result).toBe('Hello from Gemini');
  });

  it('throws on non-200 HTTP status', async () => {
    mockFetch(429, { error: { message: 'Rate limited' } });
    await expect(geminiAdapter.call('test')).rejects.toThrow('Gemini HTTP 429');
  });

  it('throws when response has no text content', async () => {
    mockFetch(200, { candidates: [] });
    await expect(geminiAdapter.call('test')).rejects.toThrow('Gemini: empty or missing response text');
  });
});

// --- C2: Groq ---
describe('C2. groqAdapter', () => {
  it('returns message content on 200', async () => {
    mockFetch(200, { choices: [{ message: { content: 'Hello from Groq' } }] });
    const result = await groqAdapter.call('test', []);
    expect(result).toBe('Hello from Groq');
  });

  it('throws on non-200 status', async () => {
    mockFetch(503, {});
    await expect(groqAdapter.call('test')).rejects.toThrow('Groq HTTP 503');
  });

  it('throws on empty choices array', async () => {
    mockFetch(200, { choices: [] });
    await expect(groqAdapter.call('test')).rejects.toThrow('Groq: empty response');
  });
});

// --- C3: Cohere ---
describe('C3. cohereAdapter', () => {
  it('returns text field on 200', async () => {
    mockFetch(200, { text: 'Hello from Cohere' });
    const result = await cohereAdapter.call('test', []);
    expect(result).toBe('Hello from Cohere');
  });

  it('throws on non-200 status', async () => {
    mockFetch(401, {});
    await expect(cohereAdapter.call('test')).rejects.toThrow('Cohere HTTP 401');
  });

  it('throws on missing text field', async () => {
    mockFetch(200, { generation: 'no text key' });
    await expect(cohereAdapter.call('test')).rejects.toThrow('Cohere: empty response');
  });
});

// --- C4: HuggingFace ---
describe('C4. huggingFaceAdapter', () => {
  it('ships an expanded curated free/open model chain', () => {
    expect(DEFAULT_HUGGINGFACE_FREE_MODELS).toEqual(
      expect.arrayContaining([
        'Qwen/Qwen2.5-0.5B-Instruct',
        'Qwen/Qwen3-1.7B',
        'Qwen/Qwen2.5-7B-Instruct',
        'Qwen/Qwen3-4B-Instruct-2507',
        'openai/gpt-oss-20b',
        'deepseek-ai/DeepSeek-R1',
      ])
    );
  });

  it('normalizes and deduplicates candidate order values', () => {
    expect(
      normalizeHuggingFaceModelCandidates([
        '  Qwen/Qwen3-0.6B  ',
        '',
        'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
        'Qwen/Qwen3-0.6B',
      ])
    ).toEqual(['Qwen/Qwen3-0.6B', 'TinyLlama/TinyLlama-1.1B-Chat-v1.0']);
  });

  it('uses browser-saved Hugging Face model order before env defaults', async () => {
    saveHuggingFaceModelCandidates([
      'deepseek-ai/DeepSeek-R1',
      'Qwen/Qwen3-0.6B',
    ]);
    expect(getResolvedHuggingFaceModelCandidates()).toEqual([
      'deepseek-ai/DeepSeek-R1',
      'Qwen/Qwen3-0.6B',
    ]);
    mockFetch(200, [{ generated_text: 'question Saved order wins' }]);
    const result = await huggingFaceAdapter.call('question');
    expect(result).toBe('Saved order wins');
  });

  it('returns generated_text on 200 (array response)', async () => {
    mockFetch(200, [{ generated_text: 'question Hello from HF' }]);
    const result = await huggingFaceAdapter.call('question');
    // Should strip the input echo
    expect(result).toBe('Hello from HF');
  });

  it('retries later free models when the first candidate fails', async () => {
    process.env.REACT_APP_HUGGINGFACE_MODEL_CANDIDATES =
      'Qwen/Qwen3-0.6B,TinyLlama/TinyLlama-1.1B-Chat-v1.0';
    mockFetch(503, { error: 'Model is loading' });
    mockFetch(200, [{ generated_text: 'question Free model fallback works' }]);
    const result = await huggingFaceAdapter.call('question');
    expect(result).toBe('Free model fallback works');
  });

  it('throws on non-200 status', async () => {
    mockFetch(503, {});
    await expect(huggingFaceAdapter.call('test')).rejects.toThrow('HuggingFace HTTP 503');
  });

  it('throws when API returns error field', async () => {
    mockFetch(200, { error: 'Model is loading' });
    await expect(huggingFaceAdapter.call('test')).rejects.toThrow('HuggingFace: Model is loading');
  });
});

// --- C5: OpenRouter ---
describe('C5. openRouterAdapter', () => {
  it('returns content on 200', async () => {
    mockFetch(200, { choices: [{ message: { content: 'Hello from OpenRouter' } }] });
    const result = await openRouterAdapter.call('test', []);
    expect(result).toBe('Hello from OpenRouter');
  });

  it('throws on non-200 status', async () => {
    mockFetch(400, {});
    await expect(openRouterAdapter.call('test')).rejects.toThrow('OpenRouter HTTP 400');
  });

  it('throws on empty choices', async () => {
    mockFetch(200, { choices: [] });
    await expect(openRouterAdapter.call('test')).rejects.toThrow('OpenRouter: empty response');
  });
});

// --- C6: Mistral ---
describe('C6. mistralAdapter', () => {
  it('returns content on 200', async () => {
    mockFetch(200, { choices: [{ message: { content: 'Hello from Mistral' } }] });
    const result = await mistralAdapter.call('test', []);
    expect(result).toBe('Hello from Mistral');
  });

  it('throws on non-200 status', async () => {
    mockFetch(500, {});
    await expect(mistralAdapter.call('test')).rejects.toThrow('Mistral HTTP 500');
  });

  it('throws on empty content', async () => {
    mockFetch(200, { choices: [{ message: { content: '' } }] });
    await expect(mistralAdapter.call('test')).rejects.toThrow('Mistral: empty response');
  });
});

// --- C7: Together AI ---
describe('C7. togetherAdapter (disabled by default)', () => {
  it('is disabled when REACT_APP_TOGETHER_ENABLED=false', () => {
    expect(togetherAdapter.enabled).toBe(false);
  });

  it('returns content when enabled and 200', async () => {
    process.env.REACT_APP_TOGETHER_ENABLED = 'true';
    process.env.REACT_APP_TOGETHER_API_KEY = 'test-together-key';
    mockFetch(200, { choices: [{ message: { content: 'Hello from Together' } }] });
    const result = await togetherAdapter.call('test', []);
    expect(result).toBe('Hello from Together');
  });

  it('throws on non-200 status', async () => {
    process.env.REACT_APP_TOGETHER_ENABLED = 'true';
    process.env.REACT_APP_TOGETHER_API_KEY = 'test-together-key';
    mockFetch(502, {});
    await expect(togetherAdapter.call('test')).rejects.toThrow('Together HTTP 502');
  });
});

// --- C8: Ollama ---
describe('C8. ollamaAdapter (disabled by default)', () => {
  it('is disabled when REACT_APP_OLLAMA_ENABLED=false', () => {
    expect(ollamaAdapter.enabled).toBe(false);
  });

  it('returns content when enabled and 200', async () => {
    process.env.REACT_APP_OLLAMA_ENABLED = 'true';
    mockFetch(200, { message: { content: 'Hello from Ollama' } });
    const result = await ollamaAdapter.call('test', []);
    expect(result).toBe('Hello from Ollama');
  });

  it('throws on non-200 status', async () => {
    process.env.REACT_APP_OLLAMA_ENABLED = 'true';
    mockFetch(503, {});
    await expect(ollamaAdapter.call('test')).rejects.toThrow('Ollama HTTP 503');
  });
});

// --- C9: Smart Offline ---
describe('C9. smartOfflineAdapter', () => {
  it('is always enabled', () => {
    expect(smartOfflineAdapter.enabled).toBe(true);
  });

  it('matches greeting pattern and returns a response', async () => {
    const result = await smartOfflineAdapter.call('Hello there!');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns offline notice for unknown messages', async () => {
    const result = await smartOfflineAdapter.call('what is the capital of mars on tuesday');
    expect(result).toContain('Offline Mode Active');
  });
});

// ---------------------------------------------------------------------------
// Suite D: Orchestrator
// ---------------------------------------------------------------------------
const { callAIWithFallback, getProviderStatuses } = require('./src/orchestrator');

describe('D. callAIWithFallback (Orchestrator)', () => {
  it('D1: returns result from first successful provider', async () => {
    // Gemini responds successfully
    mockFetch(200, {
      candidates: [{ content: { parts: [{ text: 'Gemini response' }] } }],
    });
    const result = await callAIWithFallback('test message', []);
    expect(result.content).toBe('Gemini response');
    expect(result.source).toBe('Google Gemini');
    expect(result.success).toBe(true);
    expect(typeof result.latencyMs).toBe('number');
  });

  it('D2: falls through to next provider when first fails', async () => {
    // Gemini fails
    mockFetch(500, {});
    // Groq succeeds
    mockFetch(200, { choices: [{ message: { content: 'Groq response' } }] });

    const result = await callAIWithFallback('test message', []);
    expect(result.source).toBe('Groq (LLaMA)');
    expect(result.content).toBe('Groq response');
  });

  it('D3: includes latencyMs in successful result', async () => {
    mockFetch(200, {
      candidates: [{ content: { parts: [{ text: 'fast response' }] } }],
    });
    const result = await callAIWithFallback('timing test');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('D4: getProviderStatuses returns array with one entry per adapter', () => {
    const statuses = getProviderStatuses();
    expect(Array.isArray(statuses)).toBe(true);
    expect(statuses.length).toBeGreaterThan(0);
    statuses.forEach((s) => {
      expect(s).toHaveProperty('name');
      expect(s).toHaveProperty('enabled');
      expect(s).toHaveProperty('circuitOpen');
    });
  });

  it('D5: eventually returns Smart Offline response when all API providers fail', async () => {
    // Make all fetch calls fail
    global.fetch.mockRejectedValue(new Error('Network error'));

    const result = await callAIWithFallback('test');
    // Should fall through to Smart Offline
    expect(result.source).toBe('Smart Offline');
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Suite E: Chat Persistence
// ---------------------------------------------------------------------------
const { persistChat } = require('./src/chatPersistence');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('E. chatPersistence', () => {
  beforeEach(() => localStorage.clear());

  it('E1: saves and loads messages round-trip', () => {
    const msgs = [
      { id: '1', role: 'user', content: 'Hello', timestamp: new Date('2026-01-01') },
      { id: '2', role: 'assistant', content: 'Hi!', timestamp: new Date('2026-01-01') },
    ];
    persistChat.save(msgs);
    const loaded = persistChat.load();
    expect(loaded).toHaveLength(2);
    expect(loaded[0].content).toBe('Hello');
    expect(loaded[1].timestamp).toBeInstanceOf(Date);
  });

  it('E2: truncates to MAX_MESSAGES when saving more', () => {
    process.env.REACT_APP_MAX_MESSAGES = '3';
    const msgs = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      role: 'user',
      content: `msg ${i}`,
      timestamp: new Date(),
    }));
    persistChat.save(msgs);
    const loaded = persistChat.load();
    expect(loaded).toHaveLength(3);
  });

  it('E3: load returns empty array when localStorage has corrupt data', () => {
    localStorage.setItem('omega_chat_messages', '{not valid json}');
    const loaded = persistChat.load();
    expect(loaded).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Suite F: Rate Limiter
// ---------------------------------------------------------------------------
const { createRateLimiter } = require('./src/rateLimiter');

describe('F. createRateLimiter', () => {
  it('F1: allows requests within the limit', () => {
    const limiter = createRateLimiter(5, 60000);
    expect(() => {
      limiter.check();
      limiter.check();
      limiter.check();
    }).not.toThrow();
    expect(limiter.remaining()).toBe(2);
  });

  it('F2: throws RateLimitError when limit is exceeded', () => {
    const limiter = createRateLimiter(2, 60000);
    limiter.check();
    limiter.check();
    expect(() => limiter.check()).toThrow(/Rate limit reached/);
  });

  it('F3: remaining() returns correct count and reset() works', () => {
    const limiter = createRateLimiter(10, 60000);
    limiter.check();
    limiter.check();
    expect(limiter.remaining()).toBe(8);
    limiter.reset();
    expect(limiter.remaining()).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// Suite G: Export Utility
// ---------------------------------------------------------------------------
const {
  exportAsMarkdown,
  exportAsJSON,
  generateExportFilename,
} = require('./src/exportChat');

describe('G. exportChat', () => {
  const sampleMessages = [
    {
      id: '1',
      role: 'user',
      content: 'Hello AI',
      timestamp: new Date('2026-01-01T12:00:00Z'),
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Hello human!',
      timestamp: new Date('2026-01-01T12:00:05Z'),
      source: 'Google Gemini',
      latencyMs: 450,
    },
  ];

  it('G1: exportAsMarkdown contains role labels', () => {
    const md = exportAsMarkdown(sampleMessages);
    expect(md).toContain('👤 **User**');
    expect(md).toContain('🤖 **Assistant**');
  });

  it('G2: exportAsMarkdown includes provider source', () => {
    const md = exportAsMarkdown(sampleMessages);
    expect(md).toContain('Google Gemini');
  });

  it('G3: exportAsJSON produces valid JSON with exportedAt', () => {
    const json = exportAsJSON(sampleMessages);
    const parsed = JSON.parse(json);
    expect(parsed).toHaveProperty('exportedAt');
    expect(parsed).toHaveProperty('messages');
    expect(parsed.messages).toHaveLength(2);
    expect(parsed.messageCount).toBe(2);
  });

  it('G4: generateExportFilename returns correct extension', () => {
    expect(generateExportFilename('md')).toMatch(/omega-chat-.+\.md$/);
    expect(generateExportFilename('json')).toMatch(/omega-chat-.+\.json$/);
  });
});
