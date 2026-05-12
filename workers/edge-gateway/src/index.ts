import { validateJwt } from "../../shared/jwt";
import { enforceKvRateLimit } from "../../shared/kv-rate-limit";
import { withSecurityHeaders } from "../../shared/security-headers";

interface Env {
  JWT_SECRET: string;
  JWT_AUDIENCE: string;
  EDGE_RATE_LIMIT_KV: KVNamespace;
  EDGE_USE_DURABLE_LIMITER?: "true" | "false";
  EDGE_DURABLE_LIMITER?: DurableObjectNamespace;
}

interface RateDecision { allowed: boolean; retryAfterSec: number; remaining: number }

const ROUTE_POLICIES: Record<string, { capacity: number; refillPerSecond: number }> = {
  "POST:/v1/generate": { capacity: 20, refillPerSecond: 0.5 },
  "POST:/v1/publish": { capacity: 10, refillPerSecond: 0.25 },
};

function logJson(level: "info" | "warn" | "error", event: string, data: Record<string, unknown>): void {
  console.log(JSON.stringify({ ts: new Date().toISOString(), service: "edge-gateway", level, event, ...data }));
}

async function enforceRateLimit(env: Env, key: string, routeKey: string): Promise<RateDecision> {
  const policy = ROUTE_POLICIES[routeKey] ?? { capacity: 120, refillPerSecond: 2 };
  if (env.EDGE_USE_DURABLE_LIMITER === "true" && env.EDGE_DURABLE_LIMITER) {
    const id = env.EDGE_DURABLE_LIMITER.idFromName("edge-global");
    const stub = env.EDGE_DURABLE_LIMITER.get(id);
    const response = await stub.fetch("https://rate-limiter.internal/consume", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, policy }),
    });
    if (!response.ok) throw new Error(`durable_rate_limiter_failed:${response.status}`);
    return (await response.json()) as RateDecision;
  }

  const result = await enforceKvRateLimit(env.EDGE_RATE_LIMIT_KV, key, policy, 180);
  return { allowed: result.allowed, retryAfterSec: result.retryAfterSec, remaining: result.remaining };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const routeKey = `${request.method}:${url.pathname}`;
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      logJson("warn", "missing_authorization", { routeKey });
      return withSecurityHeaders(new Response(JSON.stringify({ error: "missing_authorization" }), { status: 401 }));
    }

    let sub = "unknown";
    try {
      const payload = await validateJwt(authHeader.slice(7), env.JWT_SECRET, env.JWT_AUDIENCE);
      sub = payload.sub;
    } catch (error) {
      logJson("warn", "jwt_validation_failed", { routeKey, reason: String(error) });
      return withSecurityHeaders(new Response(JSON.stringify({ error: "invalid_token" }), { status: 401 }));
    }

    const key = `user:${sub}:route:${routeKey}`;
    const rate = await enforceRateLimit(env, key, routeKey);
    if (!rate.allowed) {
      logJson("warn", "rate_limited", { routeKey, sub, retryAfterSec: rate.retryAfterSec, remaining: rate.remaining });
      return withSecurityHeaders(new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { "retry-after": String(rate.retryAfterSec) } }));
    }

    logJson("info", "request_accepted", { routeKey, sub, remaining: rate.remaining });
    return withSecurityHeaders(new Response(JSON.stringify({ ok: true, routeKey, sub, remaining: rate.remaining }), { status: 200, headers: { "content-type": "application/json" } }));
  },
};
