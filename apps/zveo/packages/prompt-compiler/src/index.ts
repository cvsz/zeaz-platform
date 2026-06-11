import { createHash } from "node:crypto";
import { z } from "zod";
import type { CompiledScene } from "@zveo/scene-graph";
import { renderProviderSchema } from "@zveo/core";

export const promptCompilerOptionsSchema = z.object({
  provider: renderProviderSchema,
  maxTokens: z.number().int().min(128).max(8192).default(2200),
  styleReferences: z.array(z.string().trim().min(1).max(512)).max(32).default([]),
  semanticDedupe: z.boolean().default(true),
});

export interface ProviderPrompt {
  provider: z.infer<typeof renderProviderSchema>;
  positive: string;
  negative: string;
  metadata: {
    promptHash: string;
    continuityHash: string;
    optimizationPasses: string[];
    estimatedTokens: number;
  };
}

function normalizeSentence(sentence: string): string {
  return sentence.replace(/\s+/g, " ").trim();
}

function semanticDedupe(lines: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const line of lines.map(normalizeSentence).filter(Boolean)) {
    const key = line.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\b(the|a|an|and|with|of)\b/g, "").replace(/\s+/g, " ").trim();
    if (!seen.has(key)) {
      seen.add(key);
      output.push(line);
    }
  }
  return output;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function trimToTokenBudget(lines: string[], maxTokens: number): string {
  const kept: string[] = [];
  for (const line of lines) {
    const candidate = [...kept, line].join("\n");
    if (estimateTokens(candidate) > maxTokens) break;
    kept.push(line);
  }
  return kept.join("\n");
}

export function compileProviderPrompt(scene: CompiledScene, rawOptions: z.input<typeof promptCompilerOptionsSchema>): ProviderPrompt {
  const options = promptCompilerOptionsSchema.parse(rawOptions);
  const providerDirectives: Record<ProviderPrompt["provider"], string[]> = {
    veo: ["Veo directive: prioritize temporal coherence, physically plausible motion, identity lock, no unintended subject morphing.", "Camera grammar: specify lens, framing, movement, stabilization, and transition continuity explicitly."],
    google_flow: ["Google Flow directive: preserve shot-to-shot editorial continuity, production design, and character blocking.", "Execution directive: use structured cinematic staging and avoid UI-driven assumptions."],
    nano_banana: ["Nano Banana directive: preserve visual reference identity, texture, wardrobe, and environment consistency for image-to-video/image generation.", "Reference directive: treat embedding URIs and asset IDs as identity anchors, not style suggestions."],
  };
  const continuityReferences = [
    `Continuity fingerprint scene=${scene.scene.id} order=${scene.order}`,
    `Environment lock: ${scene.scene.environment.location}; ${scene.scene.environment.timeOfDay}; ${scene.scene.environment.weather}`,
    `Lighting lock: ${scene.scene.lighting.setup}; ${scene.scene.lighting.colorTemperature}; ${scene.scene.lighting.contrast}`,
    `Camera lock: ${scene.scene.camera.framing}; ${scene.scene.camera.movement}; ${scene.scene.camera.lensMm}mm`,
    ...scene.characterMemory.map((character) => `Identity lock ${character.id}/${character.name}: ${character.appearance}; wardrobe ${character.wardrobe}; state ${character.currentState ?? "unchanged"}`),
    ...scene.visualReferences.map((reference) => `Visual embedding anchor ${reference.id}: ${reference.embeddingUri}; ${reference.description}; weight ${reference.weight ?? 1}`),
  ];
  const lines = [
    ...providerDirectives[options.provider],
    ...options.styleReferences.map((reference) => `Style reference: ${reference}`),
    scene.prompt,
    scene.continuityPrompt,
    ...continuityReferences,
    "Cinematic language: motivated camera movement, coherent blocking, natural light falloff, stable anatomy, consistent scale, no teleporting props.",
    "Output contract: one contiguous renderable scene segment matching requested duration and transition plan.",
  ];
  const optimized = options.semanticDedupe ? semanticDedupe(lines) : lines.map(normalizeSentence).filter(Boolean);
  const positive = trimToTokenBudget(optimized, options.maxTokens);
  const negative = semanticDedupe([
    scene.negativePrompt,
    "identity drift, character morphing, wardrobe changes, lighting reset, environment discontinuity, camera jump cut unless planned, duplicate limbs, unreadable text, UI chrome, watermark",
  ]).join(", ");
  return {
    provider: options.provider,
    positive,
    negative,
    metadata: {
      promptHash: createHash("sha256").update(positive).digest("hex"),
      continuityHash: createHash("sha256").update(scene.continuityPrompt).digest("hex"),
      optimizationPasses: ["provider-directives", "continuity-injection", options.semanticDedupe ? "semantic-dedupe" : "dedupe-disabled", "token-budget"],
      estimatedTokens: estimateTokens(positive),
    },
  };
}
