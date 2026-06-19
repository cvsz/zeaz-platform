import { compileSceneGraph } from "./compiler.js";
import { InMemorySceneGraphCache, SceneGraphCache, type RedisLike } from "./cache.js";
import type { SceneGraphInput } from "./types.js";

export interface SceneGraphApiOptions {
  redis?: RedisLike;
  cacheTtlSeconds?: number;
}

export class SceneGraphRestApi {
  readonly cache: SceneGraphCache;

  constructor(options: SceneGraphApiOptions = {}) {
    this.cache = new SceneGraphCache(options.redis ?? new InMemorySceneGraphCache(), "zveo:scene-graph", options.cacheTtlSeconds ?? 900);
  }

  async compile(input: SceneGraphInput): Promise<Response> {
    try {
      const cached = await this.cache.getCompiled(input.id);
      if (cached) return this.json({ status: "cached", compiled: cached });
      const compiled = compileSceneGraph(input);
      await this.cache.setCompiled(compiled);
      return this.json({ status: "compiled", compiled }, 201);
    } catch (error) {
      return this.json({ error: error instanceof Error ? error.message : "unknown scene graph error" }, 400);
    }
  }

  async get(workflowId: string): Promise<Response> {
    const compiled = await this.cache.getCompiled(workflowId);
    if (!compiled) return this.json({ error: "compiled scene graph not found" }, 404);
    return this.json({ status: "cached", compiled });
  }

  async invalidate(workflowId: string): Promise<Response> {
    await this.cache.invalidate(workflowId);
    return this.json({ status: "invalidated", workflowId });
  }

  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);
    if (request.method === "POST" && url.pathname === "/scene-graphs/compile") {
      return this.compile((await request.json()) as SceneGraphInput);
    }
    if (parts[0] === "scene-graphs" && parts[1]) {
      if (request.method === "GET") return this.get(parts[1]);
      if (request.method === "DELETE") return this.invalidate(parts[1]);
    }
    return this.json({ error: "not found" }, 404);
  }

  private json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });
  }
}
