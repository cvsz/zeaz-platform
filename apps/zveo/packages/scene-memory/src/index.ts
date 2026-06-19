import { createHash } from "node:crypto";
import { characterMemorySchema, environmentSchema, visualReferenceSchema, type SceneGraph } from "@zveo/contracts";
import { Logger } from "@zveo/core";

export interface SceneMemorySnapshot {
  readonly workflowId: string;
  readonly sceneId: string;
  readonly characters: readonly ReturnType<typeof characterMemorySchema.parse>[];
  readonly visualReferences: readonly ReturnType<typeof visualReferenceSchema.parse>[];
  readonly environment?: ReturnType<typeof environmentSchema.parse>;
  readonly continuityHash: string;
  readonly updatedAt: string;
}

export interface SceneMemoryStore {
  load(workflowId: string, sceneId: string): Promise<SceneMemorySnapshot | undefined>;
  save(snapshot: SceneMemorySnapshot): Promise<void>;
  list(workflowId: string): Promise<readonly SceneMemorySnapshot[]>;
}

export class InMemorySceneMemoryStore implements SceneMemoryStore {
  private readonly snapshots = new Map<string, SceneMemorySnapshot>();
  async load(workflowId: string, sceneId: string): Promise<SceneMemorySnapshot | undefined> { return this.snapshots.get(`${workflowId}:${sceneId}`); }
  async save(snapshot: SceneMemorySnapshot): Promise<void> { this.snapshots.set(`${snapshot.workflowId}:${snapshot.sceneId}`, snapshot); }
  async list(workflowId: string): Promise<readonly SceneMemorySnapshot[]> { return [...this.snapshots.values()].filter((snapshot) => snapshot.workflowId === workflowId); }
}

export class SceneMemoryService {
  constructor(private readonly store: SceneMemoryStore = new InMemorySceneMemoryStore(), private readonly logger = new Logger({ service: "scene-memory" })) {}

  async materialize(graph: SceneGraph): Promise<readonly SceneMemorySnapshot[]> {
    const snapshots: SceneMemorySnapshot[] = [];
    const characters = new Map(graph.characters.map((character) => [character.id, character]));
    const references = new Map(graph.visualReferences.map((reference) => [reference.id, reference]));
    let inheritedEnvironment = graph.scenes[0]?.environment;

    for (const scene of graph.scenes) {
      const sceneCharacters = scene.characterIds.map((id) => characters.get(id)).filter((value): value is NonNullable<typeof value> => value !== undefined);
      const sceneReferences = scene.visualReferenceIds.map((id) => references.get(id)).filter((value): value is NonNullable<typeof value> => value !== undefined);
      const environment = scene.environment ?? inheritedEnvironment;
      if (scene.continuityPolicy.persistEnvironment !== false && environment) inheritedEnvironment = environment;
      const snapshot: SceneMemorySnapshot = {
        workflowId: graph.id,
        sceneId: scene.id,
        characters: sceneCharacters.map((character) => characterMemorySchema.parse({ ...character, currentState: scene.characterStateUpdates[character.id] ?? character.currentState })),
        visualReferences: sceneReferences.map((reference) => visualReferenceSchema.parse(reference)),
        ...(environment === undefined ? {} : { environment: environmentSchema.parse(environment) }),
        continuityHash: continuityHash({ sceneId: scene.id, sceneCharacters, sceneReferences, environment }),
        updatedAt: new Date().toISOString(),
      };
      await this.store.save(snapshot);
      snapshots.push(snapshot);
      this.logger.info("scene memory snapshot materialized", { workflowId: graph.id, sceneId: scene.id, characterCount: snapshot.characters.length, visualReferenceCount: snapshot.visualReferences.length });
    }
    return snapshots;
  }

  async get(workflowId: string, sceneId: string): Promise<SceneMemorySnapshot | undefined> { return this.store.load(workflowId, sceneId); }
  async list(workflowId: string): Promise<readonly SceneMemorySnapshot[]> { return this.store.list(workflowId); }
}

export function continuityHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
