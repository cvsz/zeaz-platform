# zsp-aitool

`apps/zsp-aitool` is reserved for the ZeaZ AI tool dashboard application tracked by the platform app inventory.

This directory is intentionally kept as a normal monorepo directory, not a Git submodule. Import or restore application source through a reviewed subtree/vendor workflow so CI checkouts and GitHub Actions post-job cleanup do not require nested repository metadata.

## Platform contract

- Primary hostname: `zaiz.zeaz.dev`
- API hostname: `api-zveo.zeaz.dev`
- Default local port: `4108`
- Secrets must stay in local environment files or approved secret stores and must not be committed.

