# ZAI Control Plane — Limits and Push Policy

This file records the current push boundaries for `apps/zai/`.

## Current limitation check

The current ChatGPT GitHub connector can create and update UTF-8 text files in the repository. It is not the right path for uploading binary ZIP build artifacts.

Therefore, the GitHub push for v39 is limited to:

- `apps/zai/README.md`
- `apps/zai/ROADMAP_TO_V50.md`
- `apps/zai/releases/v39-notification-and-communication-center/MANIFEST.md`
- `apps/zai/LIMITS_AND_PUSH_POLICY.md`

## Binary artifact policy

Do not commit generated ZIP files directly to the repository via this connector.

Preferred future artifact options:

1. Commit source files under `apps/zai/` through a normal branch and PR.
2. Attach ZIP files to a GitHub Release through a proper release workflow.
3. Store large generated bundles in an artifact registry or release storage path.

## Review policy

- Keep ZAI isolated under `apps/zai/`.
- Use PR review before merging large source drops.
- Keep secrets out of implementation files.
- Keep examples clearly non-production.
- Keep operational workflows dry-run-first.

## Next step

Build v40 as the next local package:

```text
zai-coder-control-plane-v40-team-collaboration-and-workspaces.zip
```
