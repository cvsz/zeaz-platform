import { cloneCharacterMemory, SceneGraphEngine } from "./graph.js";
import type {
  CharacterMemory,
  CompiledScene,
  CompiledSceneGraph,
  ResolvedSceneNode,
  SceneGraphInput,
  TimelineSegment,
  TransitionPlan,
  VisualEmbeddingReference,
} from "./types.js";

export interface SceneCompilerOptions {
  negativePrompt?: string;
  transitionDurations?: Partial<Record<string, number>>;
}

const DEFAULT_NEGATIVE_PROMPT = "watermark, logo, identity drift, wardrobe drift, environment reset, flicker, temporal jitter, broken anatomy, UI chrome";

export class SceneCompiler {
  private readonly engine: SceneGraphEngine;

  constructor(
    private readonly graph: SceneGraphInput,
    private readonly options: SceneCompilerOptions = {},
  ) {
    this.engine = new SceneGraphEngine(graph);
  }

  compile(): CompiledSceneGraph {
    const scenes = this.engine.resolveScenes();
    const visualReferences = new Map((this.graph.visualReferences ?? []).map((reference) => [reference.id, reference]));
    const characterMemory = new Map((this.graph.characters ?? []).map((character) => [character.id, { ...character }]));
    const timeline: TimelineSegment[] = [];
    const compiledScenes: CompiledScene[] = [];
    let cursor = 0;

    scenes.forEach((scene, order) => {
      this.applyCharacterUpdates(characterMemory, scene);
      const previousSegment = timeline[timeline.length - 1];
      const transitionPlan = this.planTransition(scene, previousSegment?.sceneId);
      const segment: TimelineSegment = {
        sceneId: scene.id,
        startSeconds: cursor,
        endSeconds: cursor + scene.durationSeconds,
        transition: transitionPlan,
      };
      timeline.push(segment);
      cursor = segment.endSeconds;

      const sceneCharacters = scene.characterIds
        .map((id) => characterMemory.get(id))
        .filter((character): character is CharacterMemory => character !== undefined);
      const sceneVisuals = scene.visualReferenceIds
        .map((id) => visualReferences.get(id))
        .filter((reference): reference is VisualEmbeddingReference => reference !== undefined);
      const continuityPrompt = this.buildContinuityPrompt(scene, sceneCharacters, sceneVisuals, transitionPlan);

      compiledScenes.push({
        workflowId: this.graph.id,
        scene,
        order,
        timeline: segment,
        continuityPrompt,
        prompt: this.buildPrompt(scene, continuityPrompt),
        negativePrompt: this.options.negativePrompt ?? DEFAULT_NEGATIVE_PROMPT,
        characterMemory: cloneCharacterMemory(sceneCharacters),
        visualReferences: sceneVisuals.map((reference) => ({ ...reference, assetIds: [...reference.assetIds], tags: [...reference.tags] })),
        transitionPlan,
        metadata: {
          targetPlatforms: this.graph.targetPlatforms ?? ["youtube"],
          previousSceneIds: scene.previousSceneIds,
          inheritsFrom: scene.inheritsFrom,
          environmentId: scene.environment.id,
        },
      });
    });

    return {
      workflowId: this.graph.id,
      name: this.graph.name,
      orderedSceneIds: scenes.map((scene) => scene.id),
      timeline,
      scenes: compiledScenes,
      totalDurationSeconds: cursor,
    };
  }

  private applyCharacterUpdates(memory: Map<string, CharacterMemory>, scene: ResolvedSceneNode): void {
    for (const [characterId, currentState] of Object.entries(scene.characterStateUpdates)) {
      const character = memory.get(characterId);
      if (character) memory.set(characterId, { ...character, currentState });
    }
  }

  private planTransition(scene: ResolvedSceneNode, previousSceneId?: string): TransitionPlan {
    const durationSeconds = this.options.transitionDurations?.[scene.transitionIn] ?? (scene.transitionIn === "cut" ? 0 : 1.25);
    const fromSceneId = scene.previousSceneIds[scene.previousSceneIds.length - 1] ?? previousSceneId;
    const plan: TransitionPlan = {
      toSceneId: scene.id,
      kind: scene.transitionIn,
      durationSeconds,
      rationale: fromSceneId
        ? `Bridge ${fromSceneId} into ${scene.id} while preserving camera, lighting, and environment continuity.`
        : `Open ${scene.id} with the graph baseline continuity state.`,
      cameraBridge: `${scene.camera.framing}; ${scene.camera.movement}; ${scene.camera.lensMm}mm lens continuity`,
      lightingBridge: `${scene.lighting.setup}; ${scene.lighting.colorTemperature}; ${scene.lighting.contrast} contrast continuity`,
    };
    if (fromSceneId !== undefined) plan.fromSceneId = fromSceneId;
    return plan;
  }

  private buildContinuityPrompt(
    scene: ResolvedSceneNode,
    characters: CharacterMemory[],
    visualReferences: VisualEmbeddingReference[],
    transition: TransitionPlan,
  ): string {
    const characterLines = characters.map((character) => [
      `Character ${character.name} (${character.id})`,
      `appearance=${character.appearance}`,
      `wardrobe=${character.wardrobe}`,
      character.voice ? `voice=${character.voice}` : undefined,
      character.currentState ? `state=${character.currentState}` : undefined,
      character.visualReferenceIds.length ? `visual_refs=${character.visualReferenceIds.join(",")}` : undefined,
    ].filter(Boolean).join("; "));

    const visualLines = visualReferences.map((reference) =>
      `Visual embedding ${reference.id}: ${reference.embeddingUri}; ${reference.description}; weight=${reference.weight ?? 1}`,
    );

    return [
      `Environment persistence: ${scene.environment.id}; ${scene.environment.location}; ${scene.environment.timeOfDay}; ${scene.environment.weather}`,
      `Persistent props: ${scene.environment.persistentProps.join(", ") || "none"}`,
      `Camera continuity: ${scene.camera.framing}, ${scene.camera.movement}, ${scene.camera.lensMm}mm${scene.camera.aperture ? `, ${scene.camera.aperture}` : ""}`,
      `Lighting continuity: ${scene.lighting.setup}, ${scene.lighting.colorTemperature}, ${scene.lighting.contrast}`,
      `Transition plan: ${transition.kind} from ${transition.fromSceneId ?? "opening"} to ${transition.toSceneId}; ${transition.rationale}`,
      ...characterLines,
      ...visualLines,
    ].join("\n");
  }

  private buildPrompt(scene: ResolvedSceneNode, continuityPrompt: string): string {
    return [
      "Generate production-grade cinematic video with stable identity, temporal coherence, and realistic physics.",
      `Project style guide: ${this.graph.styleGuide}`,
      `Scene: ${scene.title}`,
      `Action: ${scene.description}`,
      continuityPrompt,
      "Quality bar: coherent timeline stitching, no unexpected camera jump, no lighting reset, no character drift.",
    ].join("\n");
  }
}

export function compileSceneGraph(graph: SceneGraphInput, options?: SceneCompilerOptions): CompiledSceneGraph {
  return new SceneCompiler(graph, options).compile();
}
