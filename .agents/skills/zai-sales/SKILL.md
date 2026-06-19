---
name: zai-sales
description: Frameworks for building high-converting landing pages, lead magnets, and customer journey funnels.
---

# Sales Funnel Skill

## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## 1. Overview
A sales funnel is the intentional, multi-step process a prospect goes through to become a customer. It minimizes friction and maximizes trust at every touchpoint.

## 2. Core Funnel Stages
* **Top of Funnel (ToFu)**: Traffic generation (Ads, Social Media, SEO). Goal: Capture attention.
* **Middle of Funnel (MoFu)**: Lead capture and nurturing (Landing Pages, Email Sequences, Webinars). Goal: Build trust and authority.
* **Bottom of Funnel (BoFu)**: The final pitch (Sales Pages, Checkout, Retargeting Ads). Goal: Conversion.

## 3. Landing Page Best Practices
* **Above the Fold**: The value proposition must be immediately clear before the user scrolls. Use the format: "Achieve [Desire] without [Pain Point]".
* **Frictionless Capture**: Only ask for the information you absolutely need (e.g., just Name and Email for a free guide).
* **Social Proof & Risk Reversal**: Always include testimonials and clear guarantees (e.g., 30-day money-back) near the checkout button.

## 4. Key Metrics
* Conversion Rate (CVR), Cost Per Acquisition (CPA), Average Order Value (AOV), Customer Lifetime Value (LTV).


## Sub-skill: hundred-million-offers

# Grand Slam Offer Creation Framework

Framework for creating offers so good people feel stupid saying no. What you sell (the offer) matters more than how you sell it or who you sell it to.

## Core Principle

**The offer is the #1 lever in any business: a Grand Slam Offer sells despite mediocre marketing, while the best marketing in the world cannot save a bad offer.** Before optimizing funnels, running more ads, or hiring salespeople, fix the offer. A Grand Slam Offer maximizes Dream Outcome and Perceived Likelihood of Achievement while minimizing Time Delay and Effort & Sacrifice — becoming a category of one with no comparable alternative.

## Scoring

**Goal: 10/10.** When reviewing or creating offers, rate them 0-10 against the principles below. A 10/10 is genuinely irresistible — high perceived value, reversed risk, ethical scarcity, compelling bonuses, and a name that demands attention. Always provide the current score and the specific improvements needed to reach 10/10.

## The Grand Slam Offer Framework

### 1. The Value Equation

**Core concept:** Value = (Dream Outcome x Perceived Likelihood of Achievement) / (Time Delay x Effort & Sacrifice). Maximize the numerator and minimize the denominator to create massive perceived value.

**Why it works:** People buy outcomes, not products — they weigh the dream result and their confidence in achieving it against how long and hard the path is. When the numerator vastly outweighs the denominator, the offer feels like a no-brainer regardless of price.

**Key insights:**
- Dream Outcome defines the ceiling of your value
- Perceived Likelihood often matters more than actual results — social proof, guarantees, and track record raise it
- Time Delay is a silent killer; faster results command premium prices
- Effort & Sacrifice includes everything the customer gives up (time, comfort, status, identity)
- A guarantee raises Perceived Likelihood and lowers perceived risk simultaneously

**Product applications:**

| Context | Application | Example |
|---------|-------------|---------|
| **SaaS** | Cut time-to-value | "First dashboard in 5 minutes, not 5 weeks" |
| **Agency** | Guarantee results to cut risk | "10 qualified leads or you don't pay" |
| **Info product** | Templates reduce effort | "Fill in the blanks -- no writing from scratch" |

**Copy patterns:**
- "Get [Dream Outcome] in [short time] without [Effort & Sacrifice]"
- "Guaranteed [result] or [risk reversal]"
- "We do [hard part] so you don't have to"

**Ethical boundary:** Never promise outcomes you cannot reasonably deliver — substantiate every speed, effort, and results claim with real data or state it as aspirational.

See: [references/value-equation.md](references/value-equation.md) for the four levers, optimization tactics, and scoring rubric.

### 2. The Grand Slam Offer

**Core concept:** A Grand Slam Offer is a complete package — core offer, bonuses, guarantee, scarcity, urgency, and a compelling name — not just a product.

**Why it works:** Bundling multiple value elements makes price comparison impossible: no competitor offers the same combination, so you escape commoditization and price pressure.

**Key insights:**
- List every problem and obstacle between the customer and the Dream Outcome; create a solution and delivery vehicle for each
- Trim & Stack: cut low-value/high-cost solutions, stack high-value/low-cost ones
- Each component should be nameable, independently valuable, and dollar-valued
- The sum of component values should be at least 10x the price

**Product applications:**

| Context | Application | Example |
|---------|-------------|---------|
| **SaaS** | Bundle training, setup, templates | "Platform + Setup Concierge + Template Library + Weekly Coaching" |
| **Course** | Add community, coaching, tools | "Course + Private Community + Weekly Q&A + Swipe Files" |
| **Consulting** | Package frameworks and support | "Diagnostic + Roadmap + 90-Day Implementation Support" |

**Copy patterns:**
- "Here's everything you get when you join today..."
- "Total value: $[sum of components]. Your investment: $[price]."
- "Everything you need to [Dream Outcome] in one package"

**Ethical boundary:** Assign honest, defensible dollar values to each component — never inflate values to fake a value-price gap.

See: [references/grand-slam-offers.md](references/grand-slam-offers.md) for the full offer assembly process and problem-solution mapping.

### 3. Finding Your Starving Crowd

**Core concept:** Before building the offer, find a starving crowd — a market with massive pain, purchasing power, easy targeting, and growth. The best offer fails if aimed at the wrong market.

**Why it works:** A starving crowd already knows it has the problem and is already hunting for a solution — your only job is presenting a compelling offer, which slashes acquisition cost and lifts conversion.

**Key insights:**
- Four criteria: massive pain, purchasing power, easy to target, growing market
- Pain matters most — people pay to stop pain faster than to gain pleasure
- "Easy to target" means reachable through existing channels (associations, communities, platforms)
- Niching down raises perceived value because specificity signals expertise

**Product applications:**

| Context | Application | Example |
|---------|-------------|---------|
| **SaaS** | Vertical with acute pain | "CRM for real estate agents who lose deals to follow-up failures" |
| **Agency** | Dominate one industry | "SEO agency exclusively for dental practices" |
| **Info product** | Narrow, painful, urgent problem | "How doctors negotiate their first hospital contract" |

**Copy patterns:**
- "Made specifically for [narrow audience] who struggle with [specific pain]"
- "We only work with [type of client] because we know your world"
- "If you're a [avatar] dealing with [pain], this was built for you"

**Ethical boundary:** Target genuine need and fit, never vulnerability — avoid people in crisis who cannot make rational decisions.

See: [references/starving-crowd.md](references/starving-crowd.md) for market selection criteria and the niche scorecard.

### 4. Value-Based Pricing

**Core concept:** Charge based on the value you deliver, not your costs — aim for a 10:1 value-to-price ratio.

**Why it works:** Low prices attract price-sensitive customers who churn fastest and refer least; premium prices attract committed customers who invest effort, get better results, and stay — while funding exceptional delivery. That's a virtuous cycle.

**Key insights:**
- Price is a function of perceived value, not cost
- Raising prices often increases conversions — price signals quality and seriousness
- Anchor against the cost of not solving the problem, not against alternatives
- Payment plans remove price as an objection without reducing revenue
- Price communicates positioning: commodity, premium, or luxury

**Product applications:**

| Context | Application | Example |
|---------|-------------|---------|
| **SaaS** | Price on outcomes, not features | "$500/mo for pipeline management that closes 3x more deals" |
| **Coaching** | Price against the transformation | "$25,000 program that helps consultants add $200K/year" |
| **Info product** | Price against the alternative | "$2,000 course vs. 3 years of trial-and-error and $50K in mistakes" |

**Copy patterns:**
- "What would it be worth to you if [Dream Outcome]?"
- "The cost of doing nothing is $[opportunity cost] per [time period]"
- "An investment of $[price] for $[10x value] in [outcome]"

**Ethical boundary:** Substantiate value claims — if you claim 10x ROI, have data, case studies, or a clear logical basis.

See: [references/pricing-strategy.md](references/pricing-strategy.md) for value-based pricing frameworks and anchoring techniques.

### 5. Bonuses: Value Stacking

**Core concept:** Bonuses are added components that address remaining objections and make the offer feel like an overwhelming deal — each solving a specific problem with an independently justifiable dollar value.

**Why it works:** When total bonus value exceeds the price, the core product feels "free," and each bonus preemptively removes a reason not to buy.

**Key insights:**
- Each bonus should kill a specific objection or obstacle to success
- Stack order matters: present the most valuable bonus first as the anchor
- Partner bonuses add value at zero cost to you
- Name each bonus — named bonuses feel more real; keep them high value / low cost to deliver (templates, recordings, access)

**Product applications:**

| Context | Application | Example |
|---------|-------------|---------|
| **SaaS** | Training, templates, priority support | "Bonus: 50 proven email templates ($500 value)" |
| **Coaching** | Tools, assessments, community | "Bonus: Private Slack community for accountability ($2,000/yr value)" |
| **Agency** | Strategy docs, competitive analysis | "Bonus: Full competitive SEO audit ($3,000 value)" |

**Copy patterns:**
- "Bonus #1: [Name] (a $[value] value) -- FREE"
- "We added this because we noticed [objection] was holding people back"
- "Total bonus value: $[sum]. Yours free when you join today."

**Ethical boundary:** Every bonus dollar value must be defensible — price it at what someone would actually pay for it on its own.

See: [references/bonuses-stacking.md](references/bonuses-stacking.md) for bonus design frameworks and stacking strategies.

### 6. Guarantees: Reversing Risk

**Core concept:** Guarantees transfer risk from buyer to seller. The prospect's biggest fear isn't losing money — it's making a bad decision; a strong guarantee makes "yes" psychologically safe.

**Why it works:** Every purchase carries financial, time, reputation, and identity risk, and guarantees neutralize them. Counterintuitively, stronger guarantees reduce refund rates — they signal confidence and attract committed buyers.

**Key insights:**
- Five types: unconditional, conditional, anti-guarantee, implied, performance-based
- Unconditional (full refund, no questions) is simplest and strongest for low-ticket
- Conditional ("do X steps, or we refund") attracts better clients; anti-guarantees ("all sales final") work when demand exceeds supply
- Performance-based ("we hit [metric] or you don't pay") is the ultimate risk reversal
- Name your guarantee, and stack multiple guarantees to reverse multiple risk types

**Product applications:**

| Context | Application | Example |
|---------|-------------|---------|
| **SaaS** | Trial + money-back | "Try free for 30 days, then 60-day money-back guarantee" |
| **Coaching** | Conditional + performance-based | "Complete all 12 modules; no 3 new clients = 100% refund" |
| **Agency** | Performance-based | "50 qualified leads in 90 days or we work free until you get them" |

**Copy patterns:**
- "Our [Named] Guarantee: [specific promise] or [consequence]"
- "Try it for [time period]. If you're not [specific outcome], we'll [reversal]."
- "You literally cannot lose."

**Ethical boundary:** Honor every guarantee without friction or fine-print traps — a guarantee that's hard to claim destroys trust permanently.

See: [references/guarantees.md](references/guarantees.md) for the five guarantee types, naming strategies, and stacking approaches.

### 7. Scarcity and Urgency

**Core concept:** Scarcity limits quantity (how many); urgency limits time (how long). Both give people who already want the offer a reason to act now.

**Why it works:** Without a reason to act now, prospects default to "I'll think about it" — which functionally means no. Loss aversion makes the fear of missing out outweigh the inertia of inaction.

**Key insights:**
- Scarcity of supply: limited seats, enrollment caps, production runs; urgency of time: enrollment windows, deadline-driven bonuses
- Cohort-based models are the most ethical scarcity (genuinely limited capacity)
- Bonus scarcity ("First 20 people also get...") adds urgency without limiting the core offer
- Evergreen urgency must tie to real events (onboarding cohorts, seasonal cycles)

**Product applications:**

| Context | Application | Example |
|---------|-------------|---------|
| **SaaS** | Limited beta, grandfathered pricing | "Founding member pricing: locked for life, only 100 spots" |
| **Coaching** | Cohort enrollment windows | "Next cohort starts March 1. Only 20 seats." |
| **Agency** | Client capacity limits | "We take 5 new clients per quarter to ensure quality" |

**Copy patterns:**
- "Only [X] spots remaining in this cohort"
- "Enrollment closes [specific date] at midnight"
- "First [X] people to join also receive [bonus]"

**Ethical boundary:** Every scarcity and urgency claim must be 100% true — if you say 20 spots, there are 20 spots; fake scarcity (e.g., resetting countdown timers) is the fastest way to destroy a brand.

See: [references/scarcity-urgency.md](references/scarcity-urgency.md) for ethical scarcity patterns and evergreen urgency techniques.

### 8. Naming the Offer

**Core concept:** The name is the first thing prospects see and the last thing they remember. A great name communicates audience, outcome, timeframe, and format in a few words.

**Why it works:** A well-named offer pre-qualifies the right audience, sets expectations, and creates curiosity — a poorly named one requires explanation, which means you've already lost attention.

**Key insights — the MAGIC formula:**
- **M** = Magnetic reason why (hook, event, season, trend)
- **A** = Avatar (who it's for — the more specific, the better)
- **G** = Goal (the Dream Outcome in concrete terms)
- **I** = Indicate a time frame (how fast)
- **C** = Container word (challenge, blueprint, accelerator, bootcamp, system, formula, masterclass)
- Use only the elements that serve clarity; test 3-5 names — a name change alone can double conversion

**Product applications:**

| Context | Application | Example |
|---------|-------------|---------|
| **SaaS** | Outcome + speed | "Pipeline Accelerator: Close 3x More Deals in 90 Days" |
| **Coaching** | Avatar + goal + timeframe | "The 6-Figure Freelancer Blueprint: From $5K to $15K Months in 120 Days" |
| **Agency** | Lead with the guarantee | "The 50-Lead Guarantee: Qualified Appointments in 60 Days" |

**Copy patterns:**
- "The [Time Frame] [Avatar] [Goal] [Container]"
- "[Goal] [Container] for [Avatar]"
- "[Number]-Day [Goal] [Container] for [Avatar]"

**Ethical boundary:** The name must accurately represent the offer — aspirational is fine, deceptive is not (no "6-Figure Blueprint" if customers don't reach six figures).

See: [references/naming-offers.md](references/naming-offers.md) for the MAGIC formula breakdown, 20+ examples, and naming dos and don'ts.

## Offer Creation Process

Follow these 10 steps in order to build a Grand Slam Offer from scratch:

1. **Identify your starving crowd** — score markets on pain, purchasing power, targetability, growth.
2. **Define the Dream Outcome** — the single most desirable result, in the customer's words.
3. **List every obstacle** — every problem, fear, objection, and friction point on the way.
4. **Create solutions for each obstacle** — with a delivery vehicle (1-on-1, group, DIY, done-for-you, software, physical).
5. **Apply Trim & Stack** — cut low-value/high-cost solutions; keep high-value/low-cost ones.
6. **Set value-based pricing** — price at 10-20% of the Dream Outcome's value (10:1 to 5:1).
7. **Design your bonuses** — one per remaining objection, each named with a defensible dollar value.
8. **Choose your guarantee** — pick the type that fits your model and risk tolerance; name it; make it bold.
9. **Add ethical scarcity and urgency** — real limits (seats, cohorts) and real deadlines.
10. **Name the offer using MAGIC** — combine avatar, goal, timeframe, container; test 3-5 variations.

## Common Mistakes

| Mistake | Why It Fails | Fix |
|---------|-------------|-----|
| **Selling a commodity** | Commodities compete on price; you lose | Bundle unique value to become a category of one |
| **Pricing based on cost** | Leaves value on the table, signals low quality | Price on Dream Outcome value (10:1 rule) |
| **No guarantee** | Prospect bears all the risk and hesitates | Reverse risk — stronger guarantees reduce refunds |
| **Vague bonuses** | "Access to community" means nothing | Name each bonus, describe value, assign a dollar amount |
| **Fake scarcity** | Destroys trust when caught | Only 100% real, verifiable scarcity |
| **Generic naming** | "Business Growth Program" could be anything | Apply the MAGIC formula |
| **Targeting everyone** | "For anyone" attracts no one | Narrow the avatar until uncomfortable, then go narrower |

## Quick Diagnostic

Use this table to audit any existing offer:

| Question | If No | Action |
|----------|-------|--------|
| Does the offer deliver 10x the price in perceived value? | Feels overpriced | Add bonuses or raise the Dream Outcome |
| Is the market a starving crowd (pain + money + targetable + growing)? | Hard to sell regardless | Switch markets or narrow further |
| Does the guarantee reverse the prospect's risk? | Fear blocks the sale | Add a guarantee that makes yes feel safe |
| Are there at least 3 named bonuses with dollar values? | Offer feels thin | Create objection-killing bonuses |
| Is there a real reason to act now? | "I'll think about it" | Add ethical scarcity/urgency with a real deadline |
| Could a competitor offer the exact same thing? | Commodity; price war | Bundle elements that defy comparison |
| Does the name say who it's for and what they get? | No self-selection | Rename using MAGIC |

## Reference Files

- [value-equation.md](references/value-equation.md): The four levers of the Value Equation, optimization tactics for each, and scoring rubric
- [grand-slam-offers.md](references/grand-slam-offers.md): Full offer assembly process, problem-solution mapping, and the Trim & Stack method
- [starving-crowd.md](references/starving-crowd.md): Market selection criteria, demand validation, and niche scorecard template
- [pricing-strategy.md](references/pricing-strategy.md): Value-based pricing, anchoring techniques, payment plans, and the premium pricing cycle
- [bonuses-stacking.md](references/bonuses-stacking.md): Bonus design framework, dollar value assignment, stacking order, and naming strategies
- [guarantees.md](references/guarantees.md): Five guarantee types, naming guarantees, stacking guarantees, and legal considerations
- [scarcity-urgency.md](references/scarcity-urgency.md): Ethical scarcity patterns, cohort models, evergreen urgency, and what not to do
- [naming-offers.md](references/naming-offers.md): MAGIC formula breakdown, 20+ name examples, and A/B testing offer names
- [case-studies.md](references/case-studies.md): Detailed offer breakdowns across SaaS, coaching, e-commerce, agency, local business, and info products
- [offer-creation-checklist.md](references/offer-creation-checklist.md): Step-by-step worksheet, scoring rubric, and fill-in templates

## Further Reading

Based on Alex Hormozi's offer creation framework:

- [*"$100M Offers: How to Make Offers So Good People Feel Stupid Saying No"*](https://www.amazon.com/100M-Offers-People-Stupid-Saying/dp/1737475731?tag=wondelai00-20) by Alex Hormozi
- [*"$100M Leads: How to Get Strangers to Want to Buy Your Stuff"*](https://www.amazon.com/100M-Leads-Strangers-Want-Stuff/dp/1737475774?tag=wondelai00-20) by Alex Hormozi

## About the Author

**Alex Hormozi** is an entrepreneur, investor, and founder of Acquisition.com, a portfolio of companies generating over $200 million per year. *$100M Offers*, his actionable playbook for creating irresistible offers, has become one of the most widely recommended business books among entrepreneurs and marketers.


## Sub-skill: predictable-revenue

# Predictable Revenue Framework

A systematic approach to building a scalable, predictable B2B sales machine — the outbound prospecting system that helped Salesforce add $100M in recurring revenue.

## Core Principle

**Predictable lead generation drives predictable revenue.** The biggest mistake in sales is having the same people prospect AND close — specialization creates a repeatable, scalable machine. Traditional cold calling is dead; Cold Calling 2.0 (mass, personalized cold emails that generate referrals to the right person) is the new outbound.

## Scoring

**Goal: 10/10.** Rate any sales process 0-10 on predictability, specialization, and process maturity: 10/10 means clear role separation, repeatable prospecting, and predictable pipeline generation; lower scores mean ad-hoc sales or reliance on heroics. Always give the current score and the specific improvements needed to reach 10/10.

## The Three Types of Leads

**Not all leads are equal — treat them differently.**

| Type | Source | Conversion | Cost | Example |
|------|--------|------------|------|---------|
| **Seeds** | Word of mouth, referrals, organic | Highest | Lowest (takes time) | Customer referral, NPS-driven |
| **Nets** | Marketing campaigns, inbound | Medium | Medium | Content, SEO, webinars |
| **Spears** | Outbound prospecting | Lower but predictable | Higher (people-intensive) | Cold Calling 2.0 |

**Key insight:** Most companies over-invest in nets and under-invest in spears; seeds are the best but can't be manufactured quickly. Invest accordingly — customer success and referral programs (seeds), content and paid acquisition (nets), SDR team (spears).

See: [references/lead-types.md](references/lead-types.md) for lead source strategy and investment allocation.

## Sales Role Specialization

**The #1 principle: separate prospecting from closing.** When AEs prospect and close, they hate prospecting and pipeline becomes feast-or-famine.

| Role | Focus | Metrics |
|------|-------|---------|
| **SDR (Sales Development Rep)** | Outbound prospecting → qualified opportunities | Qualified meetings/month |
| **MDR (Market Development Rep)** | Inbound lead qualification | Qualified leads/month |
| **AE (Account Executive)** | Close deals | Revenue closed, win rate |
| **CSM (Customer Success Manager)** | Retain and grow accounts | Retention, expansion revenue |

### SDR (Sales Development Rep)

Generate qualified pipeline: research target accounts, send Cold Calling 2.0 emails, get referred to the right person, qualify with ANUM, pass to AEs. Not their job: closing, inbound leads, or existing customers. One SDR typically generates 10-20 qualified opportunities per month — measure opportunities, response rate, meetings booked, and pipeline value.

### AE (Account Executive)

Close deals from qualified pipeline: run discovery, demo, negotiate, close, hand off to CSM. Not their job: prospecting (SDR), inbound qualification (MDR), or post-sale management (CSM). Measure revenue closed, win rate, average deal size, and sales cycle length.

### CSM (Customer Success Manager)

Retain and grow accounts: onboard, drive adoption, surface expansion opportunities, prevent churn. Measure net revenue retention, churn rate, expansion revenue, and NPS/CSAT.

**The virtuous cycle:** SDR generates pipeline → AE closes → CSM retains/grows → happy customer refers (Seeds).

See: [references/roles.md](references/roles.md) for role definitions, career paths, and hiring profiles.

## Cold Calling 2.0

**Outbound prospecting that replaces traditional cold calling**, which fails on every front: 1-3% connection rate, gatekeepers, brand damage, no scalability.

```
1. Build list → 2. Send mass email → 3. Get referral → 4. Call the referral → 5. Qualify
```

### Step 1: Build Target Account List

Define your Ideal Customer Profile (company size, industry, tech stack, geography, pain points), then build the list via LinkedIn Sales Navigator, ZoomInfo/Apollo/Clearbit, or industry directories. Target 200-500 accounts per SDR per quarter.

### Step 2: The Referral Email

**The core innovation: don't email the decision maker — email above them and ask for a referral down.** Senior people forward emails, and referrals get 3-5x higher response because the introduction comes from inside the company.

**Subject:** Quick question

> Hi [Name],
>
> I'm not sure if you're the right person to speak to about [specific topic] at [Company], but I was hoping you could point me to the right person.
>
> We help [companies like theirs] with [specific value prop].
>
> Would you mind pointing me to the right person to talk to?
>
> Thanks,
> [Your name]

Keep it short (<100 words), no pitch, no attachments or links; ask for a referral, not a meeting; make it easy to forward. Response rate: 9-15% vs. 1-3% for traditional cold emails.

### Step 3: Follow Up

| Day | Action |
|-----|--------|
| 1 | Send referral email |
| 3 | Follow up if no response |
| 7 | Second follow-up (different angle) |
| 14 | Break-up email ("Should I close your file?") |
| 30 | Re-engage (new trigger event or content) |

Break-up emails work because people respond to losing the opportunity (scarcity):

> Hi [Name],
>
> I haven't heard back from you. I don't want to be a pest.
>
> Should I close your file, or would it make sense to chat?

### Step 4: Qualify with ANUM

| Criteria | Question | Strong Signal | Weak Signal |
|----------|----------|---------------|-------------|
| **A**uthority | Can this person decide? | Decision maker or strong influencer | No buying power |
| **N**eed | Do they have the problem you solve? | Active pain, seeking solutions | "Nice to have" |
| **U**rgency | When must they solve it? | This quarter, budget allocated | "Someday" |
| **M**oney | Can they afford it? | Budget exists, within range | No budget, too expensive |

Call structure: rapport (2 min) → set agenda ("understand your situation, see if there's a fit") → discovery questions with ANUM built in (10-15 min) → next steps (if qualified, schedule AE demo).

### Step 5: Hand Off to AE

Include account background and ICP match, contact details and role, pain points, ANUM notes, agreed next steps, and competitive intel. SDR introduces AE on a brief 3-way call or email, then drops off.

**Ethical boundary:** Comply with spam laws (CAN-SPAM, GDPR), honor opt-outs immediately, and represent your offer honestly — referral emails work because they're genuine requests, not tricks.

See: [references/cold-calling-2.md](references/cold-calling-2.md) for email templates, sequences, and scripts; [references/qualification.md](references/qualification.md) for ANUM discovery questions.

## Pipeline Math

Work backward from the revenue goal:

```
Revenue Goal ÷ Average Deal Size = Deals Needed
Deals Needed ÷ Win Rate = Opportunities Needed
Opportunities Needed ÷ SDR Conversion = Prospects Needed
Prospects Needed ÷ Response Rate = Emails Needed
```

**Example:** $1M ARR ÷ $20K deals = 50 deals; ÷ 25% win rate = 200 opportunities; at 10% response rate and 10% response-to-qualified conversion = 20,000 emails ≈ 2-3 SDRs (each sends 300-500/month).

| Metric | Benchmark |
|--------|-----------|
| Emails per SDR per day | 50-100 |
| Response rate | 9-15% |
| Qualified opportunities per SDR per month | 10-20 |
| AE demo-to-close rate | 20-30% |
| Average sales cycle | 30-90 days |

See: [references/pipeline-math.md](references/pipeline-math.md) for revenue modeling templates.

## Building the Sales Development Team

### Hiring SDRs

Hire for coachability (the most important trait), curiosity, strong writing, resilience, and organization — experience is optional. Source recent graduates, career changers, and internal transfers. Career path: SDR (6-18 months) → Senior SDR → AE or SDR Manager.

### SDR Ramp Time

| Phase | Timeline | Expectations |
|-------|----------|-------------|
| Training | Weeks 1-2 | Product knowledge, tools, process |
| Shadowing | Weeks 3-4 | Observe experienced SDRs, practice |
| Ramping | Months 2-3 | 50% of quota |
| Full quota | Month 4+ | 100% of quota |

Expect 3-4 months to full productivity.

### SDR Compensation

Base + variable, typically 60/40 or 70/30. Pay variable per qualified opportunity generated, with bonuses for opportunities that close and for exceeding quota.

See: [references/team-building.md](references/team-building.md) for hiring, onboarding, and compensation detail.

## Metrics and Dashboards

### Leading Indicators (Predictive)

Emails sent per SDR per day, response rate, meetings booked per week, qualified opportunities per month, pipeline value generated.

### Lagging Indicators (Results)

Revenue closed, win rate, average deal size, sales cycle length, customer acquisition cost (CAC).

### Efficiency Metrics

Cost per qualified opportunity, SDR:AE ratio (typically 2-3 SDRs per AE), LTV:CAC (target >3:1), payback period.

**Cadence:** daily activity metrics → weekly pipeline → monthly revenue → quarterly efficiency.

See: [references/metrics.md](references/metrics.md) for dashboard templates.

## Common Mistakes

| Mistake | Why It Fails | Fix |
|---------|-------------|------|
| **AEs prospecting** | Feast-or-famine pipeline | Hire dedicated SDRs |
| **Long, pitchy emails** | Low response rate | Short, referral-focused emails |
| **No ICP definition** | Effort wasted on wrong accounts | Define ICP before hiring SDRs |
| **Too few SDRs** | Not enough pipeline | Work backward from revenue goal |
| **No hand-off process** | Leads fall through cracks | Standardize SDR→AE handoff |
| **Measuring activity, not results** | Busy but not productive | Track qualified opportunities, not emails |

## Quick Diagnostic

Audit any B2B sales process:

| Question | If No | Action |
|----------|-------|--------|
| Are prospecting and closing separated? | SDRs doing both = bottleneck | Create dedicated SDR role |
| Is there a defined outbound process? | Ad-hoc prospecting | Implement Cold Calling 2.0 |
| Can you predict pipeline 3 months out? | Revenue is unpredictable | Build pipeline math model |
| Do you know your lead type mix? | Over-reliance on one source | Balance seeds, nets, spears |
| Is SDR→AE handoff standardized? | Leads lost in transition | Create handoff checklist |

## Reference Files

- [lead-types.md](references/lead-types.md): Seeds, nets, spears strategy and investment
- [roles.md](references/roles.md): SDR, MDR, AE, CSM role definitions and hiring
- [cold-calling-2.md](references/cold-calling-2.md): Email templates, sequences, follow-up cadence
- [pipeline-math.md](references/pipeline-math.md): Revenue modeling, capacity planning
- [team-building.md](references/team-building.md): Hiring, onboarding, compensation, career paths
- [metrics.md](references/metrics.md): Dashboard templates, KPI tracking
- [qualification.md](references/qualification.md): ANUM framework, discovery questions
- [case-studies.md](references/case-studies.md): Salesforce, HubSpot, and scaling stories

## Further Reading

For the complete system:

- [*"Predictable Revenue"*](https://www.amazon.com/Predictable-Revenue-Business-Practices-Salesforce-com/dp/0984380213?tag=wondelai00-20) by Aaron Ross & Marylou Tyler
- [*"From Impossible to Inevitable"*](https://www.amazon.com/Impossible-Inevitable-Hyper-Growth-Companies-Predictable/dp/1119166713?tag=wondelai00-20) by Aaron Ross & Jason Lemkin (scaling to $100M+ ARR)

## About the Author

**Aaron Ross** built the outbound sales process at Salesforce.com that added $100M+ in recurring revenue, and co-founded Predictable Revenue Inc. His book *Predictable Revenue* — known as "The Bible of Outbound Sales" — made Cold Calling 2.0 the standard for B2B outbound prospecting.


## Sub-skill: lead-intelligence

# Lead Intelligence

Agent-powered lead intelligence pipeline that finds, scores, and reaches high-value contacts through social graph analysis and warm path discovery.

## When to Activate

- User wants to find leads or prospects in a specific industry
- Building an outreach list for partnerships, sales, or fundraising
- Researching who to reach out to and the best path to reach them
- User says "find leads", "outreach list", "who should I reach out to", "warm intros"
- Needs to score or rank a list of contacts by relevance
- Wants to map mutual connections to find warm introduction paths

## Tool Requirements

### Required
- **Exa MCP** — Deep web search for people, companies, and signals (`web_search_exa`)
- **X API** — Follower/following graph, mutual analysis, recent activity (`X_BEARER_TOKEN`, plus write-context credentials such as `X_CONSUMER_KEY`, `X_CONSUMER_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET`)

### Optional (enhance results)
- **LinkedIn** — Direct API if available, otherwise browser control for search, profile inspection, and drafting
- **Apollo/Clay API** — For enrichment cross-reference if user has access
- **GitHub MCP** — For developer-centric lead qualification
- **Apple Mail / Mail.app** — Draft cold or warm email without sending automatically
- **Browser control** — For LinkedIn and X when API coverage is missing or constrained

## Pipeline Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│ 1. Signal   │────>│ 2. Mutual    │────>│ 3. Warm Path    │────>│ 4. Enrich    │────>│ 5. Outreach     │
│    Scoring  │     │    Ranking   │     │    Discovery    │     │              │     │    Draft        │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────────────┘     └─────────────────┘
```

## Voice Before Outreach

Do not draft outbound from generic sales copy.

Run `brand-voice` first whenever the user's voice matters. Reuse its `VOICE PROFILE` instead of re-deriving style ad hoc inside this skill.

If live X access is available, pull recent original posts before drafting. If not, use supplied examples or the best repo/site material available.

## Stage 1: Signal Scoring

Search for high-signal people in target verticals. Assign a weight to each based on:

| Signal | Weight | Source |
|--------|--------|--------|
| Role/title alignment | 30% | Exa, LinkedIn |
| Industry match | 25% | Exa company search |
| Recent activity on topic | 20% | X API search, Exa |
| Follower count / influence | 10% | X API |
| Location proximity | 10% | Exa, LinkedIn |
| Engagement with your content | 5% | X API interactions |

### Signal Search Approach

```python
# Step 1: Define target parameters
target_verticals = ["prediction markets", "AI tooling", "developer tools"]
target_roles = ["founder", "CEO", "CTO", "VP Engineering", "investor", "partner"]
target_locations = ["San Francisco", "New York", "London", "remote"]

# Step 2: Exa deep search for people
for vertical in target_verticals:
    results = web_search_exa(
        query=f"{vertical} {role} founder CEO",
        category="company",
        numResults=20
    )
    # Score each result

# Step 3: X API search for active voices
x_search = search_recent_tweets(
    query="prediction markets OR AI tooling OR developer tools",
    max_results=100
)
# Extract and score unique authors
```

## Stage 2: Mutual Ranking

For each scored target, analyze the user's social graph to find the warmest path.

### Ranking Model

1. Pull user's X following list and LinkedIn connections
2. For each high-signal target, check for shared connections
3. Apply the `social-graph-ranker` model to score bridge value
4. Rank mutuals by:

| Factor | Weight |
|--------|--------|
| Number of connections to targets | 40% — highest weight, most connections = highest rank |
| Mutual's current role/company | 20% — decision maker vs individual contributor |
| Mutual's location | 15% — same city = easier intro |
| Industry alignment | 15% — same vertical = natural intro |
| Mutual's X handle / LinkedIn | 10% — identifiability for outreach |

Canonical rule:

```text
Use social-graph-ranker when the user wants the graph math itself,
the bridge ranking as a standalone report, or explicit decay-model tuning.
```

Inside this skill, use the same weighted bridge model:

```text
B(m) = Σ_{t ∈ T} w(t) · λ^(d(m,t) - 1)
R(m) = B_ext(m) · (1 + β · engagement(m))
```

Interpretation:
- Tier 1: high `R(m)` and direct bridge paths -> warm intro asks
- Tier 2: medium `R(m)` and one-hop bridge paths -> conditional intro asks
- Tier 3: no viable bridge -> direct cold outreach using the same lead record

### Output Format

```

If the user explicitly wants the ranking engine broken out, the math visualized, or the network scored outside the full lead workflow, run `social-graph-ranker` as a standalone pass first and feed the result back into this pipeline.
MUTUAL RANKING REPORT
=====================

#1  @mutual_handle (Score: 92)
    Name: Jane Smith
    Role: Partner @ Acme Ventures
    Location: San Francisco
    Connections to targets: 7
    Connected to: @target1, @target2, @target3, @target4, @target5, @target6, @target7
    Best intro path: Jane invested in Target1's company

#2  @mutual_handle2 (Score: 85)
    ...
```

## Stage 3: Warm Path Discovery

For each target, find the shortest introduction chain:

```
You ──[follows]──> Mutual A ──[invested in]──> Target Company
You ──[follows]──> Mutual B ──[co-founded with]──> Target Person
You ──[met at]──> Event ──[also attended]──> Target Person
```

### Path Types (ordered by warmth)
1. **Direct mutual** — You both follow/know the same person
2. **Portfolio connection** — Mutual invested in or advises target's company
3. **Co-worker/alumni** — Mutual worked at same company or attended same school
4. **Event overlap** — Both attended same conference/program
5. **Content engagement** — Target engaged with mutual's content or vice versa

## Stage 4: Enrichment

For each qualified lead, pull:

- Full name, current title, company
- Company size, funding stage, recent news
- Recent X posts (last 30 days) — topics, tone, interests
- Mutual interests with user (shared follows, similar content)
- Recent company events (product launch, funding round, hiring)

### Enrichment Sources
- Exa: company data, news, blog posts
- X API: recent tweets, bio, followers
- GitHub: open source contributions (for developer-centric leads)
- LinkedIn (via browser-use): full profile, experience, education

## Stage 5: Outreach Draft

Generate personalized outreach for each lead. The draft should match the source-derived voice profile and the target channel.

### Channel Rules

#### Email

- Use for the highest-value cold outreach, warm intros, investor outreach, and partnership asks
- Default to drafting in Apple Mail / Mail.app when local desktop control is available
- Create drafts first, do not send automatically unless the user explicitly asks
- Subject line should be plain and specific, not clever

#### LinkedIn

- Use when the target is active there, when mutual graph context is stronger on LinkedIn, or when email confidence is low
- Prefer API access if available
- Otherwise use browser control to inspect profiles, recent activity, and draft the message
- Keep it shorter than email and avoid fake professional warmth

#### X

- Use for high-context operator, builder, or investor outreach where public posting behavior matters
- Prefer API access for search, timeline, and engagement analysis
- Fall back to browser control when needed
- DMs and public replies should be much tighter than email and should reference something real from the target's timeline

#### Channel Selection Heuristic

Pick one primary channel in this order:

1. warm intro by email
2. direct email
3. LinkedIn DM
4. X DM or reply

Use multi-channel only when there is a strong reason and the cadence will not feel spammy.

### Warm Intro Request (to mutual)

Goal:

- one clear ask
- one concrete reason this intro makes sense
- easy-to-forward blurb if needed

Avoid:

- overexplaining your company
- social-proof stacking
- sounding like a fundraiser template

### Direct Cold Outreach (to target)

Goal:

- open from something specific and recent
- explain why the fit is real
- make one low-friction ask

Avoid:

- generic admiration
- feature dumping
- broad asks like "would love to connect"
- forced rhetorical questions

### Execution Pattern

For each target, produce:

1. the recommended channel
2. the reason that channel is best
3. the message draft
4. optional follow-up draft
5. if email is the chosen channel and Apple Mail is available, create a draft instead of only returning text

If browser control is available:

- LinkedIn: inspect target profile, recent activity, and mutual context, then draft or prepare the message
- X: inspect recent posts or replies, then draft DM or public reply language

If desktop automation is available:

- Apple Mail: create draft email with subject, body, and recipient

Do not send messages automatically without explicit user approval.

### Anti-Patterns

- generic templates with no personalization
- long paragraphs explaining your whole company
- multiple asks in one message
- fake familiarity without specifics
- bulk-sent messages with visible merge fields
- identical copy reused for email, LinkedIn, and X
- platform-shaped slop instead of the author's actual voice

## Configuration

Users should set these environment variables:

```bash
# Required
export X_BEARER_TOKEN="..."
export X_ACCESS_TOKEN="..."
export X_ACCESS_TOKEN_SECRET="..."
export X_CONSUMER_KEY="..."
export X_CONSUMER_SECRET="..."
export EXA_API_KEY="..."

# Optional
export LINKEDIN_COOKIE="..." # For browser-use LinkedIn access
export APOLLO_API_KEY="..."  # For Apollo enrichment
```

## Agents

This skill includes specialized agents in the `agents/` subdirectory:

- **signal-scorer** — Searches and ranks prospects by relevance signals
- **mutual-mapper** — Maps social graph connections and finds warm paths
- **enrichment-agent** — Pulls detailed profile and company data
- **outreach-drafter** — Generates personalized messages

## Example Usage

```
User: find me the top 20 people in prediction markets I should reach out to

Agent workflow:
1. signal-scorer searches Exa and X for prediction market leaders
2. mutual-mapper checks user's X graph for shared connections
3. enrichment-agent pulls company data and recent activity
4. outreach-drafter generates personalized messages for top ranked leads

Output: Ranked list with warm paths, voice profile summary, and channel-specific outreach drafts or drafts-in-app
```

## Related Skills

- `brand-voice` for canonical voice capture
- `connections-optimizer` for review-first network pruning and expansion before outreach


## Sub-skill: cro-methodology

# CRO Methodology

Scientific, customer-centric approach to conversion rate optimization based on the CRE Methodology(TM). Extraordinary improvements come from understanding WHY visitors don't convert, not from copying competitors or applying generic tips.

## Core Principle

**Don't guess -- discover.** Every visitor who doesn't convert has a reason. Discover those reasons through research, then systematically eliminate them with evidence and proof. This evidence-based approach consistently outperforms "best practices", intuition, competitor copying, and expert opinion.

## Scoring

**Goal: 10/10.** Rate any landing page, funnel, or conversion flow 0-10 against the principles below. Report the current score and the specific improvements needed to reach 10/10.

## The CRO Frameworks

### 1. The CRO Process

**Core concept:** A systematic 9-step process moving from defining success metrics through research and experimentation to scaling wins across the business.

**Why it works:** Random optimization skips research. The process forces you to understand visitors before changing anything, so every change rests on evidence, not opinion.

**Key insights:**
- Define success metrics aligned with business KPIs before touching any page
- Map the entire funnel to find "blocked arteries" (high-traffic underperforming paths) and "missing links" (absent funnel stages)
- Research visitors in three dimensions: who they are, what blocks them (UX problems), what stops them (objections)
- Gather market intelligence from competitors, reviews, and other industries
- Prioritize ideas with ICE scoring; design bold experiments, not "meek tweaks"
- Run experiments with statistical rigor (95% confidence minimum, full business cycles), then scale wins across the business

**Product applications:**

| Context | CRO Process Step | Example |
|---------|-----------------|---------|
| **Landing page audit** | Define goals, map funnel, research visitors | 70% bounce because value prop is unclear |
| **Checkout optimization** | Map funnel for blocked arteries | Shipping cost shock causes 40% cart abandonment |
| **Email sequence** | Scale wins | Winning objection-handling copy reused in drip emails |

**Copy patterns:**
- "What's preventing you from [action] today?" (exit survey to discover objections)
- "Here's what [X] customers found..." (counter-objection with social proof)
- Hypothesis template: "If we [change X], then [metric Y] will improve because [reason from research]"

**Ethical boundary:** Never manipulate test results or cherry-pick data; report all tests, including failures.

See: [testing-methodology.md](references/testing-methodology.md) for ICE scoring, A/B vs. multivariate guidance, and statistical rigor.

### 2. Customer Research & Objections

**Core concept:** Visitors fail to convert for specific, discoverable reasons. Exit surveys, chat logs, support tickets, sales calls, and reviews reveal the "voice of the customer" and their real objections.

**Why it works:** Teams' guesses about why visitors leave are almost always wrong. Research uncovers objections no one anticipated, and the customer's own language out-persuades any copywriter's invention.

**Key insights:**
- Primary sources (exit surveys, live chat, tickets, sales calls) give direct visitor language; secondary sources (reviews, social media, competitors) reveal industry-wide objections
- The "Big 5" universal objections: Trust, Price, Fit, Timing, Effort
- Quantitative research (analytics, heatmaps) shows WHERE problems are; qualitative (surveys, interviews) shows WHY
- Non-converter surveys should ask ONE question for maximum response; post-purchase surveys ("What almost stopped you from buying?") reveal the objections that matter most

**Product applications:**

| Context | Research Method | Example |
|---------|---------------|---------|
| **Exit intent** | On-site survey | "What's preventing you from signing up today?" |
| **Post-purchase** | Email survey within 7 days | "What almost stopped you from buying?" |
| **Objection mining** | Support tickets + reviews | Search "but", "however", "worried about"; negative reviews = unaddressed objections |

**Copy patterns:**
- Use exact customer language in headlines and body copy -- it outperforms polished marketing copy
- "What's the one thing we could change to make you [action]?"
- "How would you describe [product] to a friend?" (reveals positioning in customer terms)

**Ethical boundary:** Anonymize data, get consent for recordings, and don't survey so aggressively that you degrade the experience.

See: [RESEARCH.md](references/RESEARCH.md) for tools, survey questions, and data analysis methods.

### 3. Persuasion Assets

**Core concept:** Every company sits on overlooked proof -- undisplayed testimonials, unmentioned awards, hidden credentials, buried guarantees. Inventory these "persuasion assets", acquire missing ones, display them.

**Why it works:** Visitors decide on evidence, not claims. A modest claim with overwhelming proof beats a bold claim with none.

**Key insights:**
- Audit five categories: Credentials & Authority, Social Proof, Risk Reversal, Data & Specificity, Process & Methodology
- Create a wish list for missing assets and actively acquire them (request testimonials, apply for awards, compile statistics)
- "Proof sandwich" structure: Claim (bold promise), then Proof (evidence), then Reinforcement (secondary proof)
- Proof hierarchy, strongest first: specific results with context > named testimonials with photos > case studies > statistics > logos > generic testimonials
- Place proof at points of friction, not in FAQs; specific numbers beat round ones ("47,832 customers" beats "About 50,000")

**Product applications:**

| Context | Persuasion Asset | Example |
|---------|-----------------|---------|
| **Landing page header** | Logo bar + rating | "Trusted by 10,000+ companies" with 5 recognizable logos |
| **Pricing page** | Risk reversal | "30-day money-back guarantee, no questions asked" |
| **Checkout flow** | Trust badges near forms | Security certification, payment logos, guarantee seal |

**Copy patterns:**
- "Here's how we did it for [Company X]..." (case study proof)
- "[Specific number] businesses trust us" (not "thousands of customers")
- Lead with benefits, not features: "Never delete another photo" beats "256GB storage"

**Ethical boundary:** Never fabricate testimonials, inflate statistics, or display fake trust badges -- all proof must be genuine and verifiable.

See: [PERSUASION.md](references/PERSUASION.md) for the full persuasion assets checklist and psychological triggers.

### 4. The O/CO Framework

**Core concept:** The Objection/Counter-Objection table is the core CRE technique: map every visitor objection to a specific, evidence-backed counter-objection.

**Why it works:** Visitors arrive with objections; if the page doesn't address them, they leave. The O/CO table ensures no objection goes unanswered, each counter placed where the objection arises in the reading flow.

**Key insights:**
- Research objections from surveys, chat logs, tickets, and sales calls -- don't guess
- Implicit objections (ones visitors won't admit) require "CO Only": counter without stating the objection
- Place counter-objections at the point of friction (credit-card objection near the payment form), not buried in FAQ
- Address primary objections above the fold; repeat the same counter in multiple formats (text, video, testimonial, data)
- Canned support responses are goldmines of tested counter-objections

**Product applications:**

| Objection | Visitor Question | Counter-Objections |
|-----------|------------------|--------------------|
| **Trust** | "Why should I believe you?" | Named testimonials, media logos, awards, guarantee |
| **Price** | "Is it worth the money?" | ROI calculator, cost comparison vs. alternatives, payment plans |
| **Fit** | "Will it work for MY situation?" | Similar-customer case studies, segmented pages, free trial |
| **Timing** | "Why act now?" | Cost-of-delay math, genuine limited offers, seasonal relevance |
| **Effort** | "How hard will this be?" | "Done for you" framing, "Set up in 5 minutes", step-by-step breakdown |

**Copy patterns:**
- Bad (states implicit objection): "Worried you're too lazy to learn a language?"
- Good (CO Only): "Let the audio do the work for you."
- "What almost stopped you from buying?" (post-purchase survey to validate the O/CO table)

**Ethical boundary:** Address real objections honestly -- never dismiss legitimate concerns or use deception to overcome valid hesitations.

See: [OBJECTIONS.md](references/OBJECTIONS.md) for the full O/CO framework, research methods, and counter-objection techniques.

### 5. Hypothesis Design

**Core concept:** Every experiment needs a documented hypothesis linking a specific change to an expected outcome for a research-grounded reason, prioritized with ICE scoring (Impact, Confidence, Ease).

**Why it works:** A hypothesis forces you to articulate WHY a change should work, grounding it in customer research. ICE scoring stops teams wasting traffic on low-impact tweaks.

**Key insights:**
- Format: "If we [change X], then [metric Y] will improve because [reason based on research]"
- Define primary (decides winner), secondary (monitoring), and guardrail (must not decrease) metrics before testing
- ICE, 1-10 each: Impact (could this double conversion?), Confidence (how strong is the research?), Ease (how easy to implement?)
- Worth testing: complete redesign, new value proposition, fundamentally different offer. Not worth testing: button color, font size, image swap
- Before testing, ask: "Could this 10x our results?" If not, reconsider priority

**Product applications:**

| Context | Hypothesis Example | ICE Score |
|---------|-------------------|-----------|
| **Headline rewrite** | "Customer language from surveys will lift conversion because visitors see their own words" | I:8, C:9, E:10 = 9.0 |
| **Checkout redesign** | "One-page checkout will lift completion because analytics show 40% drop at step 2" | I:9, C:6, E:3 = 6.0 |
| **Button color** | "Green button will lift clicks because green means go" | I:2, C:2, E:10 = 4.7 (skip) |

**Copy patterns:**
- "Based on our research, visitors' #1 objection is [X]. This test addresses it by [Y]."
- Document before: hypothesis, primary metric, sample size, duration. Document after: raw numbers, confidence interval, learnings, next steps

**Ethical boundary:** Report all results honestly -- never cherry-pick data or rerun tests until you get the answer you want.

### 6. A/B Testing Methodology

**Core concept:** Run controlled experiments comparing page versions with proper statistical rigor, so results reflect reality rather than random noise.

**Why it works:** Without rigor you can't distinguish real improvements from random variation -- peeking, undersized samples, and ignored practical significance all manufacture false winners.

**Key insights:**
- Calculate required sample size BEFORE starting (baseline rate, minimum detectable effect, 80% power, 95% significance)
- Run at least one full business cycle (1-2 weeks), covering weekdays AND weekends
- Never peek at results and stop early -- it dramatically inflates false positives
- Practical significance matters: a statistically significant 0.1% lift isn't worth implementation complexity
- Use multivariate only with 100k+ monthly visitors on a proven winning page
- Promote winners to the new control; a failed test that teaches you something beats a win you don't understand

**Product applications:**

| Context | Test Type | Example |
|---------|----------|---------|
| **Concept validation** | A/B test (2-4 variants) | Two fundamentally different layouts based on different customer insights |
| **Low traffic** | Bold A/B test | Dramatic changes detectable with smaller samples (~4,000 visitors for 50% lift) |
| **Post-test** | Scale wins | Apply winning insights to landing pages, ad copy, email sequences |

**Copy patterns:**
- "We increased [metric] by [X]% with [Y]% confidence over [Z] weeks"
- "Test showed no significant difference, teaching us that [insight about customers]"
- Document learnings: Test, Hypothesis, Result, Learning, Applicable to

**Ethical boundary:** Never manipulate statistics to manufacture significance; report confidence intervals honestly and acknowledge inconclusive results.

## Common Mistakes

| Mistake | Why It Fails | Fix |
|---------|-------------|------|
| **Copying competitors blindly** | You don't know if it even works for them | Research YOUR visitors' objections, build YOUR evidence |
| **Testing button colors before understanding objections** | Surface symptoms, tiny effects, wasted sample | Customer research first, then test big changes |
| **Assuming you know why visitors leave** | Teams are almost always wrong about motivations | Exit surveys, chat logs, support-ticket analysis |
| **Applying "best practices" unvalidated** | May not fit your audience, product, or context | Treat them as hypotheses to test, not rules |
| **HiPPO decisions** | Highest Paid Person's Opinion is not data | Let research and test results decide, not seniority |
| **Optimizing pages without funnel context** | Fixes shift problems elsewhere; misses biggest wins | Map the funnel, find blocked arteries, prioritize by impact |
| **Meek tweaks instead of bold changes** | Rarely reach significance; waste time and traffic | Test changes that could double conversion, not nudge it 2% |
| **Giving up after one failed test** | The opportunity still exists | Investigate why, return to research, try a bolder change |

## Quick Diagnostic

Audit any landing page or conversion flow:

| Question | If No | Action |
|----------|-------|--------|
| Do we know the ONE action visitors should take? | Page lacks focus | Define a single conversion goal; remove competing CTAs |
| Have we researched (not guessed) why visitors don't convert? | Optimization built on assumptions | Run exit surveys, analyze chat logs and tickets |
| Do we have an O/CO table? | Objections go unanswered | Build it from research; place counters at friction points |
| Is the value proposition clear within 5 seconds? | Visitors bounce before understanding | Run a 5-second test; rewrite headline in customer language |
| Are persuasion assets visible (testimonials, awards, guarantees)? | Claims without proof aren't believed | Audit assets, acquire missing ones, display prominently |
| Have we mapped the funnel for blocked arteries? | Optimizing the wrong page | Map traffic per stage, compare to benchmarks, prioritize |

## Quick-Start Checklist

When optimizing any page:

1. [ ] What is the ONE action visitors should take?
2. [ ] Who are the visitors? What stage of the buying journey?
3. [ ] What are their top 3-5 objections? (Research, don't guess)
4. [ ] What proof/counter-objections address each?
5. [ ] Is the value proposition clear in 5 seconds?
6. [ ] Are there UX blockers? (speed, mobile, forms)
7. [ ] What persuasion assets are missing or hidden?

## Reference Files

- [OBJECTIONS.md](references/OBJECTIONS.md): O/CO framework, research methods, counter-objection techniques
- [COPYWRITING.md](references/COPYWRITING.md): Headlines, proof elements, persuasive writing
- [PERSUASION.md](references/PERSUASION.md): Persuasion assets checklist, psychological triggers
- [RESEARCH.md](references/RESEARCH.md): Tools, survey questions, data analysis
- [testing-methodology.md](references/testing-methodology.md): A/B testing, statistical significance, ICE prioritization, multivariate testing
- [funnel-analysis.md](references/funnel-analysis.md): Blocked arteries, missing links, industry funnels, cross-sell mapping

## Further Reading

For the complete CRE Methodology(TM), detailed case studies, and advanced techniques:

- [*"Making Websites Win: Apply the Customer-Centric Methodology That Has Doubled the Sales of Many Leading Websites"*](https://www.amazon.com/Making-Websites-Win-Customer-Centric-Methodology/dp/1544500513?tag=wondelai00-20) by Dr. Karl Blanks and Ben Jesson

## About the Author

**Dr. Karl Blanks and Ben Jesson** are cofounders of Conversion Rate Experts, the agency whose CRE Methodology has doubled the sales of many leading websites -- clients include Google, Apple, Amazon, Facebook, and Dropbox -- and earned a Queen's Award for Enterprise (Innovation). Blanks holds a PhD and led usability teams at Hewlett-Packard; Jesson's background is direct-response marketing. Their book *Making Websites Win* distills the methodology into a repeatable, evidence-based process.
