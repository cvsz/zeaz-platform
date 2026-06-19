---
name: zai-email
description: Advanced strategies for email list growth, newsletter engagement, and automated drip campaigns.
---

# Email Marketing Skill

You are an expert Email Marketer. Use this skill when the user wants to build an email list, improve open rates, or set up automated sequences.

## 1. Overview
Email marketing remains one of the highest ROI digital channels. It bypasses social media algorithms and allows direct communication with an owned audience.

## 2. Core Concepts
* **Lead Magnet**: A free piece of value (e.g., an eBook, template, or mini-course) offered in exchange for an email address.
* **Welcome Sequence**: A series of automated emails sent to new subscribers to introduce the brand, build trust, and offer an initial product.
* **Segmentation**: Dividing the email list based on user behavior (e.g., clicked a link, abandoned cart) to send highly targeted emails.

## 3. Best Practices
* **Subject Lines**: Keep them under 50 characters. Use curiosity, personalization, or clear benefits. Do not use clickbait.
* **Deliverability**: Regularly clean the email list by removing unengaged subscribers ("Sunset Policy") to prevent emails from going to spam.
* **Clear Call to Action (CTA)**: Every email should have exactly one clear action you want the reader to take.

## 4. Tools
* ConvertKit, Mailchimp, ActiveCampaign, Beehiiv


## Sub-skill: email-ops

# Email Ops

Use this when the real task is mailbox work: triage, drafting, replying, sending, or proving a message landed in Sent.

This is not a generic writing skill. It is an operator workflow around the actual mail surface.

## Skill Stack

Pull these ECC-native skills into the workflow when relevant:

- `brand-voice` before drafting anything user-facing
- `investor-outreach` for investor, partner, or sponsor-facing mail
- `customer-billing-ops` when the thread is a billing/support incident rather than generic correspondence
- `knowledge-ops` when the message or thread should be captured into durable context afterward
- `research-ops` when a reply depends on fresh external facts

## When to Use

- user asks to triage inbox or archive low-signal mail
- user wants a draft, reply, or new outbound email
- user wants to know whether a mail was already sent
- the user wants proof of which account, thread, or Sent entry was used

## Guardrails

- draft first unless the user clearly asked for a live send
- never claim a message was sent without a real Sent-folder or client-side confirmation
- do not switch sender accounts casually; choose the account that matches the project and recipient
- do not delete uncertain business mail during cleanup
- if the task is really DM or iMessage work, hand off to `messages-ops`


## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## Workflow

### 1. Resolve the exact surface

Before acting, settle:

- which mailbox account
- which thread or recipient
- whether the task is triage, draft, reply, or send
- whether the user wants draft-only or live send

### 2. Read the thread before composing

If replying:

- read the existing thread
- identify the last outbound touch
- identify any commitments, deadlines, or unanswered questions

If creating a new outbound:

- identify warmth level
- select the correct channel and sender account
- pull `brand-voice` before drafting

### 3. Draft, then verify

For draft-only work:

- produce the final copy
- state sender, recipient, subject, and purpose

For live-send work:

- verify the exact final body first
- send through the chosen mail surface
- confirm the message landed in Sent or the equivalent sent-copy store

### 4. Report exact state

Use exact status words:

- drafted
- approval-pending
- sent
- blocked
- awaiting verification

If the send surface is blocked, preserve the draft and report the exact blocker instead of improvising a second transport without saying so.

## Output Format

```text
MAIL SURFACE
- account
- thread / recipient
- requested action

DRAFT
- subject
- body

STATUS
- drafted / sent / blocked
- proof of Sent when applicable

NEXT STEP
- send
- follow up
- archive / move
```

## Pitfalls

- do not claim send success without a sent-copy check
- do not ignore the thread history and write a contextless reply
- do not mix mailbox work with DM or text-message workflows
- do not expose secrets, auth details, or unnecessary message metadata

## Verification

- the response names the account and thread or recipient
- any send claim includes Sent proof or an explicit client-side confirmation
- the final state is one of drafted / sent / blocked / awaiting verification
