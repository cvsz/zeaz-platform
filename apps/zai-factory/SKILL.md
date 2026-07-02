---
name: zai-factory
description: Local-first AI Factory system for ZEAZ Platform. Use this skill when you need to manage, generate, scan, or validate AI assets and skills in the ZEAZ Platform.
---

# ZAI Factory Skill

ZAI Factory is a local-first AI asset management system for the ZEAZ Platform.

## When to use this skill
- Use this when you need to manage skills within the ZAI ecosystem.
- Use this when you need to scan or install skills into the ZEAZ Platform.
- Use this when cleaning up or deduplicating AI assets.

## How to use it
ZAI Factory provides several NPM scripts that agents can use. Run these from the ZAI Factory directory (`/home/zeazdev/zeaz-platform/apps/zai-factory`):

### Skill Management
- `npm run skills:scan` - Scans for installed skills.
- `npm run skills:install` - Installs skills via symlink.
- `npm run skills:install:copy` - Installs skills via copying.

### Deduplication
- `npm run duplicates:scan` - Scans for duplicate AI assets.
- `npm run duplicates:clean` - Cleans up duplicate AI assets.
- `npm run duplicates:tree` - Displays a tree of AI asset duplicates.

### App and Registry Management
- `npm run registry` - Interacts with the AI registry.
- `npm run apps` - Interacts with apps.
