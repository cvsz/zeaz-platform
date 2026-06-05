#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'security/runtime/csp-engine.ts',
  'security/runtime/nonce-service.ts',
  'security/runtime/trusted-types-enforcer.ts',
  'security/runtime/exploit-detector.ts',
  'security/runtime/runtime-attestation.ts',
  'security/runtime/integrity-monitor.ts',
  'security/runtime/telemetry-pipeline.ts',
  'security/runtime/autonomous-response.ts',
  'security/runtime/runtime-middleware.ts',
  'frontend/isolation/wasm-executor.ts',
  'frontend/isolation/federation-runtime.ts',
  'frontend/runtime/secure-renderer.ts',
  'k8s/runtime-security-fabric.yaml',
  '.github/workflows/runtime-security-fabric.yml'
];

const phases = [
  { name: 'A', objective: 'strict typing and immutable inventory', gate: 'typecheck:frontend-runtime' },
  { name: 'B', objective: 'runtime CSP and Trusted Types middleware', gate: 'runtime-security-fabric-present' },
  { name: 'C', objective: 'WASM sandbox and module federation isolation', gate: 'isolation-policy-present' },
  { name: 'D', objective: 'telemetry and autonomous remediation', gate: 'response-orchestration-present' }
];

function fileDigest(path) {
  const bytes = readFileSync(join(root, path));
  return createHash('sha256').update(bytes).digest('hex');
}

function assertRequiredFiles() {
  const missing = requiredFiles.filter((path) => {
    try {
      return !statSync(join(root, path)).isFile();
    } catch {
      return true;
    }
  });
  if (missing.length > 0) {
    throw new Error(`Missing migration deliverables: ${missing.join(', ')}`);
  }
}

function buildPlan() {
  return {
    generatedAt: new Date().toISOString(),
    rollout: {
      strategy: 'canary-with-signed-manifest-pointer-rollback',
      trafficSteps: [1, 10, 25, 50, 100],
      rollbackTriggers: [
        'attestation_pass_rate_below_99_5_percent',
        'critical_runtime_exploit_finding',
        'csp_script_violation_rate_above_baseline',
        'p95_latency_regression_above_10_percent'
      ],
      rollbackActions: [
        'freeze_canary',
        'quarantine_current_runtime_subject',
        'publish_previous_signed_manifest_pointer',
        'invalidate_impacted_sessions',
        'emit_soar_rollback_hook'
      ]
    },
    phases,
    artifacts: requiredFiles.map((path) => ({ path, sha256: fileDigest(path), immutable: true }))
  };
}

assertRequiredFiles();
const plan = buildPlan();
process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
