# Apps Registry

The ZAI Factory Apps Registry (`apps/zai-factory/data/apps-registry.json`) maintains the canonical state of all applications managed by the ZeaZ Platform.

## Structure
Each entry must contain:
- `id`: Unique identifier
- `path`: Path to the app in the monorepo
- `package_name`: NPM package name
- `version`: Current semantic version
- `factory`: Factory capabilities (develop, plan, refactor, test, build)

## Validation
Registry entries are validated during CLI operations and CI via `apps/zai-factory/scripts/validate-apps-registry.mjs`.
