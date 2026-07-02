import assert from "node:assert/strict";
import test from "node:test";

import { assertWakeupId, buildSystemdRunArgs, type WakeupRecord } from "../src/scheduler.js";

const record: WakeupRecord = {
  id: "a1b2c3d4e5f6",
  timerUnit: "codex-wakeup-a1b2c3d4e5f6.timer",
  serviceUnit: "codex-wakeup-a1b2c3d4e5f6.service",
  root: "/srv/example",
  delaySeconds: 270,
  reason: "next codex-flow iteration",
  promptSha256: "hash",
  outputPath: "/tmp/result.txt",
  createdAt: "2026-06-21T00:00:00.000Z",
};

test("buildSystemdRunArgs creates a sandboxed Codex invocation without a shell", () => {
  const args = buildSystemdRunArgs(
    record,
    { command: "/usr/bin/node", prefixArgs: ["/opt/codex/bin/codex.js"] },
    "Use $codex-flow",
  );

  assert.deepEqual(args.slice(0, 4), [
    "--user",
    "--unit=codex-wakeup-a1b2c3d4e5f6",
    "--description=Codex wakeup: next codex-flow iteration",
    "--on-active=270s",
  ]);
  assert.ok(args.includes("workspace-write"));
  assert.ok(args.includes('approval_policy="never"'));
  assert.ok(args.includes("/usr/bin/node"));
  assert.ok(args.includes("/opt/codex/bin/codex.js"));
  assert.equal(args.includes("--dangerously-bypass-approvals-and-sandbox"), false);
  assert.equal(args.at(-1), "Use $codex-flow");
});

test("assertWakeupId rejects values that could target arbitrary units", () => {
  assert.doesNotThrow(() => assertWakeupId("a1b2c3d4e5f6"));
  assert.throws(() => assertWakeupId("../ssh.service"), /Invalid wakeup ID/);
});
