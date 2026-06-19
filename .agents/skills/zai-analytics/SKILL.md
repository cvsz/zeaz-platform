---
name: zai-analytics
description: Techniques for data analysis, business intelligence (BI), and KPI tracking.
---

# Analytics & Data Skill

## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## 1. Overview
Analytics is the systematic computational analysis of data. It transforms raw metrics into strategic decisions for marketing, product, and operations.

## 2. Core Concepts
* **KPIs (Key Performance Indicators)**: The primary metrics that determine business success (e.g., Customer Acquisition Cost, Lifetime Value).
* **Attribution Modeling**: Understanding which marketing touchpoints led to a conversion (First-click, Last-click, Multi-touch).
* **Cohort Analysis**: Grouping users by a shared characteristic (usually sign-up date) to track retention over time.

## 3. Best Practices
* **Start with a Question**: Never analyze data aimlessly. Always have a specific business question to answer (e.g., "Why did churn increase in Q3?").
* **Data Hygiene**: Ensure tracking events are properly named, standardized, and free of duplicates.
* **Visual Storytelling**: Stakeholders need clear visuals. Use line charts for trends, bar charts for comparisons, and funnels for conversion drops.
* **Actionable Reporting**: Every dashboard or report must end with actionable recommendations, not just a list of numbers.

## 4. Key Tools
* **Web Analytics**: Google Analytics 4 (GA4), Plausible
* **Product Analytics**: Mixpanel, Amplitude
* **Data Visualization (BI)**: Looker Studio, Tableau, Metabase


## Sub-skill: lean-analytics

# Lean Analytics

A data discipline for startups distilled from Alistair Croll and Benjamin Yoskovitz's *Lean Analytics*: separate metrics that change decisions from numbers that merely flatter, then point the whole company at the One Metric That Matters for your business model and stage. Use it to choose metrics, audit dashboards, set targets, and plan instrumentation.

## Core Principle

**Focus on the one metric that matters right now — everything else is noise that feels like progress.** Startups die from lack of focus more often than lack of data. The discipline is knowing your business model, knowing your stage, and tracking the single number that tells you whether the riskiest part of the business is working. A metric earns attention only if it changes what you do next.

## Scoring

**Goal: 10/10.** Rate metric choices, dashboards, and instrumentation plans 0-10 against these principles. Report the current score and the specific changes needed to reach 10/10.

- **9-10:** One OMTM matched to model and stage, paired counter-metric, a line in the sand with a pre-committed miss response, cohorted and segmented data
- **7-8:** Mostly actionable ratios and a plausible OMTM, but no explicit target, weak cohorting, or too many "key" metrics
- **5-6:** Actionable and vanity metrics mixed; dashboard exists but rarely changes a decision; model and stage never named
- **3-4:** Vanity metrics dominate — totals, cumulative charts, blended averages; metrics copied from other companies
- **0-2:** No instrumentation, or numbers chosen to impress investors rather than drive decisions

## Framework

### 1. Good Metrics vs Vanity Metrics

**Core concept:** A good metric is comparative (versus last week, versus another cohort), understandable (the team can recall and debate it), a ratio or rate (not an ever-growing total), and behavior-changing — if a number won't change what you do, stop measuring it. Vanity metrics — total signups, page views, cumulative anything — only go up and only make you feel good.

**Why it works:** The output of analytics is decisions, not data. Ratios are inherently comparative and operable, while totals hide decay: total registered users rises even while the product bleeds actives. Forcing every metric through the "what will we do differently?" test converts reporting into learning.

**Key insights:**
- Work the lens pairs: qualitative vs quantitative (interviews reveal *why*, numbers reveal *how much*), exploratory vs reporting (exploration finds your unfair advantage; reporting keeps the lights on), leading vs lagging (complaints predict churn before churn happens), correlated vs causal
- Correlation finds the lever; only an experiment proves it — find metrics that move together, then change one for a randomized group to test causality
- Cohorts make time honest: compare users by signup month, or real improvement vanishes inside blended averages
- Segments make comparisons honest: split by channel, plan, and geography — a flat aggregate often hides one segment soaring and another collapsing
- Averages lie under skew: whales and lurkers are different businesses, so read medians and percentiles
- A cumulative up-and-to-the-right chart is the single most reliable vanity tell

**Applications:**

| Context | Application | Example |
|---------|-------------|---------|
| Dashboard audit | Rewrite each total as a ratio | Total signups → % of visitors activating within 7 days |
| Board reporting | Show cohorts, not cumulative curves | Retention by signup month replaces "users over time" |
| Feature decision | Demand a behavior-changing metric | "If D7 retention doesn't rise 10%, the feature comes out" |

**Ethical boundary:** Metrics exist to describe and serve users, not manipulate them — instrument only what you need and respect privacy in what you collect.

See: [references/good-metrics.md](references/good-metrics.md)

### 2. The One Metric That Matters (OMTM)

**Core concept:** At any moment there is one number that matters above all others — the one that tells you whether the current riskiest assumption is working. Pick it, display it everywhere, and let it drive every experiment until you graduate to the next stage.

**Why it works:** The OMTM answers the most important question you have right now, forces you to draw a line in the sand so "good" is defined before results arrive, and focuses the entire company. A dashboard of forty numbers diffuses accountability; one number creates a shared scoreboard and a culture of experimentation.

**Key insights:**
- The OMTM rotates — it is the metric that matters *now*, not forever; passing a stage gate or pivoting changes it
- Pair it with a counter-metric so it can't be gamed: activation speed paired with 30-day retention, sales velocity paired with refund rate
- A line in the sand has three parts: a target number, a date, and a pre-committed answer to "what do we do if we miss?"
- "Good enough" is a decision made in advance, not a discovery made after — otherwise the goalposts move
- If the team can't agree on the OMTM, you haven't agreed what the riskiest part of the business is — that argument is the valuable part
- Collect many metrics, but *watch* one — the rest live in drill-down reports, not on the wall

**Applications:**

| Context | Application | Example |
|---------|-------------|---------|
| Quarterly planning | One OMTM per stage; experiments ladder up to it | Stickiness stage → all bets target week-4 retention |
| Dashboard design | OMTM big, 4-6 supporting metrics small | Wall display: paid conversion 3.2% huge; CAC, churn, NPS below |
| Team alignment | Pre-commit the miss response | "Under 10% by March 1 → we pivot to the agency segment" |

**Ethical boundary:** The line in the sand disciplines the company's bets, not individuals — turning the OMTM into personal quotas invites gaming and hides truth.

See: [references/omtm.md](references/omtm.md)

### 3. Metrics by Business Model

**Core concept:** Your business model dictates which metrics exist and which matter. Lean Analytics defines six archetypes — e-commerce, SaaS, free mobile app, media site, user-generated content, and two-sided marketplace — each with its own metric tree and its own definition of "working."

**Why it works:** Copying another company's north star fails because metrics encode the mechanics of a model: a marketplace lives or dies on liquidity, a SaaS business on churn, a media site on engaged attention. Naming your model first turns "what should we measure?" from a brainstorm into a lookup.

**Key insights:**
- E-commerce runs on conversion rate, average order value, and repurchase rate — annual repurchase under ~40% means acquisition mode, over ~60% loyalty mode, and each mode has a different playbook
- SaaS runs on MRR, churn, LTV:CAC, expansion, and time-to-value; free mobile apps run on downloads → DAU/MAU, percent paying, and ARPDAU vs ARPPU (whales skew every average)
- Media runs on audience, engaged time (not raw pageviews), CTR, and RPM; UGC runs on the engagement funnel — visitor → voyeur → commenter → creator — plus content per user and spam rate
- Marketplaces run on liquidity: listings, fill/sell-through rate, time-to-transaction, take rate, buyer/seller ratio — GMV is vanity until multiplied by take rate
- Hybrid businesses must pick ONE primary model to own the OMTM; the secondary model contributes counter-metrics, not equal billing
- The model also dictates instrumentation: define each metric's formula and source up front, or every team computes "churn" differently

**Applications:**

| Context | Application | Example |
|---------|-------------|---------|
| New product instrumentation | Name the model, install its metric tree | Subscription box → primary model SaaS; churn tracked before AOV |
| North-star debate | Derive from model mechanics, don't copy | Marketplace adopts fill rate, not a SaaS-style MRR target |
| Investor dashboard | Report the model's canonical ratios | SaaS deck: MRR growth, net churn, LTV:CAC, CAC payback |

See: [references/business-model-metrics.md](references/business-model-metrics.md)

### 4. Metrics by Stage: The Lean Analytics Stages

**Core concept:** Startups move through five stages — Empathy, Stickiness, Virality, Revenue, Scale — and each has a gate. The OMTM is the intersection of business model and current stage; working on a later stage's metric before passing the current gate is the canonical startup mistake.

**Why it works:** Sequencing prevents waste. Virality poured into a product that doesn't retain is a leaky bucket; paid acquisition before unit economics burns runway with precision. Each gate de-risks the next, larger investment of money and time.

**Key insights:**
- Empathy: have 15+ problem interviews shown a painful, frequent problem people will pay to fix? The metric is mostly conversation notes — and that's correct at this stage
- Stickiness: do people use it repeatedly on their own? Track retention cohorts and core-action engagement; don't pour users into a leaky bucket
- Virality: do users bring users? Track viral coefficient AND cycle time — shortening the cycle often grows you faster than raising the coefficient, and inherent virality beats incentivized invites
- Revenue: does a dollar in return more than a dollar out, soon enough? Revenue per customer, CAC payback, gross margin
- Scale: channels, partners, and new markets — metrics shift from product risk to ecosystem and operations
- Gates are evidence, not time: a flattening retention curve exits Stickiness; positive unit economics within payback tolerance exits Revenue

**Applications:**

| Context | Application | Example |
|---------|-------------|---------|
| Growth-spend decision | Check the stickiness gate first | D30 retention at 4% → fix onboarding before buying ads |
| Roadmap prioritization | Stage picks the OMTM; OMTM picks the work | Stickiness stage ships onboarding fixes, not a referral program |
| Fundraising narrative | Pitch the passed gate and its evidence | "Week-4 retention flat at 35% — raising to scale acquisition" |

See: [references/five-stages.md](references/five-stages.md)

### 5. Baselines and Lines in the Sand

**Core concept:** A metric without a target is trivia. Use published baselines as starting heuristics — not laws — to define "good enough," then draw your line in the sand: a number, a date, and a pre-committed action if you miss.

**Why it works:** Baselines convert open-ended measurement into falsifiable bets. Knowing that ~5% monthly churn is the early-SaaS ceiling tells you whether to optimize or rebuild; without a line, every result can be rationalized and no experiment can fail.

**Key insights:**
- Early SaaS: ~5% monthly customer churn is the upper bound of viable; healthy companies push toward ~2% or lower
- Habitual and social apps: DAU/MAU around 20%+ signals real engagement; casual mobile apps average roughly 14% day-30 retention, so plan for steep decay
- Conversion: e-commerce typically converts ~1-3% of visitors; landing pages on good paid traffic usually convert low single digits — 25-30% is exceptional, not a planning number
- A viral coefficient above 1 is rare and fleeting; treat virality as CAC reduction and optimize cycle time before coefficient
- No benchmark for your case? Measure your current value, improve relative to it, and watch the derivative — 5% weekly improvement compounds into category-leading numbers
- Benchmarks shift by market, channel, price point, and era — always re-derive against your own cohorts before adopting someone else's number

**Applications:**

| Context | Application | Example |
|---------|-------------|---------|
| Target setting | Baseline → line in the sand → pre-commitment | "Churn under 4% by Q3 or we rebuild onboarding" |
| Anomaly triage | Compare to your own baseline before benchmarks | Conversion fell 2.4% → 1.9% in a week — investigate the release |
| Channel evaluation | Re-derive benchmarks per channel | Paid social converts 0.8%, search 4% — budget follows the line |

See: [references/case-studies.md](references/case-studies.md)

## Common Mistakes

| Mistake | Why It Fails | Fix |
|---------|-------------|-----|
| A dashboard with 40 metrics | Diffuses focus; nobody owns anything | One OMTM big, 4-6 supporting metrics, archive the rest |
| Celebrating cumulative charts | Totals can't go down, so they hide decay | Plot rates, conversions, and cohort retention instead |
| Copying another company's north star | Metrics encode model mechanics you don't share | Derive the OMTM from your model × stage |
| Skipping cohorts | Blended averages mask whether the product improves | Track each signup cohort separately over time |
| Optimizing virality before stickiness | Growth multiplies churn — the leaky bucket | Pass the retention gate, then build invite loops |
| Measuring what's easy, not what's risky | Decisions still get made on gut | Instrument the riskiest assumption first |
| No line in the sand | Every result gets rationalized; experiments can't fail | Pre-commit target, date, and miss response |
| Confusing correlation with causation | You pump a metric that doesn't drive the outcome | Run a controlled experiment before investing |

## Quick Diagnostic

| Question | If No | Action |
|----------|-------|--------|
| Can you name your OMTM right now? | Focus is diffused across a dashboard | Pick one metric from current model × stage |
| Would this metric change what you do next? | You're reporting, not deciding | Drop it, or define the decision it gates |
| Is it a ratio or rate, not a total? | Vanity risk — totals only go up | Rewrite as a conversion, retention, or per-user rate |
| Do you know your business model archetype? | Wrong metric tree installed | Name one of the six models; adopt its metrics |
| Do you know your stage (Empathy → Scale)? | Probably optimizing a later stage too early | Find the first unpassed gate; that's your stage |
| Is there a target with a date and a miss plan? | Goalposts will move after results | Draw the line in the sand in writing |
| Is the data cohorted and segmented? | Averages are hiding the truth | Build cohort tables; split by channel and segment |
| Is a counter-metric guarding the OMTM? | The OMTM will be gamed | Pair it, e.g. signup growth × 30-day retention |

## Reference Files

- [references/good-metrics.md](references/good-metrics.md) — Four tests of a good metric, vanity-metric rewrite table, cohort analysis how-to, segmentation discipline, correlation-to-causation loop, metric definition template
- [references/omtm.md](references/omtm.md) — Choosing the OMTM step by step, stage × model matrix, counter-metric pairing, lines in the sand, dashboard design, rotation triggers, worked examples
- [references/business-model-metrics.md](references/business-model-metrics.md) — Metric trees for all six business models with formulas, instrumentation notes, measurement failure modes, hybrid-model guidance
- [references/five-stages.md](references/five-stages.md) — Stage-by-stage playbook: gating metrics, exit-criteria checklists, premature-scaling symptoms, funding and runway interactions
- [references/case-studies.md](references/case-studies.md) — Three scenarios: SaaS dashboard to OMTM, marketplace liquidity discovery, mobile app fixing stickiness before growth

## Further Reading

- [*"Lean Analytics: Use Data to Build a Better Startup Faster"*](https://www.amazon.com/Lean-Analytics-Better-Startup-Faster/dp/1449335675?tag=wondelai00-20) by Alistair Croll & Benjamin Yoskovitz
- [*"The Lean Startup"*](https://www.amazon.com/Lean-Startup-Entrepreneurs-Continuous-Innovation/dp/0307887898?tag=wondelai00-20) by Eric Ries
- [*"Trustworthy Online Controlled Experiments: A Practical Guide to A/B Testing"*](https://www.amazon.com/Trustworthy-Online-Controlled-Experiments-Practical/dp/1108724264?tag=wondelai00-20) by Ron Kohavi, Diane Tang & Ya Xu

## About the Authors

**Alistair Croll** is an entrepreneur and analyst who co-founded web performance company Coradiant, founded Solve For Interesting, and chairs Startupfest among other technology conferences. **Benjamin Yoskovitz** is a founding partner at venture studio Highline Beta and a serial founder and startup investor. They wrote *Lean Analytics* for Eric Ries's Lean Series.


## Sub-skill: plankton-code-quality

# Plankton Code Quality Skill

Integration reference for Plankton (credit: @alxfazio), a write-time code quality enforcement system for Claude Code. Plankton runs formatters and linters on every file edit via PostToolUse hooks, then spawns Claude subprocesses to fix violations the agent didn't catch.

## When to Use

- You want automatic formatting and linting on every file edit (not just at commit time)
- You need defense against agents modifying linter configs to pass instead of fixing code
- You want tiered model routing for fixes (Haiku for simple style, Sonnet for logic, Opus for types)
- You work with multiple languages (Python, TypeScript, Shell, YAML, JSON, TOML, Markdown, Dockerfile)

## How It Works

### Three-Phase Architecture

Every time Claude Code edits or writes a file, Plankton's `multi_linter.sh` PostToolUse hook runs:

```
Phase 1: Auto-Format (Silent)
├─ Runs formatters (ruff format, biome, shfmt, taplo, markdownlint)
├─ Fixes 40-50% of issues silently
└─ No output to main agent

Phase 2: Collect Violations (JSON)
├─ Runs linters and collects unfixable violations
├─ Returns structured JSON: {line, column, code, message, linter}
└─ Still no output to main agent

Phase 3: Delegate + Verify
├─ Spawns claude -p subprocess with violations JSON
├─ Routes to model tier based on violation complexity:
│   ├─ Haiku: formatting, imports, style (E/W/F codes) — 120s timeout
│   ├─ Sonnet: complexity, refactoring (C901, PLR codes) — 300s timeout
│   └─ Opus: type system, deep reasoning (unresolved-attribute) — 600s timeout
├─ Re-runs Phase 1+2 to verify fixes
└─ Exit 0 if clean, Exit 2 if violations remain (reported to main agent)
```

### What the Main Agent Sees

| Scenario | Agent sees | Hook exit |
|----------|-----------|-----------|
| No violations | Nothing | 0 |
| All fixed by subprocess | Nothing | 0 |
| Violations remain after subprocess | `[hook] N violation(s) remain` | 2 |
| Advisory (duplicates, old tooling) | `[hook:advisory] ...` | 0 |

The main agent only sees issues the subprocess couldn't fix. Most quality problems are resolved transparently.

### Config Protection (Defense Against Rule-Gaming)

LLMs will modify `.ruff.toml` or `biome.json` to disable rules rather than fix code. Plankton blocks this with three layers:

1. **PreToolUse hook** — `protect_linter_configs.sh` blocks edits to all linter configs before they happen
2. **Stop hook** — `stop_config_guardian.sh` detects config changes via `git diff` at session end
3. **Protected files list** — `.ruff.toml`, `biome.json`, `.shellcheckrc`, `.yamllint`, `.hadolint.yaml`, and more

### Package Manager Enforcement

A PreToolUse hook on Bash blocks legacy package managers:
- `pip`, `pip3`, `poetry`, `pipenv` → Blocked (use `uv`)
- `npm`, `yarn`, `pnpm` → Blocked (use `bun`)
- Allowed exceptions: `npm audit`, `npm view`, `npm publish`

## Setup

### Quick Start

> **Note:** Plankton requires manual installation from its repository. Review the code before installing.

```bash
# Install core dependencies
brew install jaq ruff uv

# Install Python linters
uv sync --all-extras

# Start Claude Code — hooks activate automatically
claude
```

No install command, no plugin config. The hooks in `.claude/settings.json` are picked up automatically when you run Claude Code in the Plankton directory.

### Per-Project Integration

To use Plankton hooks in your own project:

1. Copy `.claude/hooks/` directory to your project
2. Copy `.claude/settings.json` hook configuration
3. Copy linter config files (`.ruff.toml`, `biome.json`, etc.)
4. Install the linters for your languages

### Language-Specific Dependencies

| Language | Required | Optional |
|----------|----------|----------|
| Python | `ruff`, `uv` | `ty` (types), `vulture` (dead code), `bandit` (security) |
| TypeScript/JS | `biome` | `oxlint`, `semgrep`, `knip` (dead exports) |
| Shell | `shellcheck`, `shfmt` | — |
| YAML | `yamllint` | — |
| Markdown | `markdownlint-cli2` | — |
| Dockerfile | `hadolint` (>= 2.12.0) | — |
| TOML | `taplo` | — |
| JSON | `jaq` | — |

## Pairing with ECC

### Complementary, Not Overlapping

| Concern | ECC | Plankton |
|---------|-----|----------|
| Code quality enforcement | PostToolUse hooks (Prettier, tsc) | PostToolUse hooks (20+ linters + subprocess fixes) |
| Security scanning | AgentShield, security-reviewer agent | Bandit (Python), Semgrep (TypeScript) |
| Config protection | — | PreToolUse blocks + Stop hook detection |
| Package manager | Detection + setup | Enforcement (blocks legacy PMs) |
| CI integration | — | Pre-commit hooks for git |
| Model routing | Manual (`/model opus`) | Automatic (violation complexity → tier) |

### Recommended Combination

1. Install ECC as your plugin (agents, skills, commands, rules)
2. Add Plankton hooks for write-time quality enforcement
3. Use AgentShield for security audits
4. Use ECC's verification-loop as a final gate before PRs

### Avoiding Hook Conflicts

If running both ECC and Plankton hooks:
- ECC's Prettier hook and Plankton's biome formatter may conflict on JS/TS files
- Resolution: disable ECC's Prettier PostToolUse hook when using Plankton (Plankton's biome is more comprehensive)
- Both can coexist on different file types (ECC handles what Plankton doesn't cover)

## Configuration Reference

Plankton's `.claude/hooks/config.json` controls all behavior:

```json
{
  "languages": {
    "python": true,
    "shell": true,
    "yaml": true,
    "json": true,
    "toml": true,
    "dockerfile": true,
    "markdown": true,
    "typescript": {
      "enabled": true,
      "js_runtime": "auto",
      "biome_nursery": "warn",
      "semgrep": true
    }
  },
  "phases": {
    "auto_format": true,
    "subprocess_delegation": true
  },
  "subprocess": {
    "tiers": {
      "haiku":  { "timeout": 120, "max_turns": 10 },
      "sonnet": { "timeout": 300, "max_turns": 10 },
      "opus":   { "timeout": 600, "max_turns": 15 }
    },
    "volume_threshold": 5
  }
}
```

**Key settings:**
- Disable languages you don't use to speed up hooks
- `volume_threshold` — violations > this count auto-escalate to a higher model tier
- `subprocess_delegation: false` — skip Phase 3 entirely (just report violations)

## Environment Overrides

| Variable | Purpose |
|----------|---------|
| `HOOK_SKIP_SUBPROCESS=1` | Skip Phase 3, report violations directly |
| `HOOK_SUBPROCESS_TIMEOUT=N` | Override tier timeout |
| `HOOK_DEBUG_MODEL=1` | Log model selection decisions |
| `HOOK_SKIP_PM=1` | Bypass package manager enforcement |

## References

- Plankton (credit: @alxfazio)
- Plankton REFERENCE.md — Full architecture documentation (credit: @alxfazio)
- Plankton SETUP.md — Detailed installation guide (credit: @alxfazio)

## ECC v1.8 Additions

### Copyable Hook Profile

Set strict quality behavior:

```bash
export ECC_HOOK_PROFILE=strict
export ECC_QUALITY_GATE_FIX=true
export ECC_QUALITY_GATE_STRICT=true
```

### Language Gate Table

- TypeScript/JavaScript: Biome preferred, Prettier fallback
- Python: Ruff format/check
- Go: gofmt

### Config Tamper Guard

During quality enforcement, flag changes to config files in same iteration:

- `biome.json`, `.eslintrc*`, `prettier.config*`, `tsconfig.json`, `pyproject.toml`

If config is changed to suppress violations, require explicit review before merge.

### CI Integration Pattern

Use the same commands in CI as local hooks:

1. run formatter checks
2. run lint/type checks
3. fail fast on strict mode
4. publish remediation summary

### Health Metrics

Track:
- edits flagged by gates
- average remediation time
- repeat violations by category
- merge blocks due to gate failures
