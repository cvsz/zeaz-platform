export type HashAlgorithm = 'sha256' | 'sha384' | 'sha512';
export type SignatureAlgorithm = 'ECDSA-P256-SHA256' | 'Ed25519';
export type RemoteTrustState = 'trusted' | 'quarantined' | 'killed';

export type IntegrityDescriptor = Readonly<{
  algorithm: HashAlgorithm;
  digestBase64: string;
  sri: string;
}>;

export type ProvenanceDescriptor = Readonly<{
  builderId: string;
  sourceRepository: string;
  sourceRevision: string;
  slsaLevel: 3 | 4;
  issuedAt: string;
  expiresAt: string;
}>;

export type RemoteManifest = Readonly<{
  schemaVersion: 1;
  remoteId: string;
  domain: string;
  entryUrl: string;
  immutableRevision: string;
  dependencies: readonly string[];
  csp: readonly string[];
  trustedTypesPolicy: string;
  assets: readonly IntegrityDescriptor[];
  wasmModules: readonly SignedWasmModule[];
  provenance: ProvenanceDescriptor;
}>;

export type SignedRemoteManifest = Readonly<{
  manifest: RemoteManifest;
  signature: string;
  signatureAlgorithm: SignatureAlgorithm;
  keyId: string;
}>;

export type SignedWasmModule = Readonly<{
  moduleId: string;
  url: string;
  integrity: IntegrityDescriptor;
  signature: string;
  signatureAlgorithm: SignatureAlgorithm;
  keyId: string;
  allowedHosts: readonly string[];
  allowedEnv: Readonly<Record<string, string>>;
  maxMemoryBytes: number;
  maxExecutionMilliseconds: number;
}>;

export type DomainSandboxPolicy = Readonly<{
  remoteId: string;
  allowedOrigins: readonly string[];
  allowedDependencies: readonly string[];
  trustedTypesPolicy: string;
  connectSources: readonly string[];
  scriptSources: readonly string[];
  styleSources: readonly string[];
  imageSources: readonly string[];
  wasm: Readonly<{
    enabled: boolean;
    requireSignature: boolean;
    requireWasi: boolean;
    denyFilesystem: boolean;
    denySocketsByDefault: boolean;
    maxMemoryBytes: number;
    maxExecutionMilliseconds: number;
  }>;
  circuitBreaker: Readonly<{
    failureThreshold: number;
    halfOpenAfterMilliseconds: number;
  }>;
}>;

export type RuntimeAttestationEvidence = Readonly<{
  remoteId: string;
  manifestDigest: string;
  cspDigest: string;
  dependencyDigest: string;
  wasmDigest: string;
  issuedAt: string;
}>;

export const DEFAULT_WASM_MEMORY_LIMIT_BYTES = 64 * 1024 * 1024;
export const DEFAULT_WASM_EXECUTION_TIMEOUT_MS = 1_000;

const REMOTE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,62}$/u;
const HASHED_ASSET_PATTERN = /\.[a-f0-9]{16,}\.(?:css|js|mjs|wasm|json)$/u;

export function assertValidRemoteId(remoteId: string): void {
  if (!REMOTE_ID_PATTERN.test(remoteId)) {
    throw new TypeError('Remote identifiers must be lowercase DNS-safe labels between 2 and 63 characters.');
  }
}

export function assertImmutableAssetUrl(url: string): void {
  const parsed = new URL(url, globalThis.location?.origin ?? 'https://localhost');
  if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') {
    throw new TypeError('Immutable remote assets must be served over HTTPS.');
  }

  if (!HASHED_ASSET_PATTERN.test(parsed.pathname)) {
    throw new TypeError('Immutable remote assets must include a content hash in the filename.');
  }
}

export function createRemoteCsp(policy: DomainSandboxPolicy, nonce: string): string {
  assertValidRemoteId(policy.remoteId);

  const directives = [
    "default-src 'none'",
    "base-uri 'none'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'none'",
    `connect-src 'self' ${policy.connectSources.join(' ')}`,
    `script-src 'strict-dynamic' 'nonce-${nonce}' ${policy.scriptSources.join(' ')}`,
    `style-src 'self' ${policy.styleSources.join(' ')}`,
    `img-src 'self' data: blob: ${policy.imageSources.join(' ')}`,
    "font-src 'self' data:",
    "worker-src 'self' blob:",
    "manifest-src 'none'",
    "require-trusted-types-for 'script'",
    `trusted-types ${policy.trustedTypesPolicy}`,
    'upgrade-insecure-requests'
  ];

  return directives.join('; ');
}

export function createSandboxPolicyFromManifest(manifest: RemoteManifest): DomainSandboxPolicy {
  assertValidRemoteId(manifest.remoteId);
  assertImmutableAssetUrl(manifest.entryUrl);

  return {
    remoteId: manifest.remoteId,
    allowedOrigins: [new URL(manifest.entryUrl).origin],
    allowedDependencies: manifest.dependencies,
    trustedTypesPolicy: manifest.trustedTypesPolicy,
    connectSources: [new URL(manifest.entryUrl).origin],
    scriptSources: [new URL(manifest.entryUrl).origin],
    styleSources: [new URL(manifest.entryUrl).origin],
    imageSources: [new URL(manifest.entryUrl).origin],
    wasm: {
      enabled: true,
      requireSignature: true,
      requireWasi: true,
      denyFilesystem: true,
      denySocketsByDefault: true,
      maxMemoryBytes: DEFAULT_WASM_MEMORY_LIMIT_BYTES,
      maxExecutionMilliseconds: DEFAULT_WASM_EXECUTION_TIMEOUT_MS
    },
    circuitBreaker: {
      failureThreshold: 3,
      halfOpenAfterMilliseconds: 30_000
    }
  };
}

export class RemoteCircuitBreaker {
  readonly #failureThreshold: number;
  readonly #halfOpenAfterMilliseconds: number;
  #failures = 0;
  #openedAt = 0;

  public constructor(policy: DomainSandboxPolicy['circuitBreaker']) {
    this.#failureThreshold = policy.failureThreshold;
    this.#halfOpenAfterMilliseconds = policy.halfOpenAfterMilliseconds;
  }

  public assertCanExecute(now = Date.now()): void {
    if (this.#failures < this.#failureThreshold) {
      return;
    }

    if (now - this.#openedAt >= this.#halfOpenAfterMilliseconds) {
      this.#failures = this.#failureThreshold - 1;
      return;
    }

    throw new Error('Remote circuit breaker is open; execution is contained.');
  }

  public recordSuccess(): void {
    this.#failures = 0;
    this.#openedAt = 0;
  }

  public recordFailure(now = Date.now()): void {
    this.#failures += 1;
    if (this.#failures >= this.#failureThreshold && this.#openedAt === 0) {
      this.#openedAt = now;
    }
  }

  public snapshot(): Readonly<{ failures: number; openedAt: number; open: boolean }> {
    return {
      failures: this.#failures,
      openedAt: this.#openedAt,
      open: this.#failures >= this.#failureThreshold
    };
  }
}

export class RemoteKillSwitchRegistry {
  readonly #states = new Map<string, RemoteTrustState>();

  public setState(remoteId: string, state: RemoteTrustState): void {
    assertValidRemoteId(remoteId);
    this.#states.set(remoteId, state);
  }

  public assertTrusted(remoteId: string): void {
    const state = this.#states.get(remoteId) ?? 'trusted';
    if (state !== 'trusted') {
      throw new Error(`Remote ${remoteId} is ${state}; runtime execution denied.`);
    }
  }

  public getState(remoteId: string): RemoteTrustState {
    return this.#states.get(remoteId) ?? 'trusted';
  }
}
