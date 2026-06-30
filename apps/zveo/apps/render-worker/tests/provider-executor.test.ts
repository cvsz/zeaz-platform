import test from "node:test";
import assert from "node:assert/strict";
import { Logger } from "@zveo/core";
import type { RenderJobPayload } from "@zveo/contracts";
import { createProviderRegistry, executeProviderRender } from "../src/provider-executor.js";

const logger = new Logger({ service: "render-worker-test" });
const payload: RenderJobPayload = {
  jobId: "11111111-1111-4111-8111-111111111111",
  workflowId: "22222222-2222-4222-8222-222222222222",
  tenantId: "33333333-3333-4333-8333-333333333333",
  sceneId: "scene-1",
  provider: "veo",
  prompt: "render this",
  negativePrompt: "",
  continuity: {
    characterMemory: [], visualReferences: [],
    camera: { framing: "close", movement: "static", lensMm: 35 },
    lighting: { setup: "soft", colorTemperature: "5600K", contrast: "medium" },
    environment: { id: "env-1", location: "studio", timeOfDay: "day", weather: "clear", persistentProps: [] },
  },
  output: { bucket: "output-bucket", keyPrefix: "renders/wf-1", expectedMimeType: "video/mp4" },
  attempt: 1, priority: 50, idempotencyKey: "idem-key-1234", correlationId: "44444444-4444-4444-8444-444444444444",
};

test("createProviderRegistry throws for missing provider config in production", () => {
  assert.throws(() => createProviderRegistry({ nodeEnv: "production", providerTimeoutMs: 10_000, veo: {}, googleFlow: {}, nanoBanana: {} }, logger), /Missing API Key configuration for veo/);
});

test("createProviderRegistry allows mock mode for missing config", async () => {
  const registry = createProviderRegistry({ nodeEnv: "test", providerTimeoutMs: 10_000, veo: {}, googleFlow: {}, nanoBanana: {} }, logger);
  const result = await executeProviderRender(registry, payload);
  assert.equal(result.status, "completed");
});

test("executeProviderRender returns provider result via registry", async () => {
  const fetchImpl: typeof fetch = async () => new Response(JSON.stringify({ request_id: "provider-job-123", status: "submitted", artifactUri: "s3://bucket/path.mp4", metadata: { accepted: true } }), { status: 200, headers: { "content-type": "application/json" } });
  const registry = createProviderRegistry({ nodeEnv: "production", providerTimeoutMs: 10_000, veo: { endpoint: "https://provider.local", apiKey: "token" }, googleFlow: { endpoint: "https://provider.local" }, nanoBanana: { endpoint: "https://provider.local" } }, logger, fetchImpl);
  const result = await executeProviderRender(registry, payload);
  assert.equal(result.providerJobId, "provider-job-123");
});
