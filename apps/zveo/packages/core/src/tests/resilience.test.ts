import test from "node:test";
import assert from "node:assert/strict";
import { Bulkhead, BulkheadRejectedError, TokenBucketRateLimiter, planWorkflowRecovery } from "../index.js";

test("token bucket rate limiter refills and returns retry guidance", () => {
  let now = 0;
  const limiter = new TokenBucketRateLimiter({ capacity: 2, refillTokens: 1, refillIntervalMs: 1000, now: () => now });
  assert.equal(limiter.take("tenant-a").allowed, true);
  assert.equal(limiter.take("tenant-a").allowed, true);
  const rejected = limiter.take("tenant-a");
  assert.equal(rejected.allowed, false);
  assert.equal(rejected.retryAfterMs, 1000);
  now = 1000;
  assert.equal(limiter.take("tenant-a").allowed, true);
});

test("bulkhead rejects when active and waiting capacity are exhausted", async () => {
  const bulkhead = new Bulkhead({ name: "provider:veo", maxConcurrent: 1, maxQueue: 0 });
  let release!: () => void;
  const active = bulkhead.execute(async () => await new Promise<void>((resolve) => { release = resolve; }));
  await assert.rejects(() => bulkhead.execute(async () => undefined), BulkheadRejectedError);
  release();
  await active;
});

test("workflow recovery skips completed scenes and requeues stale partial failures", () => {
  const plan = planWorkflowRecovery({
    workflowId: "11111111-1111-4111-8111-111111111111",
    tenantId: "22222222-2222-4222-8222-222222222222",
    state: "recovering",
    completedSceneIds: ["scene-1"],
    queuedSceneIds: ["scene-1", "scene-2", "scene-3"],
    failedSceneIds: ["scene-4"],
    assetKeys: [],
    updatedAt: "2026-05-06T00:00:00.000Z",
  }, [{
    jobId: "33333333-3333-4333-8333-333333333333",
    sceneId: "scene-2",
    idempotencyKey: "workflow:scene-2",
    state: "running",
    attemptsMade: 1,
    lastHeartbeatAt: "2026-05-06T00:00:00.000Z",
  }, {
    jobId: "44444444-4444-4444-8444-444444444444",
    sceneId: "scene-1",
    idempotencyKey: "workflow:scene-1",
    state: "succeeded",
    attemptsMade: 1,
    outputKey: "renders/scene-1.mp4",
  }], new Date("2026-05-06T00:05:00.000Z"));

  assert.deepEqual(plan.skipSceneIds, ["scene-1"]);
  assert.deepEqual(plan.resumeSceneIds, ["scene-2", "scene-3", "scene-4"]);
  assert.deepEqual(plan.requeueJobIds, ["33333333-3333-4333-8333-333333333333"]);
});
