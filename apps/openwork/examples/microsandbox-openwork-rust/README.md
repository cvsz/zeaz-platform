# Microsandbox OpenWork Rust Example

Small standalone Rust example that starts the OpenWork micro-sandbox image with the `microsandbox` SDK, persists `/workspace` and `/data` with host bind mounts, then keeps the sandbox alive until `Ctrl+C` while streaming the sandbox logs to your terminal. Host port publishing is intentionally disabled in this dependency-safe build because the current `microsandbox-network` release pulls a vulnerable `hickory-proto` line.

## Run

```bash
cargo run --manifest-path examples/microsandbox-openwork-rust/Cargo.toml
```

Useful environment overrides:

- `OPENWORK_MICROSANDBOX_IMAGE` - OCI image reference to boot. Defaults to `openwork-microsandbox:dev`.
- `OPENWORK_MICROSANDBOX_NAME` - sandbox name. Defaults to `openwork-microsandbox-rust`.
- `OPENWORK_MICROSANDBOX_WORKSPACE_DIR` - host directory bind-mounted at `/workspace`. Defaults to `examples/microsandbox-openwork-rust/.state/<sandbox-name>/workspace`.
- `OPENWORK_MICROSANDBOX_DATA_DIR` - host directory bind-mounted at `/data`. Defaults to `examples/microsandbox-openwork-rust/.state/<sandbox-name>/data`.
- `OPENWORK_MICROSANDBOX_REPLACE` - set to `1` or `true` to replace the sandbox instead of reusing persistent state. Defaults to off.
- `OPENWORK_CONNECT_HOST` - hostname you want clients to use. Defaults to `127.0.0.1`.
- `OPENWORK_TOKEN` - remote-connect client token. Defaults to `microsandbox-token`.
- `OPENWORK_HOST_TOKEN` - host/admin token. Defaults to `microsandbox-host-token`.

Example:

```bash
OPENWORK_MICROSANDBOX_IMAGE=ghcr.io/example/openwork-microsandbox:dev \
OPENWORK_MICROSANDBOX_WORKSPACE_DIR="$PWD/examples/microsandbox-openwork-rust/.state/demo/workspace" \
OPENWORK_MICROSANDBOX_DATA_DIR="$PWD/examples/microsandbox-openwork-rust/.state/demo/data" \
OPENWORK_CONNECT_HOST=127.0.0.1 \
OPENWORK_TOKEN=some-shared-secret \
OPENWORK_HOST_TOKEN=some-owner-secret \
cargo run --manifest-path examples/microsandbox-openwork-rust/Cargo.toml
```

## Test

Run the compile-time unit test with:

```bash
cargo test --manifest-path examples/microsandbox-openwork-rust/Cargo.toml
```

End-to-end host HTTP checks are disabled until `microsandbox-network` can be re-enabled on a patched `hickory-proto` release.

## Persistence behavior

By default, the example creates and reuses two host directories under `examples/microsandbox-openwork-rust/.state/<sandbox-name>/`:

- `/workspace`
- `/data`

That keeps OpenWork and OpenCode state around across sandbox restarts, while using normal host filesystem semantics instead of managed microsandbox named volumes.

If you want a clean reset, either:

- change the sandbox name or bind mount paths, or
- set `OPENWORK_MICROSANDBOX_REPLACE=1`

## Note on local Docker images

`microsandbox` expects an OCI image reference. If `openwork-microsandbox:dev` only exists in your local Docker daemon, the SDK may not be able to resolve it directly. In that case, push the image to a registry or otherwise make it available as a pullable OCI image reference first, then set `OPENWORK_MICROSANDBOX_IMAGE` to that ref.
