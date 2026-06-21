import test from "node:test";
import assert from "node:assert/strict";

import {
  buildArtifactBackedPipelineCommand,
  getCampaigns,
  getHealth,
  getOpsSummary,
  getProvidersHealth,
  getReadiness,
  getWorkflows,
  submitMediaPipeline,
  type WorkflowDetail,
} from "./api";

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

test("getCampaigns adds a service bearer token", async () => {
  const originalFetch = globalThis.fetch;
  process.env.ZVEO_API_URL = "http://localhost:8080";
  process.env.AUTH_SHARED_SECRET = "development-only-signing-key-change-before-production";
  process.env.ZVEO_SERVICE_SUBJECT = "00000000-0000-4000-8000-000000000101";
  process.env.ZVEO_SERVICE_TENANT_ID = "00000000-0000-4000-8000-000000000102";
  process.env.ZVEO_SERVICE_ROLES = "service";

  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    assert.equal(String(input), "http://localhost:8080/v1/campaigns");
    const headers = new Headers(init?.headers);
    assert.match(headers.get("authorization") ?? "", /^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    return new Response(JSON.stringify({ correlationId: "cid-campaigns", campaigns: [] }), { status: 200 });
  }) as typeof fetch;

  const campaigns = await getCampaigns();
  assert.deepEqual(campaigns, []);

  globalThis.fetch = originalFetch;
});

test("getWorkflows adds a service bearer token", async () => {
  const originalFetch = globalThis.fetch;
  process.env.ZVEO_API_URL = "http://localhost:8080";
  process.env.AUTH_SHARED_SECRET = "development-only-signing-key-change-before-production";

  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    assert.match(headers.get("authorization") ?? "", /^Bearer /);
    return new Response(JSON.stringify({ correlationId: "cid-workflows", workflows: [] }), { status: 200 });
  }) as typeof fetch;

  const workflows = await getWorkflows();
  assert.deepEqual(workflows, []);

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

test("getProvidersHealth falls back when the provider endpoint is missing", async () => {
  const originalFetch = globalThis.fetch;
  process.env.ZVEO_API_URL = "http://localhost:8080";

  globalThis.fetch = (async () => new Response("missing", { status: 404 })) as typeof fetch;

  const providers = await getProvidersHealth();
  assert.equal(providers.length, 3);
  assert.equal(providers[0]?.status, "offline");

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

test("buildArtifactBackedPipelineCommand derives artifact-backed payloads", () => {
  const detail: WorkflowDetail = {
    correlationId: "cid-detail",
    workflow: {
      id: "11111111-1111-4111-8111-111111111111",
      state: "queued",
      tenantId: "22222222-2222-4222-8222-222222222222",
      createdAt: "2026-06-21T00:00:00.000Z",
      updatedAt: "2026-06-21T00:01:00.000Z",
      correlationId: "cid-workflow",
      sceneGraph: {
        id: "scene-graph-1",
        name: "Launch teaser",
        styleGuide: "Cinematic and premium",
        targetPlatforms: ["youtube"],
        scenes: [
          { id: "scene-1", title: "Hook", description: "Open with the strongest promise", durationSeconds: 6 },
          { id: "scene-2", title: "Proof", description: "Show the product in action", durationSeconds: 9 },
        ],
      },
    },
    jobs: [
      { id: "33333333-3333-4333-8333-333333333333", state: "queued", sceneId: "scene-1", createdAt: "2026-06-21T00:00:10.000Z", correlationId: "cid-job-1" },
      { id: "44444444-4444-4444-8444-444444444444", state: "queued", sceneId: "scene-2", createdAt: "2026-06-21T00:00:20.000Z", correlationId: "cid-job-2" },
    ],
    assets: [
      {
        id: "55555555-5555-4555-8555-555555555555",
        tenantId: "22222222-2222-4222-8222-222222222222",
        workflowId: "11111111-1111-4111-8111-111111111111",
        kind: "video",
        bucket: "zveo-renders",
        objectKey: "22222222-2222-4222-8222-222222222222/11111111-1111-4111-8111-111111111111/scene-1/33333333-3333-4333-8333-333333333333.mp4",
        contentType: "video/mp4",
        bytes: 6144,
        sha256: "a".repeat(64),
        version: 1,
        metadata: { sceneId: "scene-1", checksumVerified: true },
      },
      {
        id: "66666666-6666-4666-8666-666666666666",
        tenantId: "22222222-2222-4222-8222-222222222222",
        workflowId: "11111111-1111-4111-8111-111111111111",
        kind: "video",
        bucket: "zveo-renders",
        objectKey: "22222222-2222-4222-8222-222222222222/11111111-1111-4111-8111-111111111111/scene-2/44444444-4444-4444-8444-444444444444.mp4",
        contentType: "video/mp4",
        bytes: 9216,
        sha256: "b".repeat(64),
        version: 1,
        metadata: { sceneId: "scene-2", checksumVerified: true },
      },
    ],
    exportManifests: [],
    publishReadyVideos: [],
  };

  const command = buildArtifactBackedPipelineCommand(detail, {
    tenantId: detail.workflow.tenantId ?? "",
    requestedBy: "77777777-7777-4777-8777-777777777777",
  });

  assert.match(command.commandId, /^[0-9a-f-]{36}$/);
  assert.equal(command.renderArtifacts.length, 2);
  assert.equal(command.renderArtifacts[0]?.startSeconds, 0);
  assert.equal(command.renderArtifacts[1]?.startSeconds, 6);
  assert.equal(command.beatMarkers.length, 2);
  assert.match(command.subtitleCues[0]?.text ?? "", /Hook/);
});

test("submitMediaPipeline posts the planner payload to the workflow endpoint", async () => {
  const originalFetch = globalThis.fetch;
  process.env.ZVEO_API_URL = "http://localhost:8080";
  process.env.AUTH_SHARED_SECRET = "development-only-signing-key-change-before-production";
  process.env.ZVEO_SERVICE_SUBJECT = "00000000-0000-4000-8000-000000000101";
  process.env.ZVEO_SERVICE_TENANT_ID = "00000000-0000-4000-8000-000000000102";
  process.env.ZVEO_SERVICE_ROLES = "service";

  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    assert.equal(String(input), "http://localhost:8080/v1/workflows/11111111-1111-4111-8111-111111111111/media-pipelines");
    const headers = new Headers(init?.headers);
    assert.match(headers.get("authorization") ?? "", /^Bearer /);
    const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
    assert.equal(body.workflowId, "11111111-1111-4111-8111-111111111111");
    assert.equal(Array.isArray(body.renderArtifacts), true);
    assert.equal(Array.isArray(body.exportProfiles), true);
    return new Response(JSON.stringify({
      workflowId: "11111111-1111-4111-8111-111111111111",
      tenantId: "22222222-2222-4222-8222-222222222222",
      commandId: "88888888-8888-4888-8888-888888888888",
      stages: [],
      checkpoints: [],
      ffmpegFilterGraph: "concat=n=2:v=1:a=1[vout][aout]",
      exportManifests: [],
      correlationId: "cid-plan",
      traceId: "trace-plan",
    }), { status: 202 });
  }) as typeof fetch;

  const response = await submitMediaPipeline("11111111-1111-4111-8111-111111111111", {
    commandId: "99999999-9999-4999-8999-999999999999",
    workflowId: "11111111-1111-4111-8111-111111111111",
    tenantId: "22222222-2222-4222-8222-222222222222",
    idempotencyKey: "pipeline-11111111-1111-4111-8111-111111111111-99999999-9999-4999-8999-999999999999",
    renderArtifacts: [],
    exportProfiles: [],
    beatMarkers: [],
    subtitleCues: [],
    retryPolicy: {},
    requestedBy: "77777777-7777-4777-8777-777777777777",
  } as never);

  assert.equal(response.traceId, "trace-plan");

  globalThis.fetch = originalFetch;
});
