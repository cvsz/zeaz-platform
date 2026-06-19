---
name: zai-copy
description: Expert AI skill for writing high-converting advertising copy that attracts attention and drives purchasing decisions.
---

# Copywriting AI Expert Skill

## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## 1. Core Frameworks
* **AIDA (Attention, Interest, Desire, Action)**: Hook the reader, build interest, create desire, and provide a clear CTA.
* **PAS (Problem, Agitation, Solution)**: Highlight a painful problem, agitate the consequences, and introduce the product as the solution.
* **FAB (Features, Advantages, Benefits)**: Translate technical features into emotional or practical benefits for the end user.

## 2. Psychological Triggers
* **Urgency & Scarcity**: "Limited time offer", "Only 3 spots left".
* **Social Proof**: "Join 10,000+ satisfied customers."
* **Risk Reversal**: "100% Money-Back Guarantee."

## 3. Best Practices
* **Focus on the Customer**: Use the word "You" frequently. Limit the use of "We" or "I".
* **Skimmability**: Use short paragraphs (1-3 sentences maximum), bullet points, and bold text for key phrases.
* **One Goal**: Every piece of copy should have exactly one Call to Action (CTA).

## 4. Thai Market Context
* **Conversational Tone**: Thai consumers respond well to a friendly, peer-to-peer tone.
* **Emotional Connection (อารมณ์นำเหตุผล)**: Emphasize how the product makes them feel or provides peace of mind.
* **Clear Value**: Highlight promotions, free shipping, and clear ROI early in the copy.


## Sub-skill: storybrand-messaging

# StoryBrand Messaging Framework

Clarify your message so customers will listen. Customers don't buy the best products — they buy the ones they can understand the fastest.

## Core Principle

**The customer is the hero, not your brand.** Your brand is the guide who helps the hero win. Position yourself as the hero and you compete with your customer; position yourself as the guide and you serve them.

## Scoring

**Goal: 10/10.** Rate any marketing copy or brand messaging 0-10 against the principles below. Always state the current score and the specific changes needed to reach 10/10.

## The SB7 Framework

Every compelling story follows the same pattern. Use this structure for all messaging:

### 1. A Character (The Hero)

**Core concept:** The customer is the hero, and your job is to define the ONE thing they want. Be specific about that single desire.

**Why it works:** Naming a desire opens a story gap — the distance between where the customer is and where they want to be. That tension pulls them in because they feel understood and want the gap closed.

**Key insights:**
- Focus on ONE desire per message — multiple desires dilute the story gap
- Tie the desire to survival (physical, financial, relational, or spiritual)
- Aspirational identity is powerful ("become the leader everyone respects")
- Different segments have different desires — write separate messaging per role, stage, and pain intensity

**Product applications:**

| Context | Application | Example |
|---------|-------------|---------|
| Homepage headline | Desire as outcome | "You want a beautiful smile" (not "our dentistry is excellent") |
| Landing page | One desire per page | "You want to retire early" |
| Segmentation | Tailor desire per segment | CEO: "Scale without chaos" vs. IC: "Do your best work without friction" |

**Copy patterns:**
- "You want [specific desire]..."
- "Imagine [aspirational identity]..."
- "What if you could [single clear outcome]?"

**Ethical boundary:** Ground desires in real research or observed behavior — never fabricate aspirations the customer does not hold.

See: [references/brand-script.md](references/brand-script.md) for the complete BrandScript worksheet covering all seven elements.

### 2. Has a Problem

**Core concept:** Define the problem at three levels — external (tangible), internal (emotional), philosophical (the injustice) — and personify it with a specific villain.

**Why it works:** Companies sell solutions to external problems, but customers buy solutions to internal ones. Naming how the problem makes them feel — confused, overwhelmed, embarrassed — taps the emotional driver behind purchases.

**Key insights:**
- External: "my investments are scattered"; internal: "I feel overwhelmed"; philosophical: "people shouldn't need to be experts to retire well"
- A good villain is specific and relatable, not abstract — "Wall Street jargon designed to confuse you", not "complexity"
- Most brands stop at external problems, missing the internal ones that drive purchases

**Product applications:**

| Context | Application | Example |
|---------|-------------|---------|
| Website problem section | Name all three levels | External: "Scattered tools." Internal: "You feel overwhelmed." Philosophical: "Teams deserve clarity." |
| Email nurture | Lead with internal problem | "Tired of feeling like you're guessing?" |
| Ad copy | Personify the villain | "Stop letting confusing software steal your evenings." |

**Copy patterns:**
- "You're tired of [internal problem]..."
- "[Villain] has been keeping you from [desire]..."
- "It's not right that [philosophical problem]..."

**Ethical boundary:** Name real frustrations honestly — never exaggerate problems or invent suffering to create fear.

### 3. And Meets a Guide

**Core concept:** Your brand is the guide, expressing empathy AND authority. Empathy shows you understand the pain; authority proves you can solve it.

**Why it works:** Customers are looking for a guide, not another hero — think Yoda, not Luke. Empathy makes them feel seen, authority (testimonials, logos, statistics) makes them feel safe, and together they create trust.

**Key insights:**
- Empathy without authority seems weak; authority without empathy seems arrogant
- Show empathy with "we understand" language; show authority with testimonials, client logos, statistics, awards
- Never make your origin story the centerpiece — that is hero behavior; brief, relevant credentials suffice

**Product applications:**

| Context | Application | Example |
|---------|-------------|---------|
| About page | Empathy first, then credentials | "We know what it's like to feel lost in financial jargon. That's why 10,000 families trust us." |
| Homepage social proof | Empathy headline + authority logos | "You're not alone. Join 5,000+ teams who found clarity." + client logos |
| Sales call | Open with empathy, close with authority | "I hear you — that sounds frustrating. Here's what we've seen work for teams like yours." |

**Copy patterns:**
- "We understand what it's like to [empathy statement]..."
- "We've helped [number] [customers] achieve [result]..."
- "You don't have to figure this out alone..."

**Ethical boundary:** Claim only earned authority — real testimonials, accurate statistics, verifiable credentials.

See: [references/sales-conversations.md](references/sales-conversations.md) for discovery questions, objection handling, and sales scripts.

### 4. Who Gives Them a Plan

**Core concept:** Give two plans: a Process Plan (3-4 steps showing how to work with you) and an Agreement Plan (commitments that remove risk).

**Why it works:** A clear plan acts as stepping stones across a creek — it reduces cognitive load and perceived risk. Without one, the path feels murky and customers stall.

**Key insights:**
- Process Plan: 3-4 numbered steps max, action verbs, memorable names ("1. Schedule a call. 2. Get a custom plan. 3. Start seeing results.")
- Agreement Plan: fear-removing commitments ("100% satisfaction guaranteed", "Cancel anytime")
- More than 4 steps overwhelms; numbering implies order and ease

**Product applications:**

| Context | Application | Example |
|---------|-------------|---------|
| Website plan section | 3-step process with icons | "1. Book a demo. 2. Get onboarded. 3. See results in 30 days." |
| Pricing page | Agreement plan reduces anxiety | "No contracts. Cancel anytime. 30-day money-back guarantee." |
| Email CTA | Reference the plan | "Getting started is simple — just three steps." |

**Copy patterns:**
- "Here's how it works: Step 1... Step 2... Step 3..."
- "Getting started is easy. Just [step 1]."
- "We promise [agreement plan commitment]."

**Ethical boundary:** Promise only outcomes you reliably deliver, and honor agreement-plan commitments without exception.

### 5. And Calls Them to Action

**Core concept:** If you don't ask, they won't act. Use a Direct CTA (primary conversion action) plus a Transitional CTA (lower-commitment alternative).

**Why it works:** Customers act only when challenged to act. The transitional CTA keeps not-yet-ready people in your story until they are.

**Key insights:**
- Direct: "Buy Now", "Schedule a Call", "Get Started"; Transitional: "Download Free Guide", "Watch Demo", "Take the Quiz"
- Make the Direct CTA a visually prominent button (contrasting color) and repeat it down the page
- Use action language ("Get" not "Submit"); one obvious Direct CTA per page

**Product applications:**

| Context | Application | Example |
|---------|-------------|---------|
| Homepage | Direct CTA above the fold, repeated | "Get Started Free" in header and after each section |
| Blog post | Transitional CTA at the end | "Download our free checklist" |
| Email | Single Direct CTA per message | One "Schedule Your Call" button |

**Copy patterns:**
- "Get [desired result] now."
- "Start your free [trial/demo/assessment] today."
- "Download your free [lead magnet]."

**Ethical boundary:** CTAs must honestly represent what happens on click — never disguise a purchase as a free action.

See: [references/website-wireframe.md](references/website-wireframe.md) for page-by-page structure and interior page templates.

### 6. That Helps Them Avoid Failure

**Core concept:** Show what happens if the customer does not act. Without stakes, there is no story.

**Why it works:** Humans are loss-averse — fear of losing motivates more than promise of gaining. A taste of what could go wrong moves customers from "interested" to "committed".

**Key insights:**
- A taste of consequence is enough — don't run a scare campaign
- Focus on opportunity cost, not punishment ("another year of feeling stuck")
- Pair failure with success messaging to create contrast

**Product applications:**

| Context | Application | Example |
|---------|-------------|---------|
| Landing page stakes section | Brief failure scenario before CTA | "Without a clear message, you'll keep losing customers to competitors they understand faster." |
| Email subject line | Light urgency | "Are you leaving revenue on the table?" |
| Sales conversation | Name cost of inaction | "What happens to your team if nothing changes in 6 months?" |

**Copy patterns:**
- "Don't let [negative outcome] happen when [solution] is this simple."
- "How long will you wait before [addressing the problem]?"
- "Every day without [solution], you're [cost of inaction]."

**Ethical boundary:** State real, proportionate consequences of inaction — no fear-mongering or fabricated urgency.

### 7. And Ends in Success

**Core concept:** Paint a vivid picture of life after working with you — in terms of status, completeness, and self-realization. Success closes the story gap opened in Element 1.

**Why it works:** People need to see the destination before starting the journey. Showing the transformation — not features — lets customers place themselves in that future and feel its pull.

**Key insights:**
- Status: "Become the go-to expert"; completeness: "Finally have financial peace of mind"; self-realization: "Be the leader you were meant to be"
- Show transformation with before/after comparisons and specific numbers
- Keep the success picture tangible, never vague or generic

**Product applications:**

| Context | Application | Example |
|---------|-------------|---------|
| Homepage success section | Specific after picture | "Imagine opening your inbox to qualified leads every morning — no cold outreach required." |
| Case study | Before/after with numbers | "Before: 2% conversion rate. After: 11% in 90 days." |
| Testimonials | Customers describe their success | "I finally feel like I know where every dollar is going." |

**Copy patterns:**
- "Imagine [specific success picture]..."
- "Join [number] [customers] who now [success outcome]..."
- "Finally, [completeness outcome] — without [old frustration]."

**Ethical boundary:** Promise only substantiated results; testimonials must reflect genuine customer experiences.

## The One-Liner

A single sentence that explains what you do. Use it everywhere.

**Formula:** `[Problem] + [Solution] + [Result]`

**Structure:** "We help [CHARACTER] who struggle with [PROBLEM] to [SOLUTION] so they can [RESULT]."

**Example:** "We help small business owners who feel overwhelmed by marketing create a clear message so they can grow their revenue."

**Test:** Can someone repeat it after hearing it once?

See: [references/one-liners.md](references/one-liners.md) for industry examples and variations.

## Tone and Voice Guidelines

Keep brand voice consistent across channels while adapting to context.

**Convey guide qualities:** empathy ("We understand..."), authority ("In our experience..."), confidence ("Here's what works..."), helpfulness ("Let us show you...").

**Avoid:** hero language ("We're the best at..."), jargon (use the customer's words), condescension, and tentative weakness.

See: [references/multi-channel-consistency.md](references/multi-channel-consistency.md) for social media, video, podcast, and PR adaptation.

## Common Mistakes

| Mistake | Why It Fails | Fix |
|---------|-------------|-----|
| Being the hero | Competes with customer | Position as guide |
| Multiple messages | Confuses people | One clear message per asset |
| Clever > clear | People don't decode messaging | Choose clarity always |
| Feature-focused | Customers buy transformation | Lead with outcomes |
| No clear CTA | No direction = no action | Ask for the sale |
| No stakes | No urgency = no motivation | Paint failure picture |
| Starting with "We" | Self-focused | Start with customer's problem |

## Quick Diagnostic

| Question | If No | Action |
|----------|-------|--------|
| Can a caveman grasp the offer in 5 seconds? | Message too complex | Simplify to one desire, one outcome |
| Is the customer clearly the hero? | Brand competes with customer | Rewrite from customer's perspective |
| Is the internal problem named, not just external? | Missing the emotional driver | Add "how it feels" language |
| Do you show empathy AND authority? | Trust gap | Add "we understand" + proof points |
| Is there a clear 3-step plan? | Path feels risky | Add Process + Agreement plans |
| Is there one obvious CTA? | Nobody acts | Add prominent, repeated Direct CTA |
| Do you show success AND failure stakes? | No narrative tension | Paint both outcome pictures |

## Reference Files

- [brand-script.md](references/brand-script.md): Complete BrandScript worksheet for all seven elements
- [one-liners.md](references/one-liners.md): One-liner formula, industry examples, variations
- [website-wireframe.md](references/website-wireframe.md): Page-by-page website structure, interior page templates
- [email-sequences.md](references/email-sequences.md): Nurture and welcome sequences, templates, subject line formulas
- [sales-conversations.md](references/sales-conversations.md): Discovery questions, objection handling, sales scripts
- [multi-channel-consistency.md](references/multi-channel-consistency.md): Social media adaptation, video scripts, podcast, PR, brand voice guidelines

## Further Reading

For the complete methodology and worksheets:

- [*"Building a StoryBrand: Clarify Your Message So Customers Will Listen"*](https://www.amazon.com/Building-StoryBrand-Clarify-Message-Customers/dp/0718033329?tag=wondelai00-20) by Donald Miller

## About the Author

Donald Miller is the CEO of StoryBrand, which has helped over 10,000 businesses clarify their messaging. A New York Times bestselling author of *Building a StoryBrand*, *Marketing Made Simple*, and *Business Made Simple*, he distilled decades of narrative theory into the practical seven-part SB7 framework.


## Sub-skill: made-to-stick

# Made to Stick Framework

A framework for crafting ideas and messages that are understood, remembered, and drive lasting action. Based on decades of research into why some ideas survive and others die.

## Core Principle

**The Curse of Knowledge is the single greatest barrier to effective communication.** Once we know something, we can't imagine not knowing it—which makes us bad at explaining our ideas to others. Sticky ideas aren't born, they're made: the SUCCESs framework provides six principles that make any idea more memorable and impactful.

## Scoring

**Goal: 10/10.** Rate any messaging (copy, presentations, campaigns, onboarding) 0-10 against the SUCCESs principles: simple, surprising, concrete, credible, emotional, and wrapped in a story scores 10; forgettable communication scores low. Always state the current score and the specific improvements needed to reach 10/10.

## The SUCCESs Framework

**S**imple · **U**nexpected · **C**oncrete · **C**redible · **E**motional · **S**tories

**Not a checklist—a toolkit.** Not every sticky idea uses all six, but the stickiest ideas tend to use most of them. **Ethical boundary:** use SUCCESs to make true ideas stick—never to make false claims memorable.

### 1. Simple

**Core concept:** Find the core of the idea and share it compactly. Simple ≠ dumbed down—it means ruthless prioritization: "if you say three things, you say nothing."

**The Commander's Intent:** if everything else goes wrong, what ONE thing must we accomplish? For messaging: if people remember ONE thing about your product, what should it be? **The inverted pyramid:** lead with the most important thing; readers who stop anywhere still got the core.

**Techniques for simplicity:**

| Technique | How It Works | Example |
|-----------|-------------|---------|
| **Core message** | Strip to the essential | Southwest: "THE low-fare airline" |
| **Analogy** | Explain new via known | "It's like Uber for dog walking" |
| **Generative** | Core idea that generates behavior | "Names, names, names" (local newspaper motto) |

**Application to product messaging:**

| Before (Complex) | After (Simple) |
|-------------------|----------------|
| "AI-powered, cloud-native customer engagement platform with omnichannel capabilities" | "Talk to all your customers in one place" |
| "We leverage machine learning algorithms to optimize conversion funnels" | "We find why visitors don't buy and fix it" |
| "Enterprise-grade project management with Gantt charts, resource allocation..." | "The simplest way to manage projects" |

**The test:** Can you explain it to a smart 12-year-old? **Warning:** don't simplify into emptiness—"we make the world better" is simple but meaningless.

See: [references/simple.md](references/simple.md) for simplification exercises and templates.

### 2. Unexpected

**Core concept:** Get attention by breaking patterns (surprise); hold attention by creating curiosity gaps (interest). The surprise must connect to the core message—identify the counterintuitive implication and communicate that.

**Example surprises:**

| Category | Expected | Unexpected (Sticky) |
|----------|----------|---------------------|
| **Product launch** | "Introducing our new feature" | "We removed your favorite feature. Here's why." |
| **Statistics** | "Obesity is growing" | "A bag of movie popcorn has more fat than a bacon-and-eggs breakfast, Big Mac and fries, and steak dinner — combined" |
| **Value prop** | "Save money on insurance" | "15 minutes could save you 15%" (specific, unexpected) |

**Creating curiosity gaps** — open a gap in knowledge, create the desire to fill it:

| Technique | How It Works | Example |
|-----------|-------------|---------|
| **Question** | Ask what they don't know | "What's the #1 reason startups fail?" |
| **Prediction** | Ask them to predict | "How many X do you think...?" |
| **Mystery** | Present a puzzle, delay the resolution | "Nordstrom once refunded a set of tires. They don't sell tires." |
| **Challenge** | Violate assumptions | "Everything you know about X is wrong" |

**Anti-pattern:** Gimmicky surprise without substance.

See: [references/unexpected.md](references/unexpected.md) for pattern-breaking techniques.

### 3. Concrete

**Core concept:** Use sensory language and specific details instead of abstract concepts. Abstraction kills memorability; the more concrete and specific the idea, the stickier it becomes.

**Abstract vs. Concrete:**

| Abstract | Concrete |
|----------|----------|
| "Improve customer experience" | "Customers get their order in 30 minutes, still hot" |
| "Increase engagement" | "Users open the app 8 times a day" |
| "Optimize efficiency" | "Reduce report generation from 4 hours to 10 minutes" |
| "World-class support" | "Call us and a human answers in under 60 seconds" |
| "Scalable solution" | "Handle 10,000 users on day one without code changes" |

**The Velcro theory of memory:** concrete ideas have more "hooks"—"bicycle" is easier to remember than "vehicle" because you can picture it.

**Techniques for concreteness:**

| Technique | How It Works | Example |
|-----------|-------------|---------|
| **Specific numbers** | Replace "a lot" with exact figures | "2,347 customers" not "thousands" |
| **Sensory language** | Engage senses | "Crispy, not crunchy" |
| **Concrete example** | Replace category with instance | "Like John, a 35-year-old teacher in Denver" |
| **Before/after** | Tangible transformation | "Before: 4 hours. After: 10 minutes." |

**Application:** features → outcomes; percentages → real numbers ("saves 40%" → "saves 16 hours/month"); categories → specific examples ("restaurants" → "pizza shops in Brooklyn"); demos > feature lists.

See: [references/concrete.md](references/concrete.md) for concreteness exercises.

### 4. Credible

**Core concept:** Help people believe your idea using external credibility (authorities, credentials) and internal credibility (vivid details, human-scale statistics, testable claims)—internal is more powerful.

**External credibility:**

| Source | How It Works | Example |
|--------|-------------|---------|
| **Authorities** | Expert endorsement | "Recommended by Harvard Business Review" |
| **Anti-authorities** | Real people with experience | "Here's what a customer with the same problem found" |
| **Credentials** | Verifiable achievements | "10 years experience, SOC 2 certified" |

**Internal credibility:**

| Technique | How It Works | Example |
|-----------|-------------|---------|
| **Vivid details** | Specificity implies truth | "On Tuesday at 3pm, in the conference room on the 4th floor..." |
| **Human-scale statistics** | Relate numbers to experience | Not "10TB of data" but "every book ever written, 100 times" |
| **The Sinatra Test** | One example so good it proves everything | "If I can make it there, I can make it anywhere" |
| **Testable credential** | Let them verify | "Try it free for 14 days" |

**The Sinatra Test:** one reference so impressive it handles all objections—"We secured the White House" (security), "We handle Super Bowl traffic" (scalability), "Used by Apple, Google, and Microsoft" (quality).

**Making statistics stick:** put them in a context people understand—not "37 grams of saturated fat" but "more saturated fat than a Big Mac, fries, and milkshake combined."

See: [references/credible.md](references/credible.md) for credibility-building techniques.

### 5. Emotional

**Core concept:** Make people feel something—people act on emotion, not analysis. Statistics numb; stories about individuals inspire action. Mother Teresa principle: "If I look at the mass, I will never act. If I look at the one, I will."

**Emotional appeals:**

| Approach | How It Works | Example |
|----------|-------------|---------|
| **Individual focus** | One person's story > statistics | "Meet Sarah, who..." > "10,000 people affected" |
| **Self-interest** | "What's in it for me?" | WIIFM: features → personal benefits |
| **Identity** | "What would someone like me do?" | "Texans don't litter" (Don't Mess with Texas) |
| **Maslow's hierarchy** | Appeal to the right level | Security, belonging, esteem, self-actualization |

**The identity approach:** people decide based on identity, not calculation—frame your product as consistent with who they want to be:

| Identity Frame | Product | Message |
|---------------|---------|---------|
| "I'm an innovative leader" | SaaS tool | "For teams that move fast" |
| "I care about my health" | Food product | "Made with ingredients you can pronounce" |
| "I'm a serious professional" | B2B service | "The tool Fortune 500 CTOs rely on" |

**Avoid the "semantic stretch":** don't over-abstract the emotion—"Support the troops" beats "Support our national defense infrastructure."

See: [references/emotional.md](references/emotional.md) for emotional appeal frameworks.

### 6. Stories

**Core concept:** Stories are flight simulators for the brain: they simulate experience, inspire action, stay memorable through narrative structure, and bypass resistance (people don't argue with stories).

**Three story plots that work:**

| Plot | Structure | When to Use | Example |
|------|-----------|-------------|---------|
| **Challenge** | Protagonist overcomes obstacle | Inspire courage, perseverance | "We started in a garage..." |
| **Connection** | People bridging a gap | Inspire tolerance, teamwork | "A customer helped another customer..." |
| **Creativity** | Novel solution to problem | Inspire innovation, thinking | "We tried X, Y, Z... then discovered..." |

**Story structure for product messaging:** character (relatable customer) → problem (emotional) → journey (what they tried, concrete) → solution (how your product helped, specific) → outcome (measurable + emotional).

**Example:**
> "Sarah ran a 10-person design agency. Her team spent 4 hours every Friday compiling client reports from 5 different tools. She'd tried hiring an intern, building spreadsheets, even a custom tool. Nothing worked. Then she found [Product]. Now reports generate in 10 minutes. Last Friday, her team left at 3pm for the first time in years."

**Spotting stories in the wild:** support tickets (problems + resolutions), sales calls (objections + breakthroughs), user interviews (before/after moments), internal Slack (team wins).

See: [references/stories.md](references/stories.md) for story templates and collection methods.

## The Curse of Knowledge

**How it manifests:** jargon your audience doesn't know; skipping context that seems "obvious"; assuming your audience sees what you see; over-abstracting because you know the specifics.

**Solutions:** test messaging with outsiders (not your team); use concrete language, not abstractions; tell stories, not bullet points; ask "would my mom understand this?"

See: [references/curse-of-knowledge.md](references/curse-of-knowledge.md) for diagnosis and remedies.

## Sticky Messaging Audit

Rate your message on each principle:

| Principle | Question | Score (1-10) |
|-----------|----------|-------------|
| **Simple** | Is there ONE clear core message? | |
| **Unexpected** | Does it break a pattern or create curiosity? | |
| **Concrete** | Can you picture it? Are there specific details? | |
| **Credible** | Why should someone believe this? | |
| **Emotional** | Does it make you feel something? | |
| **Stories** | Is there a narrative or character? | |

**Scoring:** 50-60 extremely sticky (rare, aim for this) · 35-49 strong (most good messaging) · 20-34 average (forgettable, needs work) · below 20 won't stick (fundamental rework).

## Applying SUCCESs to Product

### Landing Pages
- **Simple:** one clear value proposition above the fold
- **Unexpected:** counterintuitive claim or statistic
- **Concrete:** specific outcome ("save 4 hours/week" not "save time")
- **Credible:** customer logos, specific testimonials
- **Emotional + Stories:** customer pain point and transformation narrative

### Product Demos
- **Simple:** show ONE core workflow, not every feature
- **Unexpected:** start with the "aha moment", not a tour
- **Concrete:** use real data, not "Lorem ipsum"
- **Credible:** show how [specific company] uses it
- **Emotional + Stories:** "Let me show you what happens when [customer] has this problem..."

### Onboarding
- **Simple:** one action per screen
- **Unexpected:** delight with a quick win early
- **Concrete:** show real results, not abstract promises
- **Credible:** "Join 5,000 teams already using..."
- **Emotional + Stories:** celebrate first success; "here's how [user] got started..."

See: [references/applications.md](references/applications.md) for presentations and more application patterns.

## Common Mistakes

| Mistake | Why It Fails | Fix |
|---------|-------------|------|
| **Burying the lead** | Core message lost in details | Commander's Intent: what's the ONE thing? |
| **Too abstract** | Nothing to remember | Replace every abstraction with a concrete example |
| **Feature listing** | No emotional connection | Tell customer stories, show transformations |
| **Jargon** | Curse of Knowledge | Test with outsiders |
| **Statistics without context** | Numbers don't stick | Make stats human-scale and relatable |

## Quick Diagnostic

Audit any message:

| Question | If No | Action |
|----------|-------|--------|
| Can I state the core in one sentence? | Too complex | Find Commander's Intent |
| Would this surprise someone? | Predictable = forgettable | Find the counterintuitive angle |
| Can I picture it happening? | Too abstract | Add specific, sensory details |
| Why should someone believe this? | No credibility | Add proof, examples, Sinatra Test |
| Does it make me feel something? | Purely logical | Focus on one person, not statistics |
| Is there a story? | List of facts | Wrap in character + problem + resolution |

## Reference Files

- [simple.md](references/simple.md): Commander's Intent, core finding, simplification
- [unexpected.md](references/unexpected.md): Surprise techniques, curiosity gaps
- [concrete.md](references/concrete.md): Sensory language, specificity, demonstrations
- [credible.md](references/credible.md): Authority types, Sinatra Test, human-scale statistics
- [emotional.md](references/emotional.md): Individual focus, identity appeals, Maslow
- [stories.md](references/stories.md): Three plots, story structure, collection methods
- [curse-of-knowledge.md](references/curse-of-knowledge.md): Diagnosis and remedies
- [applications.md](references/applications.md): Landing pages, demos, onboarding, presentations
- [case-studies.md](references/case-studies.md): JFK moonshot, Subway diet, Don't Mess with Texas

## Further Reading

For the complete framework and research:

- [*"Made to Stick"*](https://www.amazon.com/Made-Stick-Ideas-Survive-Others/dp/1400064287?tag=wondelai00-20) by Chip Heath & Dan Heath
- [*"Switch"*](https://www.amazon.com/Switch-Change-Things-When-Hard/dp/0385528752?tag=wondelai00-20) by Chip Heath & Dan Heath (companion: how to make change stick)

## About the Authors

**Chip Heath** is a professor at Stanford Graduate School of Business, and **Dan Heath** is a senior fellow at Duke University's CASE center. Together they have written four New York Times bestsellers; *Made to Stick* spent over two years on the list, and its SUCCESs framework is used by educators, marketers, nonprofits, and product teams worldwide.


## Sub-skill: brand-voice

# Brand Voice

Build a durable voice profile from real source material, then use that profile everywhere instead of re-deriving style from scratch or defaulting to generic AI copy.

## When to Activate

- the user wants content or outreach in a specific voice
- writing for X, LinkedIn, email, launch posts, threads, or product updates
- adapting a known author's tone across channels
- the existing content lane needs a reusable style system instead of one-off mimicry

## Source Priority

Use the strongest real source set available, in this order:

1. recent original X posts and threads
2. articles, essays, memos, launch notes, or newsletters
3. real outbound emails or DMs that worked
4. product docs, changelogs, README framing, and site copy

Do not use generic platform exemplars as source material.

## Collection Workflow

1. Gather 5 to 20 representative samples when available.
2. Prefer recent material over old material unless the user says the older writing is more canonical.
3. Separate "public launch voice" from "private working voice" if the source set clearly splits.
4. If live X access is available, use `x-api` to pull recent original posts before drafting.
5. If site copy matters, include the current ECC landing page and repo/plugin framing.

## What to Extract

- rhythm and sentence length
- compression vs explanation
- capitalization norms
- parenthetical use
- question frequency and purpose
- how sharply claims are made
- how often numbers, mechanisms, or receipts show up
- how transitions work
- what the author never does

## Output Contract

Produce a reusable `VOICE PROFILE` block that downstream skills can consume directly. Use the schema in [references/voice-profile-schema.md](references/voice-profile-schema.md).

Keep the profile structured and short enough to reuse in session context. The point is not literary criticism. The point is operational reuse.

## Affaan / ECC Defaults

If the user wants Affaan / ECC voice and live sources are thin, start here unless newer source material overrides it:

- direct, compressed, concrete
- specifics, mechanisms, receipts, and numbers beat adjectives
- parentheticals are for qualification, narrowing, or over-clarification
- capitalization is conventional unless there is a real reason to break it
- questions are rare and should not be used as bait
- tone can be sharp, blunt, skeptical, or dry
- transitions should feel earned, not smoothed over

## Hard Bans

Delete and rewrite any of these:

- fake curiosity hooks
- "not X, just Y"
- "no fluff"
- forced lowercase
- LinkedIn thought-leader cadence
- bait questions
- "Excited to share"
- generic founder-journey filler
- corny parentheticals

## Persistence Rules

- Reuse the latest confirmed `VOICE PROFILE` across related tasks in the same session.
- If the user asks for a durable artifact, save the profile in the requested workspace location or memory surface.
- Do not create repo-tracked files that store personal voice fingerprints unless the user explicitly asks for that.

## Downstream Use

Use this skill before or inside:

- `content-engine`
- `crosspost`
- `lead-intelligence`
- article or launch writing
- cold or warm outbound across X, LinkedIn, and email

If another skill already has a partial voice capture section, this skill is the canonical source of truth.
