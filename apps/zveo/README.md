# zveo

`apps/zveo` is reserved for the ZeaZ AI/video service platform tracked by the platform app inventory.

This directory is intentionally kept as a normal monorepo directory, not a Git submodule. Import or restore application source through a reviewed subtree/vendor workflow so CI checkouts and GitHub Actions post-job cleanup do not require nested repository metadata.

## Platform contract

- Primary hostname: `zveo.zeaz.dev`
- Default UI port: `3002`
- Default API port: `8090`
- Secrets must stay in local environment files or approved secret stores and must not be committed.

