# Rust security audit notes

## RUSTSEC-2023-0071

`cargo audit` currently reports `RUSTSEC-2023-0071` for `rsa@0.9.10` through the upstream `microsandbox` dependency graph.

This branch does not directly introduce `rsa`; the alert is retained as an upstream dependency issue. The immediate actionable alert targeted by this branch is the `hickory-proto` advisory, which is resolved by updating the lockfile.

The audit ignore is scoped to this example project only and should be removed once the upstream dependency graph provides a fixed `rsa` path.
