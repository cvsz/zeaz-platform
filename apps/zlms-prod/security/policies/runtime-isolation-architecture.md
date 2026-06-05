# ZLMS Zero-Trust Runtime Isolation Architecture

## Deployment Architecture

1. Each frontend remote is built as an immutable, content-addressed artifact with a hashed `remoteEntry` URL, SRI metadata, a signed remote manifest, and SLSA provenance.
2. The shell registers a remote through `ZeroTrustFederationRuntime`, verifies the manifest signature and provenance, builds a per-remote CSP, creates a per-domain Trusted Types policy, and stores state in a remote-private structured-clone map.
3. Remote dependency sharing is deny-by-default. The only shared scope given to a module-federation container is the explicit dependency allowlist declared by its manifest.
4. WASM modules execute through the Wasmtime adapter when available. Browser fallback uses the native WebAssembly engine with a minimal WASI import surface that denies filesystem, process, socket, and ambient environment access.
5. Every remote emits cross-domain attestation evidence containing manifest, CSP, dependency, and WASM digests before it can be considered healthy.

## Rollback Orchestration

1. Quarantine the active remote with the runtime kill switch when integrity, signature, provenance, or attestation checks fail.
2. Verify the previous signed manifest, immutable artifact SRI, and provenance validity before switching traffic.
3. Warm the restored remote in an isolated runtime domain and validate its CSP, Trusted Types policy, dependency boundary, and WASM sandbox attestation.
4. Publish the previous manifest pointer only after all pre-rollback checks pass.
5. Close the circuit breaker after post-rollback health checks confirm runtime attestation and security telemetry.

## Exploit Containment Boundaries

- Per-remote CSP denies ambient script, frame, form, object, and default fetch capabilities.
- Trusted Types policies forbid dynamic script and script URL creation inside isolated domains.
- Runtime state never crosses remote boundaries except through structured-clone snapshots.
- Circuit breakers and kill switches reduce blast radius when a remote repeatedly fails integrity or execution checks.
- WASI capabilities are denied by default and must be explicitly declared in signed module metadata.
