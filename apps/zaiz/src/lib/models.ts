/**
 * Models — client-safe registry of z.ai GLM models available in the CLI.
 *
 * The z-ai-web-dev-sdk accepts an optional `model` field on the chat
 * completions body. When omitted the API uses its default. This registry
 * enumerates the models users can switch between in the dropdown.
 *
 * Safe to import from both client and server code (no SDK imports).
 */

export type ModelCategory = "flagship" | "fast" | "air" | "long" | "vision" | "legacy" | "local";

export type ModelCapability = "streaming" | "thinking" | "vision" | "long-context" | "cost-efficient" | "offline" | "private";

export interface ModelMeta {
  id: string;
  /** Short display label. */
  label: string;
  category: ModelCategory;
  tagline: string;
  description: string;
  capabilities: ModelCapability[];
  /** Relative speed indicator 1-5 (5 = fastest). */
  speed: number;
  /** Recommended for the CLI? */
  recommended?: boolean;
  /** Max context window (tokens), if known. */
  context?: number;
}

export const MODELS: ModelMeta[] = [
  // --- Flagship ---
  {
    id: "zlm-4.5",
    label: "GLM-4.5",
    category: "flagship",
    tagline: "Most capable — deep reasoning",
    description:
      "The flagship GLM 4.5 model. Best for complex reasoning, architecture, and multi-step planning. Highest quality, slower.",
    capabilities: ["streaming", "thinking"],
    speed: 3,
    recommended: true,
    context: 128000,
  },
  {
    id: "zlm-4.5-x",
    label: "GLM-4.5-X",
    category: "flagship",
    tagline: "Extended reasoning",
    description:
      "GLM 4.5 with extended thinking. Use for hard problems that benefit from longer chain-of-thought.",
    capabilities: ["streaming", "thinking"],
    speed: 2,
    context: 128000,
  },
  {
    id: "zlm-4-plus",
    label: "GLM-4-Plus",
    category: "flagship",
    tagline: "Reliable workhorse",
    description:
      "The proven GLM-4-Plus. Strong all-around performance for code, prose, and structured output.",
    capabilities: ["streaming", "thinking"],
    speed: 3,
    context: 128000,
  },

  // --- Fast ---
  {
    id: "zlm-4.5-flash",
    label: "GLM-4.5-Flash",
    category: "fast",
    tagline: "Fastest — great for quick Q&A",
    description:
      "Ultra-fast variant optimized for latency. Ideal for quick questions, autocomplete-style help, and high-volume runs.",
    capabilities: ["streaming", "cost-efficient"],
    speed: 5,
    recommended: true,
    context: 128000,
  },
  {
    id: "zlm-4-flash",
    label: "GLM-4-Flash",
    category: "fast",
    tagline: "Low-latency snapshot",
    description:
      "Fast GLM-4 snapshot tuned for speed. Good default for interactive chat.",
    capabilities: ["streaming", "cost-efficient"],
    speed: 5,
    context: 128000,
  },
  {
    id: "zlm-4-flashx",
    label: "GLM-4-FlashX",
    category: "fast",
    tagline: "Extra-fast",
    description:
      "Even leaner than Flash for when you need the quickest possible response.",
    capabilities: ["streaming", "cost-efficient"],
    speed: 5,
    context: 128000,
  },

  // --- Air (balanced) ---
  {
    id: "zlm-4.5-air",
    label: "GLM-4.5-Air",
    category: "air",
    tagline: "Balanced quality & speed",
    description:
      "A lightweight 4.5 variant that balances quality and speed. Great default for everyday coding tasks.",
    capabilities: ["streaming", "cost-efficient"],
    speed: 4,
    recommended: true,
    context: 128000,
  },
  {
    id: "zlm-4.5-airx",
    label: "GLM-4.5-AirX",
    category: "air",
    tagline: "Air + extended reasoning",
    description:
      "Air-class model with extended thinking. Middle ground between Flash and the full 4.5.",
    capabilities: ["streaming", "thinking", "cost-efficient"],
    speed: 4,
    context: 128000,
  },
  {
    id: "zlm-4-air",
    label: "GLM-4-Air",
    category: "air",
    tagline: "Lightweight 4-series",
    description:
      "Lighter GLM-4 variant for cost-sensitive, high-throughput workloads.",
    capabilities: ["streaming", "cost-efficient"],
    speed: 4,
    context: 128000,
  },
  {
    id: "zlm-4-airx",
    label: "GLM-4-AirX",
    category: "air",
    tagline: "Lightweight + reasoning",
    description:
      "GLM-4-Air with extra reasoning headroom.",
    capabilities: ["streaming", "thinking", "cost-efficient"],
    speed: 4,
    context: 128000,
  },

  // --- Long context ---
  {
    id: "zlm-4-long",
    label: "GLM-4-Long",
    category: "long",
    tagline: "1M-token context",
    description:
      "GLM-4 variant with a 1M-token context window. Use for large codebases, long documents, or big workspace snippets.",
    capabilities: ["streaming", "long-context"],
    speed: 3,
    context: 1000000,
  },
  {
    id: "zlm-4-32k",
    label: "GLM-4-32K",
    category: "long",
    tagline: "32K context",
    description:
      "GLM-4 with a 32K context window. Useful when the default context isn't enough but you don't need 1M.",
    capabilities: ["streaming", "long-context"],
    speed: 3,
    context: 32000,
  },

  // --- Vision ---
  {
    id: "zlm-4v",
    label: "GLM-4V",
    category: "vision",
    tagline: "Vision + text",
    description:
      "Multimodal GLM-4V. Accepts images alongside text. Use for diagrams, screenshots, UI mockups.",
    capabilities: ["streaming", "vision"],
    speed: 3,
    context: 128000,
  },
  {
    id: "zlm-4v-plus",
    label: "GLM-4V-Plus",
    category: "vision",
    tagline: "Enhanced vision",
    description:
      "Upgraded vision model with better image understanding and OCR.",
    capabilities: ["streaming", "vision"],
    speed: 3,
    context: 128000,
  },
  {
    id: "zlm-4v-flash",
    label: "GLM-4V-Flash",
    category: "vision",
    tagline: "Fast vision",
    description:
      "Fast vision variant for quick image Q&A at lower cost.",
    capabilities: ["streaming", "vision", "cost-efficient"],
    speed: 5,
    context: 128000,
  },

  // --- Legacy / preview ---
  {
    id: "zlm-zero-preview",
    label: "GLM-Zero-Preview",
    category: "legacy",
    tagline: "Reasoning preview",
    description:
      "Preview reasoning model. Experimental — behavior may change.",
    capabilities: ["streaming", "thinking"],
    speed: 2,
    context: 128000,
  },
  {
    id: "zlm-4-0520",
    label: "GLM-4-0520",
    category: "legacy",
    tagline: "May 2024 snapshot",
    description:
      "GLM-4 May 2024 snapshot. Kept for reproducibility.",
    capabilities: ["streaming"],
    speed: 3,
    context: 128000,
  },
  {
    id: "zlm-3-turbo",
    label: "GLM-3-Turbo",
    category: "legacy",
    tagline: "Legacy fast model",
    description:
      "GLM-3-Turbo. Legacy — prefer GLM-4-Flash for new work.",
    capabilities: ["streaming", "cost-efficient"],
    speed: 5,
    context: 128000,
  },

  // --- Local (offline) ---
  {
    id: "zlm-1.0-local",
    label: "ZLM-1.0 Local",
    category: "local",
    tagline: "Offline — no API needed",
    description:
      "A fully local heuristic model that runs without any API calls. Zero cost, zero latency, full privacy. Generates helpful coding responses via pattern matching — great for quick templates, explanations, and offline work. Not as capable as cloud GLM models.",
    capabilities: ["streaming", "offline", "private", "cost-efficient"],
    speed: 5,
    recommended: false,
    context: 8000,
  },
];

export const MODEL_MAP = new Map(MODELS.map((m) => [m.id, m]));

export const MODEL_CATEGORIES: { id: ModelCategory; label: string }[] = [
  { id: "flagship", label: "Flagship" },
  { id: "fast", label: "Fast" },
  { id: "air", label: "Balanced" },
  { id: "long", label: "Long context" },
  { id: "vision", label: "Vision" },
  { id: "legacy", label: "Legacy & preview" },
  { id: "local", label: "Local · Offline" },
];

/** The default model id used when none is selected. */
export const DEFAULT_MODEL_ID = "zlm-4.5-air";

export function getModel(id: string | null | undefined): ModelMeta | undefined {
  if (!id) return undefined;
  return MODEL_MAP.get(id);
}

export const VALID_MODEL_IDS = MODELS.map((m) => m.id);
