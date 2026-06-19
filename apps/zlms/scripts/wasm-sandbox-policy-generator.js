#!/usr/bin/env node

import fs from 'node:fs';

const policy = {
  generatedAt: new Date().toISOString(),
  wasmSandbox: {
    enabled: true,
    runtime: 'wasmtime',
    isolation: {
      filesystem: 'read-only',
      network: 'disabled',
      processSpawn: false,
      syscallFilter: true
    },
    memoryLimits: {
      maxMemoryMb: 128,
      maxExecutionMs: 3000
    },
    allowedModules: [
      'trusted-renderer',
      'secure-parser',
      'isolated-transform'
    ]
  },
  recommendations: [
    'Migrate risky client-side transforms into isolated WASM modules',
    'Enable runtime attestation for WASM artifacts',
    'Sign all WASM binaries with Cosign',
    'Run sandboxed execution behind CSP strict mode'
  ]
};

fs.mkdirSync('security/policies', { recursive: true });

fs.writeFileSync(
  'security/policies/wasm-sandbox-policy.json',
  JSON.stringify(policy, null, 2)
);

console.log(JSON.stringify(policy, null, 2));
