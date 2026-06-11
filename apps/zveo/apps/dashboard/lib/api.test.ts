import test from "node:test";
import assert from "node:assert/strict";

import { getHealth, getOpsSummary, getReadiness } from "./api";

test("getHealth parses /healthz response", async () => {
  const originalFetch = globalThis.fetch;
  process.env.ZVEO_API_URL = "http://localhost:8080";

  globalThis.fetch = (async (input: string | URL | Request) => {
    assert.equal(String(input), "http://localhost:8080/healthz");
    return new Response(JSON.stringify({ status: "ok", correlationId: "cid-health" }), { status: 200 });
  }) as typeof fetch;

  await assert.doesNotReject(async () => {
    const health = await getHealth();
    assert.deepEqual(health, { status: "ok", correlationId: "cid-health" });
  });

  globalThis.fetch = originalFetch;
});

test("getReadiness parses /readyz response", async () => {
  const originalFetch = globalThis.fetch;
  process.env.ZVEO_API_URL = "http://localhost:8080";

  globalThis.fetch = (async () => new Response(JSON.stringify({ status: "ready", correlationId: "cid-ready" }), { status: 200 })) as typeof fetch;

  const readiness = await getReadiness();
  assert.deepEqual(readiness, { status: "ready", correlationId: "cid-ready" });

  globalThis.fetch = originalFetch;
});

test("getOpsSummary parses successful summary payload", async () => {
  const originalFetch = globalThis.fetch;
  process.env.ZVEO_API_URL = "http://localhost:8080";

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({
      status: "ok",
      correlationId: "cid-ops",
      queue: { waiting: 2, active: 1, delayed: 0, completed: 10, failed: 1 },
      workers: { onlineEstimate: 1, heartbeatTtlMs: 30_000 }
    }), {
      status: 200
    })) as typeof fetch;

  const summary = await getOpsSummary();
  assert.deepEqual(summary, {
    status: "ok",
    correlationId: "cid-ops",
    queue: { waiting: 2, active: 1, delayed: 0, completed: 10, failed: 1 },
    workers: { onlineEstimate: 1, heartbeatTtlMs: 30_000 }
  });

  globalThis.fetch = originalFetch;
});

test("getOpsSummary parses graceful degraded payload when queue is unavailable", async () => {
  const originalFetch = globalThis.fetch;
  process.env.ZVEO_API_URL = "http://localhost:8080";

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({
      status: "degraded",
      correlationId: "cid-degraded",
      queue: { waiting: 0, active: 0, delayed: 0, completed: 0, failed: 0 },
      workers: { onlineEstimate: 0, heartbeatTtlMs: 30_000 }
    }), { status: 200 })) as typeof fetch;

  const summary = await getOpsSummary();
  assert.equal(summary.status, "degraded");
  assert.equal(summary.workers.onlineEstimate, 0);

  globalThis.fetch = originalFetch;
});

test("getOpsSummary rejects invalid payloads", async () => {
  const originalFetch = globalThis.fetch;
  process.env.ZVEO_API_URL = "http://localhost:8080";

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ status: "ok", correlationId: "cid-invalid" }), { status: 200 })) as typeof fetch;

  await assert.rejects(() => getOpsSummary());

  globalThis.fetch = originalFetch;
});
