import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { MediaPipelinePlanner, assertPipelineTransition, renderSrt } from "../src/index.js";
import type { AssetRecord } from "@zveo/core";

function asset(tenantId: string, workflowId: string, objectKey: string): AssetRecord {
  return {
    id: randomUUID(), tenantId, workflowId, kind: "video", bucket: "zveo-renders", objectKey, contentType: "video/mp4", bytes: 1024,
    sha256: "a".repeat(64), version: 1, metadata: {},
  };
}

test("media pipeline planner creates resumable deterministic export plan", () => {
  const tenantId = randomUUID();
  const workflowId = randomUUID();
  const planner = new MediaPipelinePlanner();
  const plan = planner.createPlan({
    commandId: randomUUID(), workflowId, tenantId, idempotencyKey: "pipeline-idempotency-key", requestedBy: randomUUID(),
    renderArtifacts: [
      { sceneId: "s1", asset: asset(tenantId, workflowId, "renders/s1.mp4"), startSeconds: 0, durationSeconds: 2, checksumVerified: true },
      { sceneId: "s2", asset: asset(tenantId, workflowId, "renders/s2.mp4"), startSeconds: 2, durationSeconds: 3, checksumVerified: true },
    ],
    exportProfiles: [{ platform: "youtube", width: 1920, height: 1080, videoBitrateKbps: 12000 }],
    beatMarkers: [{ id: "b1", atSeconds: 2, strength: 1 }],
    subtitleCues: [{ id: "c1", startSeconds: 0, endSeconds: 1.5, text: "Opening line" }],
  });
  assert.equal(plan.workflowId, workflowId);
  assert.equal(plan.exportManifests.length, 1);
  assert.match(plan.ffmpegFilterGraph, /concat=n=2/);
  assert.equal(plan.checkpoints.at(-1)?.stage, "checksummed");
});

test("media pipeline rejects invalid stage transition", () => {
  assert.throws(() => assertPipelineTransition("submitted", "published"), /invalid media pipeline transition/);
});

test("subtitle renderer emits SRT timestamps", () => {
  assert.match(renderSrt([{ id: "cue", startSeconds: 1.2, endSeconds: 2.4, text: "Hello" }]), /00:00:01,200 --> 00:00:02,400/);
});
