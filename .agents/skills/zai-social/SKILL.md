---
name: zai-social
description: Proven strategies for organic social media audience growth, algorithmic optimization, and engagement.
---

# Social Media Growth Skill

You are a Social Media Growth Hacker. Use this skill to devise strategies that maximize organic reach, build community, and optimize for platform algorithms.

## 1. Overview
Social media growth requires a combination of algorithmic understanding, consistent high-quality content, and active community engagement. It is not just about posting; it is about building a hook-driven retention engine.

## 2. Algorithmic Drivers (Across Platforms)
* **Watch Time / Retention**: The most critical metric for video (TikTok, Reels, Shorts). Content must retain viewers past the 3-second mark and ideally to completion.
* **Engagement (Comments & Shares)**: Shares signal that content is highly relatable or valuable. Comments signal community discussion.
* **Click-Through Rate (CTR)**: For platforms like YouTube, the thumbnail and title must convince the user to click.

## 3. Growth Strategies
* **The Hook-Body-CTA Format**: Every post must start with a hook (visual or text), deliver the promised value quickly, and end with a call to action (e.g., "Save this for later", "Follow for more").
* **Trend Hijacking**: Adapting current trending audio, memes, or news topics to fit your specific niche.
* **Engagement Baiting (Ethical)**: Asking questions in the video or caption that naturally prompt viewers to share their opinion in the comments.
* **Cross-Pollination**: Directing audiences from a high-reach platform (like TikTok) to a high-depth platform (like YouTube or an email newsletter).

## 4. Platform-Specific Nuances
* **X (Twitter)**: Favors polarizing opinions, threads, and high-frequency posting.
* **LinkedIn**: Favors professional storytelling, carousels, and vulnerability.
* **Instagram**: Favors aesthetics, highly-curated Reels, and community building via Stories.
* **TikTok**: Favors authenticity, raw footage, and fast-paced editing.


## Sub-skill: social-graph-ranker

# Social Graph Ranker

Canonical weighted graph-ranking layer for network-aware outreach.

Use this when the user needs to:

- rank existing mutuals or connections by intro value
- map warm paths to a target list
- measure bridge value across first- and second-order connections
- decide which targets deserve warm intros versus direct cold outreach
- understand the graph math independently from `lead-intelligence` or `connections-optimizer`

## When To Use This Standalone

Choose this skill when the user primarily wants the ranking engine:

- "who in my network is best positioned to introduce me?"
- "rank my mutuals by who can get me to these people"
- "map my graph against this ICP"
- "show me the bridge math"

Do not use this by itself when the user really wants:

- full lead generation and outbound sequencing -> use `lead-intelligence`
- pruning, rebalancing, and growing the network -> use `connections-optimizer`

## Inputs

Collect or infer:

- target people, companies, or ICP definition
- the user's current graph on X, LinkedIn, or both
- weighting priorities such as role, industry, geography, and responsiveness
- traversal depth and decay tolerance

## Core Model

Given:

- `T` = weighted target set
- `M` = your current mutuals / direct connections
- `d(m, t)` = shortest hop distance from mutual `m` to target `t`
- `w(t)` = target weight from signal scoring

Base bridge score:

```text
B(m) = Σ_{t ∈ T} w(t) · λ^(d(m,t) - 1)
```

Where:

- `λ` is the decay factor, usually `0.5`
- a direct path contributes full value
- each extra hop halves the contribution

Second-order expansion:

```text
B_ext(m) = B(m) + α · Σ_{m' ∈ N(m) \\ M} Σ_{t ∈ T} w(t) · λ^(d(m',t))
```

Where:

- `N(m) \\ M` is the set of people the mutual knows that you do not
- `α` discounts second-order reach, usually `0.3`

Response-adjusted final ranking:

```text
R(m) = B_ext(m) · (1 + β · engagement(m))
```

Where:

- `engagement(m)` is normalized responsiveness or relationship strength
- `β` is the engagement bonus, usually `0.2`

Interpretation:

- Tier 1: high `R(m)` and direct bridge paths -> warm intro asks
- Tier 2: medium `R(m)` and one-hop bridge paths -> conditional intro asks
- Tier 3: low `R(m)` or no viable bridge -> direct outreach or follow-gap fill

## Scoring Signals

Weight targets before graph traversal with whatever matters for the current priority set:

- role or title alignment
- company or industry fit
- current activity and recency
- geographic relevance
- influence or reach
- likelihood of response

Weight mutuals after traversal with:

- number of weighted paths into the target set
- directness of those paths
- responsiveness or prior interaction history
- contextual fit for making the intro


## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## Workflow

1. Build the weighted target set.
2. Pull the user's graph from X, LinkedIn, or both.
3. Compute direct bridge scores.
4. Expand second-order candidates for the highest-value mutuals.
5. Rank by `R(m)`.
6. Return:
   - best warm intro asks
   - conditional bridge paths
   - graph gaps where no warm path exists

## Output Shape

```text
SOCIAL GRAPH RANKING
====================

Priority Set:
Platforms:
Decay Model:

Top Bridges
- mutual / connection
  base_score:
  extended_score:
  best_targets:
  path_summary:
  recommended_action:

Conditional Paths
- mutual / connection
  reason:
  extra hop cost:

No Warm Path
- target
  recommendation: direct outreach / fill graph gap
```

## Related Skills

- `lead-intelligence` uses this ranking model inside the broader target-discovery and outreach pipeline
- `connections-optimizer` uses the same bridge logic when deciding who to keep, prune, or add
- `brand-voice` should run before drafting any intro request or direct outreach
- `x-api` provides X graph access and optional execution paths
