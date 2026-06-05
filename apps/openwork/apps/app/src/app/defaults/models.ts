/**
 * Default model recommendation constants.
 *
 * These are hardcoded client-side defaults. If a server-side API is added
 * later, these should be replaced by the server response.
 *
 * To add or remove recommended models, edit this file.
 */

/**
 * Models considered "recommended" and shown with a star icon at the top
 * of each provider's model list in the picker.
 *
 * These are model ID substrings (case-insensitive match).
 */
export const RECOMMENDED_MODEL_PATTERNS: string[] = [
  // Anthropic
  "claude-opus-4",
  "claude-sonnet-4-6",
  "claude-haiku-4-5",
  // OpenAI
  "gpt-5.5",
  "gpt-5",
  "o3",
  "o4-mini",
  // Google
  "gemini-3-pro",
  "gemini-2.5-pro",
  // Moonshot
  "kimi-k2.6",
  // Meta
  "llama-4",
  // xAI
  "grok-3",
  // DeepSeek
  "deepseek-v3",
  "deepseek-r1",
];

/**
 * Check if a model is in the recommended list.
 */
export function isRecommendedModel(modelId: string): boolean {
  const lower = modelId.toLowerCase();
  return RECOMMENDED_MODEL_PATTERNS.some((p) => lower.includes(p));
}
