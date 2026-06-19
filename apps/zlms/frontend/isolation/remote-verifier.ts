import type { HashAlgorithm, IntegrityDescriptor, ProvenanceDescriptor, SignedRemoteManifest, SignatureAlgorithm } from './sandbox-policy';
import { assertImmutableAssetUrl, assertValidRemoteId } from './sandbox-policy';

export type PublicVerificationKey = Readonly<{
  keyId: string;
  algorithm: SignatureAlgorithm;
  spkiBase64: string;
}>;

export type VerificationTrustStore = Readonly<{
  keys: readonly PublicVerificationKey[];
  allowedBuilders: readonly string[];
  allowedRepositories: readonly string[];
  minimumSlsaLevel: 3 | 4;
  now?: () => Date;
}>;

const HASH_ALGORITHM_NAMES: Readonly<Record<HashAlgorithm, string>> = {
  sha256: 'SHA-256',
  sha384: 'SHA-384',
  sha512: 'SHA-512'
};

function base64ToBytes(value: string): Uint8Array {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, entryValue]) => `${JSON.stringify(key)}:${canonicalize(entryValue)}`).join(',')}}`;
}

async function importVerificationKey(key: PublicVerificationKey): Promise<CryptoKey> {
  if (key.algorithm === 'Ed25519') {
    throw new TypeError('Ed25519 verification requires a platform implementation; configure ECDSA-P256-SHA256 for browsers.');
  }

  return crypto.subtle.importKey(
    'spki',
    toArrayBuffer(base64ToBytes(key.spkiBase64)),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify']
  );
}

export async function digestBytes(bytes: Uint8Array, algorithm: HashAlgorithm = 'sha256'): Promise<string> {
  const digest = await crypto.subtle.digest(HASH_ALGORITHM_NAMES[algorithm], toArrayBuffer(bytes));
  return bytesToBase64(new Uint8Array(digest));
}

export async function digestJson(value: unknown, algorithm: HashAlgorithm = 'sha256'): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalize(value));
  return digestBytes(bytes, algorithm);
}

export async function verifyIntegrity(bytes: Uint8Array, expected: IntegrityDescriptor): Promise<void> {
  const actualDigest = await digestBytes(bytes, expected.algorithm);
  const actualSri = `${expected.algorithm}-${actualDigest}`;

  if (actualDigest !== expected.digestBase64 || actualSri !== expected.sri) {
    throw new Error('SRI validation failed for immutable artifact.');
  }
}

export async function verifySignature(
  payload: unknown,
  signatureBase64: string,
  keyId: string,
  signatureAlgorithm: SignatureAlgorithm,
  trustStore: VerificationTrustStore
): Promise<void> {
  const key = trustStore.keys.find((candidate) => candidate.keyId === keyId && candidate.algorithm === signatureAlgorithm);
  if (key === undefined) {
    throw new Error(`No trusted public key is registered for key id ${keyId}.`);
  }

  const importedKey = await importVerificationKey(key);
  const isValid = await crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    importedKey,
    toArrayBuffer(base64ToBytes(signatureBase64)),
    new TextEncoder().encode(canonicalize(payload))
  );

  if (!isValid) {
    throw new Error('Remote signature verification failed.');
  }
}

export function validateProvenance(provenance: ProvenanceDescriptor, trustStore: VerificationTrustStore): void {
  const now = trustStore.now?.() ?? new Date();
  const issuedAt = Date.parse(provenance.issuedAt);
  const expiresAt = Date.parse(provenance.expiresAt);

  if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt) || issuedAt > now.getTime() || expiresAt <= now.getTime()) {
    throw new Error('Deployment provenance is outside its trusted validity window.');
  }

  if (!trustStore.allowedBuilders.includes(provenance.builderId)) {
    throw new Error('Deployment provenance builder is not trusted.');
  }

  if (!trustStore.allowedRepositories.includes(provenance.sourceRepository)) {
    throw new Error('Deployment provenance repository is not trusted.');
  }

  if (provenance.slsaLevel < trustStore.minimumSlsaLevel) {
    throw new Error('Deployment provenance does not meet the minimum SLSA level.');
  }
}

export async function verifyRemoteManifest(
  signedManifest: SignedRemoteManifest,
  trustStore: VerificationTrustStore
): Promise<Readonly<{ manifestDigest: string; entryOrigin: string }>> {
  const { manifest } = signedManifest;
  assertValidRemoteId(manifest.remoteId);
  assertImmutableAssetUrl(manifest.entryUrl);
  validateProvenance(manifest.provenance, trustStore);

  for (const wasmModule of manifest.wasmModules) {
    assertValidRemoteId(wasmModule.moduleId);
    assertImmutableAssetUrl(wasmModule.url);
  }

  await verifySignature(
    manifest,
    signedManifest.signature,
    signedManifest.keyId,
    signedManifest.signatureAlgorithm,
    trustStore
  );

  return {
    manifestDigest: await digestJson(manifest),
    entryOrigin: new URL(manifest.entryUrl).origin
  };
}
