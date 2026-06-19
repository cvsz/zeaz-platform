---
name: zai-content
description: Advanced strategies for content planning, creation, distribution, and SEO optimization.
---

# Content Strategy Expert Skill

## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## 1. Overview
Content Strategy is the high-level planning, development, and management of informational content. It ensures that every piece of content aligns with business goals and user needs.

## 2. Core Frameworks
* **The Content Funnel**: Top of Funnel (Awareness), Middle of Funnel (Evaluation), Bottom of Funnel (Conversion).
* **Hub and Spoke Model**: Creating a comprehensive "Hub" guide and supporting it with smaller, related "Spoke" articles.
* **Content Repurposing**: Turning a single core asset (e.g., a podcast) into multiple formats (blog posts, social media snippets, newsletters).

## 3. Best Practices
* **Audience-First**: Always start by creating detailed buyer personas. Understand their pain points, goals, and content consumption habits.
* **SEO Integration**: Conduct keyword research before writing. Optimize headings (H1, H2), meta descriptions, and image alt text.
* **Consistency over Quantity**: A consistent publishing schedule builds more trust and algorithmic authority than a massive, one-time content dump.
* **Metrics tracking**: Track Engagement Rate, Time on Page, Bounce Rate, and Conversion Rate to measure success.

## 4. Tools for Execution
* **Planning**: Notion, Trello, Asana
* **SEO**: Ahrefs, SEMrush, Google Search Console
* **Analytics**: Google Analytics 4, Mixpanel


## Sub-skill: article-writing

# Article Writing

Write long-form content that sounds like an actual person with a point of view, not an LLM smoothing itself into paste.

## When to Activate

- drafting blog posts, essays, launch posts, guides, tutorials, or newsletter issues
- turning notes, transcripts, or research into polished articles
- matching an existing founder, operator, or brand voice from examples
- tightening structure, pacing, and evidence in already-written long-form copy

## Core Rules

1. Lead with the concrete thing: artifact, example, output, anecdote, number, screenshot, or code.
2. Explain after the example, not before.
3. Keep sentences tight unless the source voice is intentionally expansive.
4. Use proof instead of adjectives.
5. Never invent facts, credibility, or customer evidence.

## Voice Handling

If the user wants a specific voice, run `brand-voice` first and reuse its `VOICE PROFILE`.
Do not duplicate a second style-analysis pass here unless the user explicitly asks for one.

If no voice references are given, default to a sharp operator voice: concrete, unsentimental, useful.

## Banned Patterns

Delete and rewrite any of these:
- "In today's rapidly evolving landscape"
- "game-changer", "cutting-edge", "revolutionary"
- "here's why this matters" as a standalone bridge
- fake vulnerability arcs
- a closing question added only to juice engagement
- biography padding that does not move the argument
- generic AI throat-clearing that delays the point

## Writing Process

1. Clarify the audience and purpose.
2. Build a hard outline with one job per section.
3. Start sections with proof, artifact, conflict, or example.
4. Expand only where the next sentence earns space.
5. Cut anything that sounds templated, overexplained, or self-congratulatory.

## Structure Guidance

### Technical Guides

- open with what the reader gets
- use code, commands, screenshots, or concrete output in major sections
- end with actionable takeaways, not a soft recap

### Essays / Opinion

- start with tension, contradiction, or a specific observation
- keep one argument thread per section
- make opinions answer to evidence

### Newsletters

- keep the first screen doing real work
- do not front-load diary filler
- use section labels only when they improve scanability

## Quality Gate

Before delivering:
- factual claims are backed by provided sources
- generic AI transitions are gone
- the voice matches the supplied examples or the agreed `VOICE PROFILE`
- every section adds something new
- formatting matches the intended medium


## Sub-skill: contagious

# Word-of-Mouth & Virality Framework

A framework for engineering word-of-mouth and making products, ideas, and content contagious, based on Jonah Berger's research into why things catch on. Use it to design shareability into products, campaigns, and content instead of hoping for luck.

## Core Principle

**Virality is not born — it is engineered.** Products spread because they were designed — consciously or not — to be shared. Only 7% of word-of-mouth happens online; the other 93% happens in offline conversations, so virality is about the psychology of sharing, not social media mechanics. Those psychological patterns are predictable and can be engineered into anything using the STEPPS framework.

## Scoring

**Goal: 10/10.** Rate any product, campaign, content, or feature 0-10 on how many STEPPS drivers it activates and how well. Report the current score and the specific improvements needed to reach 10/10.

## STEPPS Overview

**Not a checklist — a multiplier.** Each principle independently increases sharing; the most contagious ideas activate several at once, but even one or two done well dramatically increase word-of-mouth.

| Principle | Core Question | Sharing Driver |
|-----------|--------------|----------------|
| **S — Social Currency** | Does sharing it make people look good? | Self-enhancement |
| **T — Triggers** | What in the environment reminds people of it? | Top-of-mind accessibility |
| **E — Emotion** | Does it fire up high-arousal feelings? | Physiological arousal |
| **P — Public** | Can others see people using it? | Observational learning |
| **P — Practical Value** | Is it useful enough to pass along? | Altruism and helpfulness |
| **S — Stories** | Is the brand embedded in a narrative? | Entertainment and identity |

## The STEPPS Framework

### 1. Social Currency

**Core concept:** People share things that make them look good — smart, cool, in-the-know. Make people feel like insiders and they'll spread it to boost their own image.

**Why it works:** Brands and information are social signals; people don't just share what they think — they share what makes them look good for thinking it.

**Key insights:**
- **Remarkability** — surprising, novel, or extreme things make the sharer seem interesting; "Did you know...?" is a powerful sharing trigger
- **Game mechanics** — leaderboards, badges, and status tiers create visible accomplishments people want to display
- **Exclusivity and scarcity** — secret menus and invite-only access give people "insider knowledge" to share
- **Inner remarkability** — even mundane products have a remarkable angle; it's framing, not the product

**Product applications:**

| Context | Application | Example |
|---------|------------|---------|
| Content platform | Insider statistics or year-in-review | Spotify Wrapped |
| Mobile app | Shareable accomplishment cards | Duolingo streak badges |
| B2B product | Benchmarking data users want to cite | HubSpot State of Marketing report |

**Copy patterns:**
- "Most people don't know that..."
- "You're one of the first to try..."
- "You've unlocked [achievement]..."

**Ethical boundary:** Create real insider value, not false scarcity or manufactured exclusivity that breeds toxicity.

See: [references/social-currency.md](references/social-currency.md) for remarkability exercises and game mechanics design.

### 2. Triggers

**Core concept:** Top-of-mind means tip-of-tongue. Link your product to environmental cues — sights, sounds, times, routines — so everyday life keeps reminding people to talk about you.

**Why it works:** Most word-of-mouth is driven not by excitement but by whatever happens to be top-of-mind mid-conversation; a product linked to a frequent cue gets mentioned more because it's more accessible in memory.

**Key insights:**
- **Frequency beats strength** — a daily trigger (coffee) outperforms a powerful but rare one (a holiday); Kit Kat linked itself to coffee breaks
- **Habitat matters** — map where and when people encounter contexts related to your product
- **Competitive triggers** — link a competitor's moment to your own brand
- **Ongoing vs. temporary** — persistent environmental triggers sustain word-of-mouth; event triggers only spike it

**Product applications:**

| Context | Application | Example |
|---------|------------|---------|
| Food/Beverage | Link to a daily habit | Kit Kat + coffee break |
| Productivity tool | Tie to a recurring workflow moment | "Every Monday standup..." |
| Financial product | Link to payday | "Every time you get paid..." |

**Copy patterns:**
- "Every time you [frequent activity], think of..."
- "Next time you [daily habit]..."
- "It's [day/time] — time for..."

**Ethical boundary:** Build genuine, helpful associations — hijacking sensitive contexts (grief, health scares) as triggers backfires.

See: [references/triggers.md](references/triggers.md) for habitat analysis and trigger design frameworks.

### 3. Emotion

**Core concept:** When we care, we share. High-arousal emotions — positive (awe, excitement, amusement) or negative (anger, anxiety) — drive sharing; low-arousal emotions (sadness, contentment) suppress it.

**Why it works:** Physiological arousal — racing heart, activated state — creates a need to share. It's activation vs. deactivation, not positivity vs. negativity.

**Key insights:**
- High-arousal drives sharing: awe, excitement, amusement, inspiration, anger, anxiety
- Low-arousal suppresses it: contentment and relaxation feel no urgency; sadness makes people withdraw
- **Awe is the most powerful sharing emotion** — feeling small before something vast or surprising spreads furthest
- **Emotional framing** — the same facts can be framed for different arousal levels; facts inform, framing motivates sharing

**Product applications:**

| Context | Application | Example |
|---------|------------|---------|
| Launch content | Engineer awe through unexpected scale or beauty | Apple keynote reveals |
| Product demos | Amusement through unexpected use | Blendtec "Will It Blend?" |
| Social campaigns | Righteous anger at an injustice | Dove "Real Beauty" challenging beauty standards |

**Copy patterns:**
- "I can't believe [surprising fact]..."
- "Watch what happens when..."
- "This will change how you think about..."

**Ethical boundary:** Engineering outrage for clicks corrodes trust — use high-arousal negative emotion sparingly and only when the cause genuinely warrants it.

See: [references/emotion.md](references/emotion.md) for emotional arousal mapping and content audit tools.

### 4. Public

**Core concept:** Built to show, built to grow. If people can see others using your product, they're more likely to adopt it — design for observability.

**Why it works:** People imitate what they can see; invisible usage forfeits the most powerful adoption channel, social proof through observation.

**Key insights:**
- **Behavioral residue** — design visible traces that outlast use: a Livestrong wristband long outlives the donation
- **Self-advertising products** — every Hotmail email carried "Get your free email at Hotmail"; the product marketed itself through use
- **Public = imitable** — people can only copy what they can observe; find ways to make invisible usage visible

**Product applications:**

| Context | Application | Example |
|---------|------------|---------|
| Email/Messaging | Branded signatures | "Sent from my iPhone" |
| Physical products | Visible branding during use | Apple's outward-facing MacBook logo — every open laptop a billboard |
| SaaS tools | Public outputs crediting the tool | "Powered by [tool]" on customer sites |

**Copy patterns:**
- "Show the world you [achievement/identity]..."
- "Share your [output] — powered by [brand]..."
- "Join [number] others who..."

**Ethical boundary:** Visibility must empower, never shame — users always control what becomes public, and private data (failures, health, finances) stays private.

See: [references/public-visibility.md](references/public-visibility.md) for observability design and behavioral residue strategies.

### 5. Practical Value

**Core concept:** People share useful information to help others. News you can use spreads — especially packaged for easy passing along.

**Why it works:** Sharing practical value is altruism — if your content saves people time, money, or effort, they'll forward it as a favor to their network.

**Key insights:**
- **Prospect Theory** — people judge deals against reference points: $10 off a $20 item feels better than $10 off a $1,000 item
- **Rule of 100** — under $100, use percentage discounts ("50% off"); over $100, use dollar amounts ("$200 off")
- **Narrow audience = wider sharing** — niche content gets forwarded to "the person who needs this"
- **Knowledge packaging** — lists, how-tos, and tip collections are inherently more shareable than essays

**Product applications:**

| Context | Application | Example |
|---------|------------|---------|
| Pricing/Promotions | Frame deals via Rule of 100 | "Save 40%" under $100 vs. "Save $500" over $100 |
| Content marketing | Numbered, forwardable lists | "7 ways to reduce your electricity bill" |
| B2B content | Shareable tools and benchmarks | Free ROI calculator with shareable results |

**Copy patterns:**
- "The [number]-step guide to..."
- "Quick tip: [immediately useful advice]..."
- "Share this with someone who needs to hear it"

**Ethical boundary:** Value must be genuine — inflated "original" prices and clickbait life hacks destroy trust faster than they generate shares.

See: [references/practical-value.md](references/practical-value.md) for Prospect Theory applications and knowledge packaging formats.

### 6. Stories

**Core concept:** People don't share information — they tell stories. Embed your idea in a narrative people want to retell, and the brand rides along like a Trojan Horse.

**Why it works:** Humans think in narratives, and absorption in a story lowers critical defenses — the embedded message lands where a direct pitch would bounce.

**Key insights:**
- **The Trojan Horse test** — if someone can retell the story without your brand, the story fails; the brand must be integral
- **Retellability** — the story must survive casual conversation; a 10-minute setup won't spread
- **Valuable virality** — a hilarious ad nobody attributes to the brand is a failure
- **Narrative transportation** — absorbed listeners accept the embedded message more readily

**Product applications:**

| Context | Application | Example |
|---------|------------|---------|
| Brand marketing | Narrative inseparable from product | Blendtec "Will It Blend?" — can't retell without the brand |
| PR/Earned media | Inherently story-worthy stunts | Barclay Prime's $100 cheesesteak |
| Product launch | Origin story around a customer problem | "We built this because our founder couldn't find..." |

**Copy patterns:**
- "Here's the story of how..."
- "It all started when [founder/customer] realized..."
- "Nobody believed [audacious claim] — until..."

**Ethical boundary:** Stories must be true or clearly fictional — fabricated testimonials and invented origins eventually surface and poison future word-of-mouth.

See: [references/stories-trojan-horse.md](references/stories-trojan-horse.md) for narrative templates and the Trojan Horse integration test.

## Engineering Word of Mouth

STEPPS principles compound when combined:

### Product Launch

| Phase | STEPPS Combination | Tactics |
|-------|-------------------|---------|
| Pre-launch | Social Currency + Public | Invite-only beta with visible waitlist |
| Launch day | Emotion + Stories | Founder narrative + awe-inducing demo |
| First week | Triggers + Practical Value | Tie to daily workflow + share-to-unlock features |
| Sustained growth | Public + Social Currency | Visible usage signals + achievement sharing |

### Content Strategy

| Content Type | Primary STEPPS | Secondary STEPPS | Example |
|-------------|---------------|-----------------|---------|
| Thought leadership | Social Currency | Stories | Insider knowledge wrapped in narrative |
| How-to guides | Practical Value | Triggers | Tips tied to recurring situations |
| Brand films | Emotion | Stories | Awe-inspiring narrative with brand at center |
| Interactive tools | Practical Value | Public | Calculator/quiz with shareable results |

### Feature Design

| Feature Goal | STEPPS to Apply | Implementation |
|-------------|----------------|----------------|
| Drive referrals | Social Currency + Public | Shareable achievement cards with branding |
| Increase retention | Triggers + Practical Value | Daily-routine integrations with useful outputs |
| Build community | Public + Social Currency | Visible membership tiers and contribution badges |
| Launch virally | Emotion + Stories | Remarkable origin story + emotionally charged demo |

## Common Mistakes

| Mistake | Why It Fails | Fix |
|---------|-------------|-----|
| Focusing only on online sharing | 93% of WOM is offline | Design conversation triggers, not just share buttons |
| Shareable but not brand-linked | People share the joke, forget who made it | Apply the Trojan Horse test |
| Using low-arousal emotions | Sadness and contentment don't activate sharing | Reframe for awe, excitement, amusement, or anger |
| Invisible product usage | No one imitates what they can't see | Add behavioral residue and observable signals |
| Relying on product quality alone | Great products without STEPPS spread slowly | Deliberately engineer 2-3 STEPPS into the experience |
| Rare, powerful triggers | Infrequent cues generate less WOM than daily ones | Prioritize trigger frequency over strength |

## Quick Diagnostic

| Question | If No... | Action |
|----------|----------|--------|
| Does sharing this make people look good? | No social currency | Add remarkability, exclusivity, or achievements |
| Is there an everyday cue that recalls it? | No trigger | Link to a frequent environment or routine |
| Does it evoke high-arousal emotion? | Low activation | Reframe for awe, excitement, humor, or righteous anger |
| Can others see people using it? | Invisible usage | Add observable signals or branded outputs |
| Is it useful enough to forward? | Low practical value | Package as tips, lists, or tools people would send a friend |
| Is the brand embedded in a retellable story? | No narrative vehicle | Create a Trojan Horse story that needs your brand |

## Reference Files

- [references/social-currency.md](references/social-currency.md) — Remarkability techniques, game mechanics, exclusivity design, identity signaling
- [references/triggers.md](references/triggers.md) — Habitat analysis, trigger frequency matrix, competitive triggers, Kit Kat case study
- [references/emotion.md](references/emotion.md) — High vs. low arousal mapping, awe engineering, humor design, emotional audit tools
- [references/public-visibility.md](references/public-visibility.md) — Behavioral residue, observable consumption, self-advertising products, the Apple logo story
- [references/practical-value.md](references/practical-value.md) — Prospect Theory for marketers, Rule of 100, knowledge packaging, deal framing
- [references/stories-trojan-horse.md](references/stories-trojan-horse.md) — Trojan Horse narrative design, brand integration testing, story templates
- [references/word-of-mouth.md](references/word-of-mouth.md) — Offline vs. online WOM, conversation triggers, measurement, WOM audit
- [references/viral-content-patterns.md](references/viral-content-patterns.md) — Content formats that spread, platform patterns, viral coefficient, shareability audit
- [references/case-studies.md](references/case-studies.md) — Breakdowns of Blendtec, Barclay Prime, Kit Kat, Livestrong, Dove, and Hotmail

## Further Reading

- [Contagious: Why Things Catch On](https://www.amazon.com/Contagious-Things-Catch-Jonah-Berger/dp/1451686579?tag=wondelai00-20) by Jonah Berger
- [The Catalyst: How to Change Anyone's Mind](https://www.amazon.com/Catalyst-How-Change-Anyones-Mind/dp/1982108606?tag=wondelai00-20) by Jonah Berger

## About the Author

**Jonah Berger** is a marketing professor at the Wharton School whose research focuses on social influence, word-of-mouth, and why things catch on. *Contagious* distills that research into the STEPPS framework; he also wrote *Invisible Influence* and *The Catalyst* and consults for companies from startups to the Fortune 500.


## Sub-skill: brand

# Brand

Brand identity, voice, messaging, asset management, and consistency frameworks.

## When to Use

- Brand voice definition and content tone guidance
- Visual identity standards and style guide development
- Messaging framework creation
- Brand consistency review and audit
- Asset organization, naming, and approval
- Color palette management and typography specs

## Quick Start

**Inject brand context into prompts:**
```bash
node scripts/inject-brand-context.cjs
node scripts/inject-brand-context.cjs --json
```

**Validate an asset:**
```bash
node scripts/validate-asset.cjs <asset-path>
```

**Extract/compare colors:**
```bash
node scripts/extract-colors.cjs --palette
node scripts/extract-colors.cjs <image-path>
```

## Brand Sync Workflow

```bash
# 1. Edit docs/brand-guidelines.md (or use /brand update)
# 2. Sync to design tokens
node scripts/sync-brand-to-tokens.cjs
# 3. Verify
node scripts/inject-brand-context.cjs --json | head -20
```

**Files synced:**
- `docs/brand-guidelines.md` → Source of truth
- `assets/design-tokens.json` → Token definitions
- `assets/design-tokens.css` → CSS variables

## Subcommands

| Subcommand | Description | Reference |
|------------|-------------|-----------|
| `update` | Update brand identity and sync to all design systems | `references/update.md` |

## References

| Topic | File |
|-------|------|
| Voice Framework | `references/voice-framework.md` |
| Visual Identity | `references/visual-identity.md` |
| Messaging | `references/messaging-framework.md` |
| Consistency | `references/consistency-checklist.md` |
| Guidelines Template | `references/brand-guideline-template.md` |
| Asset Organization | `references/asset-organization.md` |
| Color Management | `references/color-palette-management.md` |
| Typography | `references/typography-specifications.md` |
| Logo Usage | `references/logo-usage-rules.md` |
| Approval Checklist | `references/approval-checklist.md` |

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/inject-brand-context.cjs` | Extract brand context for prompt injection |
| `scripts/sync-brand-to-tokens.cjs` | Sync brand-guidelines.md → design-tokens.json/css |
| `scripts/validate-asset.cjs` | Validate asset naming, size, format |
| `scripts/extract-colors.cjs` | Extract and compare colors against palette |

## Templates

| Template | Purpose |
|----------|---------|
| `templates/brand-guidelines-starter.md` | Complete starter template for new brands |

## Routing

1. Parse subcommand from `$ARGUMENTS` (first word)
2. Load corresponding `references/{subcommand}.md`
3. Execute with remaining arguments
