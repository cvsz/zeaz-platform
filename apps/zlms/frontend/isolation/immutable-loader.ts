import type { IntegrityDescriptor, SignedRemoteManifest } from './sandbox-policy';
import { assertImmutableAssetUrl } from './sandbox-policy';
import { verifyIntegrity, verifyRemoteManifest, type VerificationTrustStore } from './remote-verifier';

export type ImmutableFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type ImmutableArtifact = Readonly<{
  url: string;
  bytes: Uint8Array;
  contentType: string;
  cacheKey: string;
}>;

export class ImmutableArtifactLoader {
  readonly #fetch: ImmutableFetch;
  readonly #cache = new Map<string, ImmutableArtifact>();

  public constructor(fetchImplementation: ImmutableFetch = fetch) {
    this.#fetch = fetchImplementation;
  }

  public async load(url: string, integrity: IntegrityDescriptor): Promise<ImmutableArtifact> {
    assertImmutableAssetUrl(url);
    const cached = this.#cache.get(integrity.sri);
    if (cached !== undefined) {
      return cached;
    }

    const response = await this.#fetch(url, {
      cache: 'no-store',
      credentials: 'omit',
      integrity: integrity.sri,
      mode: 'cors',
      redirect: 'error'
    });

    if (!response.ok) {
      throw new Error(`Immutable artifact fetch failed with status ${response.status}.`);
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    await verifyIntegrity(bytes, integrity);

    const artifact = {
      url,
      bytes,
      contentType: response.headers.get('content-type') ?? 'application/octet-stream',
      cacheKey: integrity.sri
    } satisfies ImmutableArtifact;
    this.#cache.set(integrity.sri, artifact);
    return artifact;
  }

  public async loadSignedManifest(url: string, trustStore: VerificationTrustStore): Promise<SignedRemoteManifest> {
    assertImmutableAssetUrl(url);
    const response = await this.#fetch(url, {
      cache: 'no-store',
      credentials: 'omit',
      mode: 'cors',
      redirect: 'error'
    });

    if (!response.ok) {
      throw new Error(`Remote manifest fetch failed with status ${response.status}.`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new TypeError('Remote manifest must be served as application/json.');
    }

    const signedManifest = (await response.json()) as SignedRemoteManifest;
    await verifyRemoteManifest(signedManifest, trustStore);
    return signedManifest;
  }

  public evictBySri(sri: string): void {
    this.#cache.delete(sri);
  }
}
