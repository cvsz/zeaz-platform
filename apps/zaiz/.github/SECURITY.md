# Security Policy

## Supported versions

zLM-CLI is under active development. Security fixes are applied to the latest `main` branch and the most recent release.

| Version | Supported |
| ------- | --------- |
| latest `main` | ✅ |
| latest release tag | ✅ |
| older releases | ❌ |

## Reporting a vulnerability

**Do NOT open a public GitHub issue for security problems.**

Instead, please report vulnerabilities responsibly:

1. **Preferred:** Open a [private security advisory](https://github.com/zai/zlm-cli/security/advisories/new) on GitHub.
2. **Alternative:** Email **security@z.ai** with the subject `[zLM-CLI] Security report`.

Please include:

- A description of the vulnerability and its impact
- Steps to reproduce, or a proof-of-concept
- Affected versions / commits
- Any suggested mitigations

We will acknowledge receipt within **48 hours** and aim to provide an initial assessment within **5 business days**. Please do not disclose the issue publicly until we've had a chance to investigate and publish a fix.

## Scope

This policy covers the zLM-CLI source code in this repository. It does **not** cover:

- Vulnerabilities in the z.ai platform or GLM model itself (report those to Z.ai directly)
- Issues in third-party dependencies (report upstream, but feel free to open an advisory if we're affected)
- Self-inflicted misconfiguration (e.g. exposing credentials in client code — see below)

## Security considerations for contributors

zLM-CLI uses the `z-ai-web-dev-sdk`, which is **server-side only**. Keep these rules in mind:

- **Never import `z-ai-web-dev-sdk` or `src/lib/glm.ts` from client code.** The SDK uses Node's `fs/promises` and would crash the browser bundle. Client-safe types live in `src/lib/{zlm-modes,skills,modules,agents,plan,connector}.ts`.
- **Never expose SDK credentials in client-side code.** All AI calls go through the `/api/*` routes.
- **Validate all API input.** The `/api/cli`, `/api/agent`, and `/api/plan` routes validate and sanitize incoming `messages`/`task`/`mode`/`skill`/`modules` before use.
- **No `dangerouslySetInnerHTML`.** All model output is rendered through `react-markdown` (sanitized) and `react-syntax-highlighter` (escaped).
- **Workspace snippets are truncated** to 12,000 characters server-side before being injected into prompts (prevents prompt-injection-via-huge-input DoS).

If you're adding a feature that handles user input or model output, review it against these rules and note it in your PR.

## Disclosure

Once a fix is released, we will:

1. Publish a patched release and tag it.
2. Credit the reporter (unless they prefer to remain anonymous).
3. Add an entry to [`CHANGELOG.md`](../CHANGELOG.md) describing the fix (without exploit details) under a `### Security` subsection.

Thank you for helping keep zLM-CLI and its users safe.
