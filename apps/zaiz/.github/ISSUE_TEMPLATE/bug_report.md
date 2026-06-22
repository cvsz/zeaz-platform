---
name: 🐛 Bug report
about: Something isn't working as expected
title: "[bug] "
labels: bug, triage
assignees: ""
---

## Describe the bug

A clear, concise description of what the bug is.

## To reproduce

Steps to reproduce the behavior:

1. Run `make start`
2. Open the terminal at `/`
3. Type `/...` or `...`
4. See error

## Expected behavior

What you expected to happen.

## Actual behavior

What actually happened.

## Active pipeline

Run `/pipeline` in the terminal and paste the output here (this tells us your active mode/skill/modules/workspace/agent):

```
paste /pipeline output here
```

## Screenshots / output

If applicable, add screenshots or paste the relevant terminal output / `dev.log` tail.

## Environment

- OS: [e.g. macOS 14, Ubuntu 22.04]
- Browser: [e.g. Chrome 120, Firefox 121]
- Node/Bun version: [run `bun --version`]
- zLM-CLI version: [check `package.json` or `git describe --tags`]
- Did you run `make install` recently? [yes/no]

## Additional context

Add any other context about the problem here. If this is a streaming issue, note whether the response was empty, partial, or errored.
