import type { CompiledSceneGraph, SceneGraphInput } from "./types.js";

export interface RedisLike {
  get(key: string): Promise<string | null> | string | null;
  set(key: string, value: string, mode?: "EX", seconds?: number): Promise<unknown> | unknown;
  del?(key: string): Promise<unknown> | unknown;
}

export class InMemorySceneGraphCache {
  private readonly values = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const record = this.values.get(key);
    if (!record) return null;
    if (record.expiresAt !== undefined && record.expiresAt <= Date.now()) {
      this.values.delete(key);
      return null;
    }
    return record.value;
  }

  async set(key: string, value: string, mode?: "EX", seconds?: number): Promise<void> {
    const expiresAt = mode === "EX" && seconds !== undefined ? Date.now() + seconds * 1000 : undefined;
    this.values.set(key, expiresAt === undefined ? { value } : { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.values.delete(key);
  }
}

export class SceneGraphCache {
  constructor(
    private readonly redis: RedisLike,
    private readonly namespace = "zveo:scene-graph",
    private readonly ttlSeconds = 900,
  ) {}

  key(workflowId: string): string {
    return `${this.namespace}:${workflowId}`;
  }

  async getCompiled(workflowId: string): Promise<CompiledSceneGraph | null> {
    const value = await this.redis.get(this.key(workflowId));
    return value ? (JSON.parse(value) as CompiledSceneGraph) : null;
  }

  async setCompiled(graph: CompiledSceneGraph): Promise<void> {
    await this.redis.set(this.key(graph.workflowId), JSON.stringify(graph), "EX", this.ttlSeconds);
  }

  async invalidate(workflowId: string): Promise<void> {
    await this.redis.del?.(this.key(workflowId));
  }

  static fingerprint(input: SceneGraphInput): string {
    return Buffer.from(JSON.stringify(input)).toString("base64url");
  }
}
