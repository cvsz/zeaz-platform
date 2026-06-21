const STORAGE_KEY = 'omega_chat_hf_model_candidates';

export const DEFAULT_HUGGINGFACE_FREE_MODELS = [
  'Qwen/Qwen2.5-0.5B-Instruct',
  'Qwen/Qwen3-0.6B',
  'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
  'microsoft/phi-2',
  'openai-community/gpt2',
  'Qwen/Qwen2.5-1.5B-Instruct',
  'Qwen/Qwen3-1.7B',
  'Qwen/Qwen3-4B',
  'Qwen/Qwen3-4B-Instruct-2507',
  'Qwen/Qwen2.5-7B-Instruct',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'Qwen/Qwen3-8B',
  'openai/gpt-oss-20b',
  'deepseek-ai/DeepSeek-R1',
];

function isBrowserStorageAvailable() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function normalizeHuggingFaceModelCandidates(value) {
  const items = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  return [...new Set(
    items
      .map((item) => String(item).trim())
      .filter(Boolean)
  )];
}

function readStoredHuggingFaceModelCandidates() {
  if (!isBrowserStorageAvailable()) return null;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      const normalized = normalizeHuggingFaceModelCandidates(parsed);
      return normalized.length > 0 ? normalized : null;
    }

    if (typeof parsed === 'string') {
      const normalized = normalizeHuggingFaceModelCandidates(parsed);
      return normalized.length > 0 ? normalized : null;
    }
  } catch (error) {
    console.warn('[OMEGA-CHAT][HF-MODELS][WARN] Failed to read saved model order:', error?.message);
  }

  return null;
}

function buildEnvHuggingFaceModelCandidates() {
  const override = process.env.REACT_APP_HUGGINGFACE_MODEL_CANDIDATES;
  if (override) {
    return normalizeHuggingFaceModelCandidates(override);
  }

  const preferred = process.env.REACT_APP_HUGGINGFACE_MODEL?.trim();
  const models = [
    preferred || DEFAULT_HUGGINGFACE_FREE_MODELS[0],
    ...DEFAULT_HUGGINGFACE_FREE_MODELS,
  ].filter(Boolean);

  return normalizeHuggingFaceModelCandidates(models);
}

export function getResolvedHuggingFaceModelCandidates() {
  const stored = readStoredHuggingFaceModelCandidates();
  if (stored) return stored;
  return buildEnvHuggingFaceModelCandidates();
}

export function getHuggingFaceModelCandidatesSource() {
  if (readStoredHuggingFaceModelCandidates()) return 'saved';
  if (process.env.REACT_APP_HUGGINGFACE_MODEL_CANDIDATES || process.env.REACT_APP_HUGGINGFACE_MODEL) {
    return 'env';
  }
  return 'default';
}

export function saveHuggingFaceModelCandidates(candidates) {
  const normalized = normalizeHuggingFaceModelCandidates(candidates);

  if (!isBrowserStorageAvailable()) {
    return normalized;
  }

  try {
    if (normalized.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
  } catch (error) {
    console.warn('[OMEGA-CHAT][HF-MODELS][WARN] Failed to save model order:', error?.message);
  }

  return normalized;
}

export function resetHuggingFaceModelCandidates() {
  if (!isBrowserStorageAvailable()) return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[OMEGA-CHAT][HF-MODELS][WARN] Failed to clear model order:', error?.message);
  }
}
