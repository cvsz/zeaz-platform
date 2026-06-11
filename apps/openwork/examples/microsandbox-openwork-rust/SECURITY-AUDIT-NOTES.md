# Rust security audit notes

## Scope

This note applies only to `apps/openwork/examples/microsandbox-openwork-rust`.

## Validation

`cargo test --locked` passes. One smoke test is intentionally ignored because it requires the microsandbox runtime and a pullable OCI image.

## RUSTSEC-2023-0071

`cargo audit` reports `RUSTSEC-2023-0071` for `rsa@0.9.10` through the upstream `microsandbox` dependency graph.

This example does not directly introduce `rsa`. The advisory is tracked as an upstream dependency issue and should be removed from the ignore list once an upstream fixed dependency path is available.

## RUSTSEC-2026-0118

`cargo audit` reports `RUSTSEC-2026-0118` for `hickory-proto@0.25.2` through:

`microsandbox -> microsandbox-network -> hickory-resolver -> hickory-proto`

The advisory currently reports no fixed upgrade path. This is retained as a scoped upstream dependency exception.

## RUSTSEC-2026-0119

`cargo audit` reports `RUSTSEC-2026-0119` for `hickory-proto@0.25.2`.

The recommended fixed version is `hickory-proto >=0.26.1`, but the current upstream `microsandbox 0.3.14` dependency graph keeps `hickory-resolver/hickory-proto` on `0.25.x`. This exception should be removed once `microsandbox` provides a compatible dependency update.
