import type {
  CameraState,
  CharacterMemory,
  EnvironmentState,
  LightingState,
  ResolvedSceneNode,
  SceneGraphInput,
  SceneId,
  SceneNodeInput,
} from "./types.js";

const DEFAULT_CAMERA: CameraState = {
  framing: "medium cinematic frame",
  movement: "controlled dolly",
  lensMm: 35,
  aperture: "f/2.8",
};

const DEFAULT_LIGHTING: LightingState = {
  setup: "cinematic motivated key with soft fill",
  colorTemperature: "5600K",
  contrast: "cinematic",
};

const DEFAULT_ENVIRONMENT: EnvironmentState = {
  id: "default-environment",
  location: "unspecified cinematic location",
  timeOfDay: "continuous time",
  weather: "unchanged",
  persistentProps: [],
};

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function mergeDefined<T extends object>(base: T, overlay: Partial<T> | undefined): T {
  if (!overlay) return { ...base };
  return Object.fromEntries(
    Object.entries({ ...base, ...overlay }).filter(([, value]) => value !== undefined),
  ) as T;
}

export class SceneGraphEngine {
  private readonly byId: Map<SceneId, SceneNodeInput>;

  constructor(private readonly graph: SceneGraphInput) {
    this.byId = new Map(graph.scenes.map((scene) => [scene.id, scene]));
    this.validateReferences();
  }

  topologicalOrder(): SceneId[] {
    const visiting = new Set<SceneId>();
    const visited = new Set<SceneId>();
    const ordered: SceneId[] = [];

    const visit = (sceneId: SceneId, path: SceneId[]): void => {
      if (visited.has(sceneId)) return;
      if (visiting.has(sceneId)) {
        throw new Error(`scene graph cycle detected: ${[...path, sceneId].join(" -> ")}`);
      }
      const scene = this.requireScene(sceneId);
      visiting.add(sceneId);
      const dependencies = [...(scene.inheritsFrom ? [scene.inheritsFrom] : []), ...(scene.previousSceneIds ?? [])];
      for (const dependency of unique(dependencies)) visit(dependency, [...path, sceneId]);
      visiting.delete(sceneId);
      visited.add(sceneId);
      ordered.push(sceneId);
    };

    for (const scene of this.graph.scenes) visit(scene.id, []);
    return ordered;
  }

  resolveScenes(): ResolvedSceneNode[] {
    const resolved = new Map<SceneId, ResolvedSceneNode>();
    const characters = new Map((this.graph.characters ?? []).map((character) => [character.id, { ...character }]));

    for (const sceneId of this.topologicalOrder()) {
      const scene = this.requireScene(sceneId);
      const inherited = scene.inheritsFrom ? resolved.get(scene.inheritsFrom) : undefined;
      if (scene.inheritsFrom && !inherited) throw new Error(`scene ${scene.id} inherits unresolved scene ${scene.inheritsFrom}`);

      const previous = this.latestPrevious(scene, resolved);
      const policy = {
        inheritCamera: scene.continuityPolicy?.inheritCamera ?? true,
        inheritLighting: scene.continuityPolicy?.inheritLighting ?? true,
        persistEnvironment: scene.continuityPolicy?.persistEnvironment ?? true,
        carryCharacters: scene.continuityPolicy?.carryCharacters ?? true,
      };

      const cameraBase = policy.inheritCamera ? (previous?.camera ?? inherited?.camera ?? DEFAULT_CAMERA) : (inherited?.camera ?? DEFAULT_CAMERA);
      const lightingBase = policy.inheritLighting ? (previous?.lighting ?? inherited?.lighting ?? DEFAULT_LIGHTING) : (inherited?.lighting ?? DEFAULT_LIGHTING);
      const environmentBase = policy.persistEnvironment
        ? (previous?.environment ?? inherited?.environment ?? DEFAULT_ENVIRONMENT)
        : (inherited?.environment ?? DEFAULT_ENVIRONMENT);

      const inheritedCharacters = policy.carryCharacters ? (previous?.characterIds ?? inherited?.characterIds ?? []) : (inherited?.characterIds ?? []);
      const characterIds = unique([...(inheritedCharacters ?? []), ...(scene.characterIds ?? [])]);
      for (const [characterId, state] of Object.entries(scene.characterStateUpdates ?? {})) {
        const memory = characters.get(characterId);
        if (memory) characters.set(characterId, { ...memory, currentState: state });
      }

      const inheritedVisuals = unique([...(inherited?.visualReferenceIds ?? []), ...(previous?.visualReferenceIds ?? [])]);
      const environment = mergeDefined(environmentBase, scene.environment);
      environment.persistentProps = unique([...(environmentBase.persistentProps ?? []), ...(scene.environment?.persistentProps ?? [])]);

      const resolvedScene: ResolvedSceneNode = {
        id: scene.id,
        title: scene.title,
        description: scene.description,
        durationSeconds: scene.durationSeconds,
        previousSceneIds: scene.previousSceneIds ?? [],
        characterIds,
        visualReferenceIds: unique([...inheritedVisuals, ...(scene.visualReferenceIds ?? [])]),
        environment,
        camera: mergeDefined(cameraBase, scene.camera),
        lighting: mergeDefined(lightingBase, scene.lighting),
        continuityPolicy: policy,
        characterStateUpdates: scene.characterStateUpdates ?? {},
        transitionIn: scene.transitionIn ?? "cut",
        priority: scene.priority ?? inherited?.priority ?? 50,
      };
      if (scene.inheritsFrom !== undefined) resolvedScene.inheritsFrom = scene.inheritsFrom;
      resolved.set(scene.id, resolvedScene);
    }

    return this.topologicalOrder().map((id) => resolved.get(id) as ResolvedSceneNode);
  }

  private latestPrevious(scene: SceneNodeInput, resolved: Map<SceneId, ResolvedSceneNode>): ResolvedSceneNode | undefined {
    const previousIds = scene.previousSceneIds ?? [];
    if (previousIds.length === 0) return undefined;
    return resolved.get(previousIds[previousIds.length - 1] as SceneId);
  }

  private requireScene(sceneId: SceneId): SceneNodeInput {
    const scene = this.byId.get(sceneId);
    if (!scene) throw new Error(`unknown scene ${sceneId}`);
    return scene;
  }

  private validateReferences(): void {
    if (this.graph.scenes.length === 0) throw new Error("scene graph requires at least one scene");
    if (this.byId.size !== this.graph.scenes.length) throw new Error("scene ids must be unique");
    const characterIds = new Set((this.graph.characters ?? []).map((character) => character.id));
    const visualIds = new Set((this.graph.visualReferences ?? []).map((reference) => reference.id));
    for (const scene of this.graph.scenes) {
      if (scene.durationSeconds <= 0) throw new Error(`scene ${scene.id} duration must be positive`);
      for (const referenced of [...(scene.previousSceneIds ?? []), ...(scene.inheritsFrom ? [scene.inheritsFrom] : [])]) {
        if (!this.byId.has(referenced)) throw new Error(`scene ${scene.id} references missing scene ${referenced}`);
      }
      for (const characterId of scene.characterIds ?? []) {
        if (!characterIds.has(characterId)) throw new Error(`scene ${scene.id} references missing character ${characterId}`);
      }
      for (const characterId of Object.keys(scene.characterStateUpdates ?? {})) {
        if (!characterIds.has(characterId)) throw new Error(`scene ${scene.id} updates missing character ${characterId}`);
      }
      for (const visualId of scene.visualReferenceIds ?? []) {
        if (!visualIds.has(visualId)) throw new Error(`scene ${scene.id} references missing visual embedding ${visualId}`);
      }
    }
    this.topologicalOrder();
  }
}

export function cloneCharacterMemory(characters: CharacterMemory[] = []): CharacterMemory[] {
  return characters.map((character) => ({
    ...character,
    referenceAssetIds: [...character.referenceAssetIds],
    visualReferenceIds: [...character.visualReferenceIds],
  }));
}
