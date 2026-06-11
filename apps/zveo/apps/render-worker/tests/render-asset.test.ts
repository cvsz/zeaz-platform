import test from "node:test";
import assert from "node:assert/strict";
import type { RenderJobPayload } from "@zveo/contracts";
import { buildRenderAssetRecord } from "../src/render-asset.js";

const payload: RenderJobPayload = {
  jobId: "11111111-1111-4111-8111-111111111111",
  workflowId: "22222222-2222-4222-8222-222222222222",
  tenantId: "33333333-3333-4333-8333-333333333333",
  sceneId: "scene-1",
  provider: "veo",
  prompt: "render this",
  negativePrompt: "",
  continuity: { characterMemory: [], visualReferences: [], camera: { framing: "close", movement: "static", lensMm: 35 }, lighting: { setup: "soft", colorTemperature: "5600K", contrast: "medium" }, environment: { id: "env-1", location: "studio", timeOfDay: "day", weather: "clear", persistentProps: [] } },
  output: { bucket: "output-bucket", keyPrefix: "renders/wf-1", expectedMimeType: "video/mp4" },
  attempt: 1, priority: 50, idempotencyKey: "idem-key-1234", correlationId: "44444444-4444-4444-8444-444444444444",
};

test("buildRenderAssetRecord creates workflow-linked video asset for completion", () => {
  const asset = buildRenderAssetRecord(payload, { providerJobId: "provider-123", status: "completed", artifactUri: "s3://bucket/renders/wf-1.mp4" });
  assert.ok(asset);
  assert.equal(asset?.kind, "video");
  assert.equal(asset?.workflowId, payload.workflowId);
  assert.equal(asset?.metadata.sceneId, payload.sceneId);
});
