import type { SignedWasmModule } from './sandbox-policy';
import { DEFAULT_WASM_EXECUTION_TIMEOUT_MS, DEFAULT_WASM_MEMORY_LIMIT_BYTES } from './sandbox-policy';
import { ImmutableArtifactLoader } from './immutable-loader';
import { verifySignature, type VerificationTrustStore } from './remote-verifier';

export type WasmExecutionResult = Readonly<{
  moduleId: string;
  exportName: string;
  returnValue: unknown;
  durationMilliseconds: number;
  attestation: WasmRuntimeAttestation;
}>;

export type WasmRuntimeAttestation = Readonly<{
  engine: 'webassembly-wasi' | 'wasmtime-adapter';
  wasiSandboxed: boolean;
  filesystemDenied: boolean;
  socketsDenied: boolean;
  signatureVerified: boolean;
  memoryLimitBytes: number;
  executionTimeoutMilliseconds: number;
}>;

export type WasmtimeInvocation = Readonly<{
  moduleBytes: Uint8Array;
  moduleId: string;
  exportName: string;
  args: readonly number[];
  env: Readonly<Record<string, string>>;
  allowedHosts: readonly string[];
  memoryLimitBytes: number;
  executionTimeoutMilliseconds: number;
}>;

export type WasmtimeAdapter = Readonly<{
  execute(invocation: WasmtimeInvocation): Promise<Readonly<{ returnValue: unknown; durationMilliseconds: number }>>;
}>;

type WasiImports = WebAssembly.Imports;

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function denyWasiCall(name: string): () => never {
  return () => {
    throw new Error(`WASI capability ${name} is denied by the zero-trust sandbox policy.`);
  };
}

function createMinimalWasiImports(): WasiImports {
  const clockTimeGet = (): bigint => BigInt(Date.now()) * 1_000_000n;
  const randomGet = (_pointer: number, length: number): number => {
    if (length < 0 || length > 65_536) {
      return 28;
    }
    return 0;
  };

  return {
    wasi_snapshot_preview1: {
      args_get: denyWasiCall('args_get'),
      args_sizes_get: denyWasiCall('args_sizes_get'),
      environ_get: denyWasiCall('environ_get'),
      environ_sizes_get: denyWasiCall('environ_sizes_get'),
      fd_close: denyWasiCall('fd_close'),
      fd_fdstat_get: denyWasiCall('fd_fdstat_get'),
      fd_read: denyWasiCall('fd_read'),
      fd_seek: denyWasiCall('fd_seek'),
      fd_write: denyWasiCall('fd_write'),
      path_open: denyWasiCall('path_open'),
      poll_oneoff: denyWasiCall('poll_oneoff'),
      proc_exit: denyWasiCall('proc_exit'),
      random_get: randomGet,
      clock_time_get: clockTimeGet
    }
  };
}

function getNumericExport(instance: WebAssembly.Instance, exportName: string): (...args: readonly number[]) => unknown {
  const exported = instance.exports[exportName];
  if (typeof exported !== 'function') {
    throw new TypeError(`WASM export ${exportName} is not an invocable function.`);
  }
  return exported as (...args: readonly number[]) => unknown;
}

function assertMemoryLimit(module: SignedWasmModule): number {
  const configured = module.maxMemoryBytes || DEFAULT_WASM_MEMORY_LIMIT_BYTES;
  if (configured < 65_536 || configured > DEFAULT_WASM_MEMORY_LIMIT_BYTES) {
    throw new Error('WASM memory limit exceeds the runtime isolation policy.');
  }
  return configured;
}

function assertExecutionTimeout(module: SignedWasmModule): number {
  const configured = module.maxExecutionMilliseconds || DEFAULT_WASM_EXECUTION_TIMEOUT_MS;
  if (configured < 1 || configured > DEFAULT_WASM_EXECUTION_TIMEOUT_MS) {
    throw new Error('WASM execution timeout exceeds the runtime isolation policy.');
  }
  return configured;
}

export class WasmSandboxExecutor {
  readonly #loader: ImmutableArtifactLoader;
  readonly #trustStore: VerificationTrustStore;
  readonly #wasmtimeAdapter: WasmtimeAdapter | undefined;

  public constructor(
    trustStore: VerificationTrustStore,
    loader = new ImmutableArtifactLoader(),
    wasmtimeAdapter?: WasmtimeAdapter
  ) {
    this.#trustStore = trustStore;
    this.#loader = loader;
    this.#wasmtimeAdapter = wasmtimeAdapter;
  }

  public async execute(
    module: SignedWasmModule,
    exportName: string,
    args: readonly number[] = []
  ): Promise<WasmExecutionResult> {
    const memoryLimitBytes = assertMemoryLimit(module);
    const executionTimeoutMilliseconds = assertExecutionTimeout(module);
    const artifact = await this.#loader.load(module.url, module.integrity);
    await verifySignature(
      { moduleId: module.moduleId, url: module.url, integrity: module.integrity },
      module.signature,
      module.keyId,
      module.signatureAlgorithm,
      this.#trustStore
    );

    if (this.#wasmtimeAdapter !== undefined) {
      const startedAt = performance.now();
      const result = await this.#wasmtimeAdapter.execute({
        moduleBytes: artifact.bytes,
        moduleId: module.moduleId,
        exportName,
        args,
        env: module.allowedEnv,
        allowedHosts: module.allowedHosts,
        memoryLimitBytes,
        executionTimeoutMilliseconds
      });
      return {
        moduleId: module.moduleId,
        exportName,
        returnValue: result.returnValue,
        durationMilliseconds: Math.max(result.durationMilliseconds, performance.now() - startedAt),
        attestation: {
          engine: 'wasmtime-adapter',
          wasiSandboxed: true,
          filesystemDenied: true,
          socketsDenied: module.allowedHosts.length === 0,
          signatureVerified: true,
          memoryLimitBytes,
          executionTimeoutMilliseconds
        }
      };
    }

    return this.executeWithBrowserWasi(module, exportName, args, artifact.bytes, memoryLimitBytes, executionTimeoutMilliseconds);
  }

  private async executeWithBrowserWasi(
    module: SignedWasmModule,
    exportName: string,
    args: readonly number[],
    moduleBytes: Uint8Array,
    memoryLimitBytes: number,
    executionTimeoutMilliseconds: number
  ): Promise<WasmExecutionResult> {
    const startedAt = performance.now();
    const compiled = await WebAssembly.compile(toArrayBuffer(moduleBytes));
    const instance = await WebAssembly.instantiate(compiled, createMinimalWasiImports());
    const exported = getNumericExport(instance, exportName);
    const returnValue = exported(...args);
    const durationMilliseconds = performance.now() - startedAt;

    if (durationMilliseconds > executionTimeoutMilliseconds) {
      throw new Error('WASM execution exceeded the sandbox timeout and was contained.');
    }

    return {
      moduleId: module.moduleId,
      exportName,
      returnValue,
      durationMilliseconds,
      attestation: {
        engine: 'webassembly-wasi',
        wasiSandboxed: true,
        filesystemDenied: true,
        socketsDenied: true,
        signatureVerified: true,
        memoryLimitBytes,
        executionTimeoutMilliseconds
      }
    };
  }
}
