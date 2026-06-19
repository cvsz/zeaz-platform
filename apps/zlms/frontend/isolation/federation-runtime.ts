import { ImmutableArtifactLoader } from './immutable-loader';
import { digestJson, verifyRemoteManifest, type VerificationTrustStore } from './remote-verifier';
import {
  RemoteCircuitBreaker,
  RemoteKillSwitchRegistry,
  createRemoteCsp,
  createSandboxPolicyFromManifest,
  type DomainSandboxPolicy,
  type RuntimeAttestationEvidence,
  type SignedRemoteManifest
} from './sandbox-policy';

export type FederatedModuleFactory<TModule> = () => TModule;

export type ModuleFederationContainer = Readonly<{
  init(sharedScope: Readonly<Record<string, unknown>>): Promise<void> | void;
  get<TModule>(exposedModule: string): Promise<FederatedModuleFactory<TModule>>;
}>;

export type FederationRemoteRegistration = Readonly<{
  manifestUrl: string;
  nonce: string;
}>;

export type IsolatedRemoteRuntime = Readonly<{
  remoteId: string;
  policy: DomainSandboxPolicy;
  csp: string;
  attestation: RuntimeAttestationEvidence;
}>;

type RemoteRuntimeRecord = Readonly<{
  signedManifest: SignedRemoteManifest;
  policy: DomainSandboxPolicy;
  csp: string;
  circuitBreaker: RemoteCircuitBreaker;
  sharedScope: Readonly<Record<string, unknown>>;
  state: Map<string, unknown>;
  attestation: RuntimeAttestationEvidence;
}>;

async function loadContainer(entryUrl: string): Promise<ModuleFederationContainer> {
  const imported = (await import(/* @vite-ignore */ entryUrl)) as Partial<ModuleFederationContainer> & {
    default?: ModuleFederationContainer;
  };
  const container = imported.default ?? imported;

  if (typeof container.init !== 'function' || typeof container.get !== 'function') {
    throw new TypeError('Remote entry does not expose a valid module federation container.');
  }

  return container as ModuleFederationContainer;
}

function encodeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\"', '&quot;')
    .replaceAll("'", '&#39;');
}

function createDomainTrustedTypesPolicy(policyName: string): void {
  const trustedTypes = globalThis.window?.trustedTypes;
  if (trustedTypes === undefined) {
    return;
  }

  trustedTypes.createPolicy(policyName, {
    createHTML: (input: string) => encodeHtml(input),
    createScript: () => {
      throw new TypeError('Dynamic script creation is forbidden inside isolated federation domains.');
    },
    createScriptURL: () => {
      throw new TypeError('Dynamic script URL creation is forbidden inside isolated federation domains.');
    }
  });
}

export class ZeroTrustFederationRuntime {
  readonly #loader: ImmutableArtifactLoader;
  readonly #trustStore: VerificationTrustStore;
  readonly #killSwitches: RemoteKillSwitchRegistry;
  readonly #remotes = new Map<string, RemoteRuntimeRecord>();

  public constructor(
    trustStore: VerificationTrustStore,
    loader = new ImmutableArtifactLoader(),
    killSwitches = new RemoteKillSwitchRegistry()
  ) {
    this.#trustStore = trustStore;
    this.#loader = loader;
    this.#killSwitches = killSwitches;
  }

  public async registerRemote(registration: FederationRemoteRegistration): Promise<IsolatedRemoteRuntime> {
    const signedManifest = await this.#loader.loadSignedManifest(registration.manifestUrl, this.#trustStore);
    const verification = await verifyRemoteManifest(signedManifest, this.#trustStore);
    const policy = createSandboxPolicyFromManifest(signedManifest.manifest);
    const csp = createRemoteCsp(policy, registration.nonce);
    const cspDigest = await digestJson(csp);
    const dependencyDigest = await digestJson([...policy.allowedDependencies].sort());
    const wasmDigest = await digestJson(signedManifest.manifest.wasmModules);
    const attestation = {
      remoteId: signedManifest.manifest.remoteId,
      manifestDigest: verification.manifestDigest,
      cspDigest,
      dependencyDigest,
      wasmDigest,
      issuedAt: new Date().toISOString()
    } satisfies RuntimeAttestationEvidence;

    createDomainTrustedTypesPolicy(policy.trustedTypesPolicy);

    const record = {
      signedManifest,
      policy,
      csp,
      circuitBreaker: new RemoteCircuitBreaker(policy.circuitBreaker),
      sharedScope: Object.freeze(Object.fromEntries(policy.allowedDependencies.map((dependency) => [dependency, undefined]))),
      state: new Map<string, unknown>(),
      attestation
    } satisfies RemoteRuntimeRecord;

    this.#remotes.set(signedManifest.manifest.remoteId, record);
    return {
      remoteId: signedManifest.manifest.remoteId,
      policy,
      csp,
      attestation
    };
  }

  public async importModule<TModule>(remoteId: string, exposedModule: string): Promise<TModule> {
    this.#killSwitches.assertTrusted(remoteId);
    const record = this.getRemoteRecord(remoteId);
    record.circuitBreaker.assertCanExecute();

    try {
      const container = await loadContainer(record.signedManifest.manifest.entryUrl);
      await container.init(record.sharedScope);
      const factory = await container.get<TModule>(exposedModule);
      const module = factory();
      record.circuitBreaker.recordSuccess();
      return module;
    } catch (error) {
      record.circuitBreaker.recordFailure();
      throw error;
    }
  }

  public setState(remoteId: string, key: string, value: unknown): void {
    this.#killSwitches.assertTrusted(remoteId);
    this.getRemoteRecord(remoteId).state.set(key, structuredClone(value));
  }

  public getState<TValue>(remoteId: string, key: string): TValue | undefined {
    this.#killSwitches.assertTrusted(remoteId);
    const value = this.getRemoteRecord(remoteId).state.get(key);
    return value === undefined ? undefined : structuredClone(value) as TValue;
  }

  public attestRemote(remoteId: string): RuntimeAttestationEvidence {
    return this.getRemoteRecord(remoteId).attestation;
  }

  public kill(remoteId: string): void {
    this.#killSwitches.setState(remoteId, 'killed');
  }

  public quarantine(remoteId: string): void {
    this.#killSwitches.setState(remoteId, 'quarantined');
  }

  public restore(remoteId: string): void {
    this.#killSwitches.setState(remoteId, 'trusted');
  }

  private getRemoteRecord(remoteId: string): RemoteRuntimeRecord {
    const record = this.#remotes.get(remoteId);
    if (record === undefined) {
      throw new Error(`Remote ${remoteId} has not been registered.`);
    }
    return record;
  }
}
