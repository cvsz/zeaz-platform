import type { LocaleKey } from "@/data/zcloud-copy";

export type AiMode = "release" | "translations" | "templates" | "ecosystem" | "assistant";

export type AiBrief = {
  headline: string;
  summary: string;
  confidence: number;
  recommendations: string[];
  nextActions: string[];
};

export const aiModes: { id: AiMode; label: string; description: string }[] = [
  {
    id: "release",
    label: "Release Intel",
    description: "Summarize the current release posture and next safest move.",
  },
  {
    id: "translations",
    label: "Locale Analyst",
    description: "Compare the active language with the imported translation tree.",
  },
  {
    id: "templates",
    label: "Template Picker",
    description: "Recommend a vhost template family for the current site type.",
  },
  {
    id: "ecosystem",
    label: "Repo Radar",
    description: "Map the CloudPanel repo catalog into a feature stack.",
  },
  {
    id: "assistant",
    label: "Operator Copilot",
    description: "Respond to a free-form command prompt with release guidance.",
  },
];

export const aiPromptPresets = [
  "Compare translations and pick the best locale path.",
  "Recommend the safest vhost template family for a PHP site.",
  "Summarize the current CloudPanel ecosystem in release language.",
  "Identify the next control to check before shipping.",
];

const localeLabel: Record<LocaleKey, string> = {
  en: "English",
  th: "Thai",
  jp: "Japanese",
  ch: "Chinese",
  std: "Standard",
};

export function buildAiBrief(params: {
  mode: AiMode;
  locale: LocaleKey;
  prompt: string;
  activeSection: string;
  repoCount: number;
  translationCount: number;
  templateCount: number;
}): AiBrief {
  const prompt = params.prompt.trim() || "No prompt entered";
  const baseRecommendations = [
    `${localeLabel[params.locale]} mode is active, so keep the release copy aligned with ${params.activeSection}.`,
    `The ecosystem catalog currently tracks ${params.repoCount} CloudPanel repositories.`,
    `Translation coverage includes ${params.translationCount} upstream locale folders.`,
    `The template catalog includes ${params.templateCount} vhost families and special variants.`,
  ];

  if (params.mode === "translations") {
    return {
      headline: `Locale analysis for ${localeLabel[params.locale]}`,
      summary: `The imported CloudPanel translation tree already covers the upstream locales. Use the dock to pivot between EN, TH, JP, CH, and STD without leaving the release surface.`,
      confidence: 92,
      recommendations: [
        `Keep ${localeLabel[params.locale]} as the active release baseline for the current session.`,
        `Use the imported translation tree as the source of truth for copy expansion.`,
        `Prefer short operator language in the drawer and longer copy in the content cards.`,
      ],
      nextActions: ["Open translations", "Review locale folders", "Compare EN and STD"],
    };
  }

  if (params.mode === "templates") {
    return {
      headline: "Template recommendation ready",
      summary: "For CloudPanel vhost work, the safest default is the Generic template, then move to the app-specific family that matches the runtime.",
      confidence: 88,
      recommendations: [
        "Use Generic when the app profile is still uncertain.",
        "Prefer WordPress, Laravel, Nodejs, or Python for standard runtime paths.",
        "Use v2-http3 or v2-varnish when edge behavior is part of the deployment plan.",
      ],
      nextActions: ["Open vhost templates", "Check runtime matrix", "Jump to the templates section"],
    };
  }

  if (params.mode === "ecosystem") {
    return {
      headline: "Repo radar summary",
      summary: `The current catalog spans docs, templates, deployments, platform code, and tooling across ${params.repoCount} repositories.`,
      confidence: 90,
      recommendations: [
        "Treat docs, translations, and vhost templates as the core release trio.",
        "Use cloudpanel-ce as the primary platform anchor.",
        "Promote dploy and marketplace-scripts as release automation assets.",
      ],
      nextActions: ["Open ecosystem", "Review platform repos", "Check deployment tools"],
    };
  }

  if (params.mode === "assistant") {
    return {
      headline: `Copilot response to: ${prompt}`,
      summary: `The assistant read the prompt against the active section ${params.activeSection} and generated a release-safe response.`,
      confidence: 85,
      recommendations: [
        ...baseRecommendations,
        `Prompt intent: ${prompt}.`,
      ],
      nextActions: ["Apply recommendation", "Open palette", "Refine prompt"],
    };
  }

  return {
    headline: "Release intelligence ready",
    summary: "The AI layer reads the current release state, imported translation assets, template catalog, and repo ecosystem to produce operator guidance.",
    confidence: 94,
    recommendations: baseRecommendations,
    nextActions: ["Open AI center", "Review docs", "Inspect templates"],
  };
}
