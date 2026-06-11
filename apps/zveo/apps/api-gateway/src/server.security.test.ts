import test from "node:test";
import assert from "node:assert/strict";
import { redactSecrets } from "./server.js";

test("redacts authorization and provider keys", () => {
  const redacted = redactSecrets({
    authorization: "Bearer abc.def",
    metaToken: "EAAfoobar",
    openaiKey: "sk-live-123",
    nested: { providerKey: "secret-123" }
  }) as Record<string, unknown>;
  assert.equal(redacted.authorization, "[REDACTED]");
  assert.equal(redacted.metaToken, "[REDACTED]");
  assert.equal(redacted.openaiKey, "[REDACTED]");
  assert.deepEqual(redacted.nested, { providerKey: "[REDACTED]" });
});

test("redacts token-like strings", () => {
  const redacted = redactSecrets("Authorization: Bearer mytoken sk-secret EAA123") as string;
  assert.ok(redacted.includes("[REDACTED]"));
});
