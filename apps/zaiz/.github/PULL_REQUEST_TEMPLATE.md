<!-- Thanks for contributing to zLM-CLI! Please fill in the sections below. -->

## Summary

<!-- 1–2 sentences: what does this PR do and why? -->

## Type of change

<!-- Check all that apply. -->

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing behavior to change)
- [ ] 📚 Documentation update
- [ ] 🎨 UI/UX improvement
- [ ] ♻️ Refactor (no functional change)
- [ ] 🏗️ Chore (deps, tooling, config)

## What changed

<!-- Bullet points of the key changes. Reference files where helpful. -->

-

## How to test

<!-- Steps a reviewer can follow to verify this works. -->

1. `make install` (if deps changed)
2. `make restart`
3. Open `/` and …

## Active pipeline impact

<!-- If this changes how the Connector composes prompts, a mode/skill/module/agent registry, or a slash command, call it out here. -->

- [ ] No pipeline impact
- [ ] Adds/changes a: [ ] mode [ ] skill [ ] module [ ] agent [ ] slash command [ ] plan schema
- Details:

## Checklist

- [ ] `make lint` passes (zero errors)
- [ ] `make status` shows the server running
- [ ] The tail of `dev.log` shows no runtime errors after my change
- [ ] The `/` route renders (not a blank screen)
- [ ] Core interactions still work (a prompt streams a response; `/help` renders)
- [ ] The footer sticks to the bottom on short content and is pushed down on long content
- [ ] Tested on mobile and desktop widths
- [ ] Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] Updated [`CHANGELOG.md`](../CHANGELOG.md) under `[Unreleased]` (if user-facing)
- [ ] Updated [`/help`](../src/components/terminal/terminal.tsx) and docs if I added a command/feature

## Screenshots / output

<!-- If UI-facing, paste a screenshot. If streaming, paste a sample of the output. -->

## Related issues

<!-- "Closes #123", "Fixes #456", "Refs #789", or "N/A" -->

Closes #
