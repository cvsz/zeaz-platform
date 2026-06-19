# ZAI Factory Skills Installer

The ZAI Factory Skills Installer scans local AI assets and produces local registry data for factory planning, duplicate detection, and safe quarantine workflows.

## Supported Asset Types

- agents
- skills
- plugins
- extensions
- Gemini prompts
- Gemini commands

## Default Mode

The installer is repo-only by default.

Command:

    pnpm --filter @zeaz/zai-factory run skills:scan

This scans repository-local assets only.

## Global Audit Mode

Use global mode only for inventory and duplicate cleanup.

Commands:

    pnpm --filter @zeaz/zai-factory run skills:scan:all
    pnpm --filter @zeaz/zai-factory run duplicates:scan

Global scan includes user-level AI assets under the current user's home directory.

## Duplicate Cleanup

Dry-run lower-priority duplicate cleanup first:

    pnpm --filter @zeaz/zai-factory run duplicates:clean:lower

Apply quarantine after reviewing the dry-run result:

    pnpm --filter @zeaz/zai-factory run duplicates:clean:lower:apply

The cleaner moves lower-priority global duplicates into a timestamped quarantine directory. It does not delete files permanently.

## Duplicate Tree Reports

Show duplicate groups:

    pnpm --filter @zeaz/zai-factory run duplicates:tree -- --limit 120

Show same-SHA duplicates:

    pnpm --filter @zeaz/zai-factory run duplicates:tree:same -- --limit 120

Show conflicts:

    pnpm --filter @zeaz/zai-factory run duplicates:tree:conflicts -- --limit 120

## Generated Files

Generated local files are intentionally ignored by Git:

- data/zai-factory-skills-registry.json
- data/ai-assets-duplicates-clean-report-*.json
- reports/
- vendor/ai-assets/

## Safety Rules

The installer must not:

- execute discovered skills, plugins, or extensions
- commit generated global registry output
- commit secrets
- delete duplicate assets directly
- modify repository assets during duplicate cleanup
- clean repository-local assets automatically

Repository-local assets have higher priority than global assets.

## Rollback

Quarantined files are stored outside the repository in a timestamped directory under the user's home directory.

Restore by copying the quarantined files back to their original location after reviewing the generated clean report.
