import { withSecurityHeaders } from "../../shared/security-headers";
import { validateJwt } from "../../shared/jwt";
import { enforceKvRateLimit } from "../../shared/kv-rate-limit";

interface Env { JWT_SECRET: string; JWT_AUDIENCE: string; EDGE_RATE_LIMIT_KV: KVNamespace }

function logJson(level: "info" | "warn" | "error", event: string, data: Record<string, unknown>): void {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, event, ...data }));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const routeKey = `${request.method}:${new URL(request.url).pathname}`;
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

    const rate = await enforceKvRateLimit(env.EDGE_RATE_LIMIT_KV, `user:${sub}:route:${routeKey}`, { capacity: 120, refillPerSecond: 2 });
    if (!rate.allowed) {
      logJson("warn", "rate_limited", { routeKey, sub, retryAfterSec: rate.retryAfterSec });
      return withSecurityHeaders(new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { "retry-after": String(rate.retryAfterSec) } }));
    }
    logJson("info", "request_accepted", { routeKey, sub });
    return withSecurityHeaders(new Response(JSON.stringify({ ok: true, routeKey, sub }), { status: 200, headers: { "content-type": "application/json" } }));
  }
};
