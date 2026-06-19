---
name: zai-automation
description: Frameworks for automating business workflows using AI, APIs, and integration platforms like n8n or Zapier.
---

# AI Automation Skill

## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## 1. Overview
AI Automation combines traditional trigger-action workflows (via tools like n8n, Make, or Zapier) with LLMs to handle cognitive tasks such as categorization, extraction, and drafting responses.

## 2. Core Components of an Automation
* **Trigger**: The event that starts the workflow (e.g., New Email, Webhook received, Scheduled time).
* **Nodes / Steps**: The actions taken (e.g., Fetch data from API, Format text).
* **AI Cognitive Node**: A step where an LLM processes unstructured data (e.g., "Extract the invoice total and vendor name from this PDF").
* **Destination**: Where the final data is sent (e.g., Save to Notion, Send Slack message).

## 3. Best Practices
* **Error Handling & Fallbacks**: APIs fail. Always include error-catching nodes (try/catch equivalents) and notifications for failed runs.
* **Idempotency**: Ensure that if a workflow runs twice on the same data by accident, it doesn't cause duplicate side-effects.
* **Structured AI Outputs**: Always force the AI node to return strict JSON using JSON schemas to ensure the next automation step doesn't break.
* **Cost Management**: Monitor LLM token usage within loops. Do not put an expensive LLM call inside a loop processing thousands of low-value items.

## 4. Key Automation Platforms
* **n8n**: Powerful, node-based, self-hostable.
* **Make.com**: Visual, flexible for complex branching.
* **Zapier**: Easiest integration, widely supported, but rigid.
