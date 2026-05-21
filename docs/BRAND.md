# FlowBitz Brand Guidelines

**Version:** 2.0  
**Status:** Internal — product, design, content, marketing, and business decisions  
**Brand:** FlowBitz  
**Maintained by:** SlabPixel Studio  
**Last updated:** May 2026

---

## How to use this document

This is the single source of truth for **what FlowBitz is**, **who it is for**, and **how it should look, sound, and behave** in the market.

| If you are… | Start here |
|-------------|------------|
| Writing copy (site, docs, email, social) | [Messaging architecture](#6-messaging-architecture), [Tone of voice](#5-brand-personality--voice) |
| Designing UI (marketing site, product, demos) | [Design direction](#7-design-direction) |
| Prioritizing features or packs | [Product philosophy](#8-product-philosophy), [Decision framework](#14-decision-framework) |
| Planning content or SEO | [Content strategy](#10-content-strategy), [Competitive framing](#4-brand-positioning) |
| Deciding SlabPixel mentions | [Relationship with SlabPixel](#12-relationship-with-slabpixel) |

When guidance conflicts with a one-off request, **default to this document** and escalate only if the exception clearly passes the [decision framework](#14-decision-framework).

---

## Table of contents

1. [Strategic foundation](#1-strategic-foundation)  
2. [Mission, vision, and roadmap](#2-mission-vision-and-roadmap)  
3. [Audience](#3-audience)  
4. [Brand positioning](#4-brand-positioning)  
5. [Brand personality & voice](#5-brand-personality--voice)  
6. [Messaging architecture](#6-messaging-architecture)  
7. [Design direction](#7-design-direction)  
8. [Product philosophy](#8-product-philosophy)  
9. [Business model](#9-business-model)  
10. [Content strategy](#10-content-strategy)  
11. [Showcase & discovery](#11-showcase--discovery)  
12. [Relationship with SlabPixel](#12-relationship-with-slabpixel)  
13. [Brand do's and don'ts](#13-brand-dos-and-donts)  
14. [Decision framework](#14-decision-framework)  
15. [North star & success metrics](#15-north-star--success-metrics)  
16. [Appendix](#16-appendix)

---

## 1. Strategic foundation

### 1.1 What FlowBitz is

**FlowBitz is a Premium UI Motion System for Webflow.**

It helps serious Webflow creators ship visually premium, interactive sites faster—without rebuilding the same motion patterns from scratch or maintaining fragile custom animation code on every project.

**What it is today (product reality):**

- A growing library of production-ready motion components (text, buttons, scroll, and effects)
- Attribute-driven implementation (`wb-*`) inside Webflow
- GSAP-powered where it matters, with CSS-only options where performance and bundle size win
- Free core layer + planned premium packs (see [Business model](#9-business-model))

**What it is strategically (category claim):**

FlowBitz is **not** positioning as:

| Mislabel | Why we avoid it |
|----------|-----------------|
| Generic plugin | Implies a narrow tool, not a system |
| Component dump | Commoditized, quantity-led |
| Animation marketplace | Cloneable fatigue; no craft narrative |
| Webflow utility suite | Competes with Finsweet-style breadth; dilutes motion focus |

FlowBitz **is** a **motion layer**—reusable interaction language, principles, and building blocks that make premium sites feel consistent and repeatable.

### 1.2 Category definition

We define and own this category:

> **Premium UI Motion System for Webflow**

**System** means:

- Shared motion vocabulary (timing, easing, reveal patterns, hover language)
- Repeatable implementation (attributes, docs, demos—not one-off custom code per site)
- Outcome alignment (premium feel), not feature checklists

**Premium** means:

- Crafted defaults, not gimmicky effects
- Restraint and polish over noise
- Experiences that hold up on client and agency work

Libraries feel **replaceable**. Systems feel **foundational**. FlowBitz should feel like infrastructure serious teams adopt—not a bookmark they forget.

### 1.3 Core promise

**External (primary):**

> Premium motion for serious Webflow creators—without the custom animation grind.

**Supporting variants (use where channel fits):**

- Build premium Webflow experiences faster.
- Motion systems for creators who care about details.
- Sophisticated interactions without reinventing GSAP every project.

**Internal rule:**

Every decision must strengthen the promise. If it does not make sites feel more **premium**, motion feel **smoother**, or building in Webflow **easier for pros**, it is out of scope.

### 1.4 Strategic tensions to manage

| Tension | Guidance |
|---------|----------|
| Free adoption vs. premium brand | Free drives habit; messaging and UX still feel premium. Never sound “cheap” or desperate. |
| “No code” vs. “serious creators” | Ease is a **mechanism**, not the **identity**. Lead with outcomes and craft; implementation simplicity is proof, not the headline. |
| Breadth vs. depth | Own motion. Do not chase every Webflow utility category. |
| Inspiration vs. product | Showcase and gallery build authority; every visit should still reinforce FlowBitz as the system behind the work. |

*Note:* Public copy on flowbitz.dev may still emphasize free access and ease of setup while the brand migrates toward premium-system language. New work should align with this document; legacy copy should be revised in planned passes (homepage, About, SEO titles).

---

## 2. Mission, vision, and roadmap

### 2.1 Mission

**Make premium-quality web motion accessible to serious Webflow creators.**

Accessible here means **reachable in workflow** (fast to implement, documented, reliable)—not “dumbed down for beginners.”

### 2.2 Vision

**Become the default motion ecosystem for modern Webflow websites.**

Success looks like: freelancers and agencies reach for FlowBitz by default when a project needs to feel premium, the way teams reach for a type stack or a grid system.

### 2.3 Four-phase evolution

FlowBitz matures in deliberate phases. Marketing and product should reflect the **current phase** without overselling future phases.

#### Phase 1 — Component library *(current)*

| | |
|--|--|
| **Goal** | Remove repetitive motion implementation |
| **Offer** | Interaction components, reusable effects, attribute-based setup |
| **Success signal** | Components used on live client sites; return usage across projects |

#### Phase 2 — Motion system

| | |
|--|--|
| **Goal** | Become infrastructure, not a bag of tricks |
| **Offer** | Documented motion principles, standardized interaction language, composable patterns |
| **Success signal** | Agencies describe “our motion stack” including FlowBitz |

#### Phase 3 — Showcase library

| | |
|--|--|
| **Goal** | Inspiration authority in the Webflow motion space |
| **Offer** | Premium examples, live demos, curated references |
| **Success signal** | Creators visit regularly for inspiration, not only when stuck |

#### Phase 4 — Ecosystem

| | |
|--|--|
| **Goal** | Industry authority and durable revenue |
| **Offer** | Premium packs, templates, education, creator ecosystem, agency programs |
| **Success signal** | FlowBitz is a trust engine for SlabPixel (see [§12](#12-relationship-with-slabpixel)) without feeling like an agency brochure |

---

## 3. Audience

### 3.1 Primary segments

#### Segment A — Webflow freelancers

**Profile**

- Deliver client sites on deadlines
- Differentiate on visual quality and interaction polish
- Often hit a wall with custom GSAP, ScrollTrigger, or interaction edge cases
- Care about client perception (“wow”) and portfolio strength

**Jobs to be done**

- Ship premium motion without days of custom dev per section
- Reuse patterns across projects
- Look as capable as larger agencies on motion

**Core pain (voice of customer)**

> “I want my sites to feel premium without burning hours on interactions.”

**What they buy (functional + emotional)**

| Functional | Emotional |
|------------|-----------|
| Speed to implement | Confidence presenting to clients |
| Polished defaults | Pride in portfolio |
| Reliable behavior | Less anxiety about broken animations |

#### Segment B — Webflow agencies

**Profile**

- Multiple concurrent builds
- Need consistency across designers and developers
- Care about scalability, handoff, and margin on motion work

**Jobs to be done**

- Standardize premium interactions across the team
- Reduce reinvention every kickoff
- Maintain quality bar without a dedicated motion dev on every project

**Core pain**

> “We need premium interactions without reinventing motion on every project.”

**What they buy**

| Functional | Emotional |
|------------|-----------|
| Repeatable systems | Predictable delivery |
| Team-wide patterns | Brand trust with enterprise-ish clients |
| Efficiency | Protect margin |

### 3.2 Secondary audiences (serve, do not optimize for)

| Audience | Role | How we treat them |
|----------|------|-------------------|
| In-house Webflow marketers | May adopt for landing pages | Same premium bar; shorter docs paths OK |
| Webflow educators / creators | Amplify reach | Provide clear demos; don’t dilute brand to “courseware” |
| Developers pairing with designers | Implement or extend | Technical clarity in docs; brand stays visual-first |

### 3.3 Who we are not optimizing for

**Casual beginners and “no skill” positioning**

- Drive support load and price pressure
- Pull messaging toward generic “easy tool” SaaS
- Conflict with premium category claim

| Avoid saying | Prefer saying |
|--------------|---------------|
| Easy for everyone | Built for serious Webflow creators |
| No skill needed | No custom animation workflow required |
| For beginners | For freelancers and agencies who care about craft |

Beginners may still **use** FlowBitz; we do not **design the brand** around them.

---

## 4. Brand positioning

### 4.1 Positioning statement

**For** serious Webflow freelancers and agencies **who** want their websites to feel premium,

**FlowBitz is** a premium UI motion system **that** helps them implement sophisticated interactions faster,

**without** building everything from scratch or maintaining fragile one-off animation code.

**Unlike** generic animation libraries and cloneable marketplaces,

**FlowBitz** focuses on premium motion experiences designed for modern Webflow workflows—consistent, repeatable, and craft-led.

### 4.2 Competitive framing (internal)

Use this framing in strategy and sales narratives—not as public attack copy.

| Alternative | Their strength | FlowBitz angle |
|-------------|----------------|----------------|
| DIY GSAP | Unlimited control | Speed + consistency + Webflow-native attributes |
| Webflow interactions only | Native, simple | Deeper premium patterns without leaving Designer |
| Generic libraries (CDN snippets, etc.) | Volume | Curated premium defaults, Webflow-first docs |
| Cloneables / marketplaces | Inspiration | System + implementation, not just a .webflow file |
| Utility suites (e.g. Finsweet) | Breadth | **We own motion**; don’t become a clone |

### 4.3 Brand keywords

**Evoke**

| Keyword | Meaning in practice |
|---------|---------------------|
| Premium | Restraint, polish, intentional motion |
| Creative | Unexpected but purposeful interactions |
| Experimental | Willing to push visual ideas; still shippable |
| Sophisticated | Mature timing and hierarchy, not flashy noise |
| Modern | Current web aesthetic (scroll, type, hover systems) |
| Crafted | Details matter—defaults feel designed |
| Inspiring | Demos and showcase raise ambition |
| Polished | Fewer rough edges than “hacky” snippets |
| Visual-first | Show motion; minimize wall-of-text explanations |

**Avoid evoking**

Corporate, boring, overly technical (jargon-first), enterprise-heavy, generic SaaS, cheap, template-like, hype-driven startup.

### 4.4 Proof points (what we can claim when true)

Anchor claims in demonstrable product facts—update as the library grows:

- Production-ready components with live demos on flowbitz.dev
- Attribute-based setup inside Webflow Designer
- GSAP where needed; CSS-only paths for lean bundles
- Performance-conscious builds (document bundle impact honestly)
- Crafted by a studio that ships premium Webflow work (SlabPixel)

Do not claim “industry standard” or “best” without substantiation.

---

## 5. Brand personality & voice

### 5.1 Archetype: The Creative Technologist

| Pole | Expression |
|------|------------|
| Creative | Inspires; references Awwwards-level craft |
| Technical | Trustworthy; motion behaves reliably in production |

**Energy reference:** Awwwards × premium digital craftsmanship.

**Should feel like:** “Made by creators who obsess over details.”  
**Should not feel like:** “A boring utility software company.”

### 5.2 Voice principles

1. **Premium but approachable** — Confident, never condescending.  
2. **Confident, not arrogant** — Show work; don’t belittle other tools.  
3. **Inspiring, not exaggerated** — No fake superlatives.  
4. **Creative but clear** — Evocative headlines; precise instructions in docs.  
5. **Minimal words, strong meaning** — Cut filler; one idea per sentence where possible.

### 5.3 Tone by channel

| Channel | Tone | Example direction |
|---------|------|-------------------|
| Homepage / hero | Outcome-led, cinematic | “Premium motion for Webflow—ready in minutes.” |
| Component docs | Clear, instructive | Step-by-step attributes; expected behavior |
| Release notes | Factual, proud | What changed, why it matters for sites |
| Support / email | Helpful, respectful | Assume they’re a pro stuck on a detail |
| Social | Visual-first, short | Demo clip + one-line outcome |
| Sales / packs (future) | Outcome-led | “Agency Essentials”—not “50 effects bundle” |

### 5.4 Writing style

**Prefer**

- “Craft premium interactions.”
- “Designed for creators who care about details.”
- “Smooth motion, better experiences.”
- “Ship sophisticated scroll and type motion without custom GSAP every time.”

**Avoid**

- Marketing hype, fake urgency, countdown gimmicks  
- Cringe startup voice (“rockstar”, “crushing it”, “10x”)  
- Excessive exclamation marks  
- Buzzword stacks and empty AI claims  

**Banned or discouraged phrases**

Revolutionary, game-changing, next-generation, disruptive, world-class (unless quoting a third party), “AI-powered” without a real feature.

### 5.5 Grammar and formatting

- **Sentence case** for headings in product UI unless a proper noun.
- **FlowBitz** — one word, capital F and B; never “Flow Bitz” or “FLOWBITZ” in prose.
- **Webflow** — always capitalized per their brand.
- Prefer **en dash** for ranges in formal docs; keep marketing copy light.
- Numbers: spell out one–nine in marketing prose; use numerals for stats and specs.

---

## 6. Messaging architecture

### 6.1 Value proposition ladder

Always communicate top-down:

```
Level 1 — OUTCOME     → Premium websites that feel intentional and modern
Level 2 — MECHANISM   → Reusable motion system (components + principles + docs)
Level 3 — FEATURES    → split-text, reveal, magnetic, scroll, gradients, etc.
```

**Rule:** Never lead with features in hero or campaign copy. Features belong in library pages, comparison tables, and SEO long-tail—not the brand headline.

### 6.2 Main value proposition

**FlowBitz helps serious Webflow creators build premium-feeling websites faster.**

### 6.3 Emotional outcome

| Target feeling | Anti-pattern |
|----------------|--------------|
| “My website looks way more premium.” | “Cool, another animation library.” |
| “I can ship this on my client deadline.” | “I need to debug this for hours.” |
| “This matches how top studios work.” | “This feels like a cheap template pack.” |

### 6.4 Message house

| Layer | Message |
|-------|---------|
| **Brand** | Premium UI Motion System for Webflow |
| **Promise** | Premium motion without the custom animation grind |
| **Proof** | Live demos, attribute setup, studio craft, growing component system |
| **CTA (free phase)** | Install, explore library, use on next project |
| **CTA (paid phase)** | Choose the pack that matches the site outcome |

### 6.5 Example copy blocks

**Hero (aspirational)**

> Premium motion for Webflow.  
> Craft interactions that feel studio-made—without rebuilding GSAP every project.

**Subhead**

> A growing motion system of text, hover, and scroll components. Drop in the script, set attributes, ship.

**Agency-oriented**

> One motion language across your team. Repeatable premium interactions for every client build.

**Freelancer-oriented**

> Client-ready polish in hours, not days. Stand out without living in custom animation code.

**Feature page intro (OK to be more specific)**

> Split Text breaks headlines into choreographed character motion—tuned for Webflow, powered by GSAP, controlled with `wb-*` attributes.

### 6.6 SEO and discoverability (brand-aligned)

SEO may use feature keywords for **capture**; page titles and meta descriptions should still tie to **outcomes** where possible.

| Page type | Title pattern (direction) |
|-----------|---------------------------|
| Home | FlowBitz — Premium UI Motion System for Webflow |
| Library | Motion Components for Webflow — FlowBitz |
| Component | {Name} — Premium Webflow Motion — FlowBitz |

Coordinate with [SEO.md](./SEO.md) when updating meta templates.

---

## 7. Design direction

### 7.1 Visual philosophy: Premium creative minimalism

**Feel:** cinematic, motion-led, immersive, experimental, modern.  
**References:** Awwwards-quality portfolios, luxury digital brands, premium startups, creative agencies.  
**Constraint:** Usability and clarity—premium is not visual chaos.

Motion on the marketing site and demos **is the product sample**. If the site feels static or cluttered, the brand contradicts the promise.

### 7.2 Design rules

| # | Rule | Application |
|---|------|-------------|
| 1 | **Motion is the hero** | Demos, hover states, and scroll tell the story before copy |
| 2 | **Less but better** | Generous whitespace; few type sizes; intentional color |
| 3 | **Showcase before explanation** | Impress in the first viewport; details below the fold |
| 4 | **Everything feels crafted** | No generic SaaS illustrations; no stock “team high-five” imagery |
| 5 | **Performance is part of premium** | Smooth > flashy; respect reduced motion |

### 7.3 Homepage principle

Within **5 seconds**, a visitor should think:

> “This feels premium.”

Not: “This is another component directory.”

### 7.4 UI patterns (marketing + product shell)

- Dark, cinematic shells are on-brand when contrast and readability stay strong.
- Accent color used **sparingly** for focus (e.g. links, active states, key CTAs)—not rainbow UI.
- Typography: clean grotesk or neo-grotesk for UI; display treatments reserved for hero and showcase.
- Borders, grids, and subtle rules can signal “tool for pros” without clutter.
- Component gallery: prioritize **motion preview** over static screenshots.

### 7.5 Motion in brand touchpoints

- Prefer **ease curves** that feel natural (no bouncy circus unless the component demands it).
- Respect `prefers-reduced-motion` in marketing and docs.
- Dogfood FlowBitz components on flowbitz.dev wherever possible.

### 7.6 Asset and photography

- Real UI captures and recordings > abstract 3D blobs.
- If people appear, show **creators at work** or **finished sites**—not generic stock teams.
- OG/social images: one strong visual + short outcome line.

---

## 8. Product philosophy

### 8.1 Product north star

**Help creators build premium-feeling websites faster.**

### 8.2 Feature gates (all three must pass for net-new work)

| Test | Question |
|------|----------|
| **Premium** | Does this make end sites feel more premium? |
| **Shortcut** | Does this reduce complexity vs. DIY GSAP/custom code? |
| **Repeatability** | Would an agency use this on multiple projects? |

If any answer is **no**, reject or redesign unless it is a clear maintenance/security requirement.

### 8.3 Priority stack

**High**

- Premium hover systems  
- Text motion (split, reveal, scramble, pressure, etc.)  
- Scroll storytelling and reveal engines  
- Premium buttons and CTAs  
- Section transitions  
- Visual polish effects (trails, gradients, outlines)  

**Medium**

- Configuration helpers, global settings, debugging utilities  

**Low / avoid**

- Generic Webflow utilities already solved elsewhere  
- Feature chasing that turns FlowBitz into a “Finsweet clone”  

**Own motion. Partner or link for everything else.**

### 8.4 Quality bar for components

- Defaults should look good **without** ten attributes tuned.
- Docs: what it does, when to use it, when **not** to use it, performance notes.
- Mobile and reduced-motion behavior documented honestly.
- Naming: clear, professional (`split-text`, not `coolTextFX`).

### 8.5 Naming and API (`wb-*`)

- Attributes are part of the brand experience—consistent prefixes, predictable patterns.
- Breaking changes require migration notes and respect for sites in production.

---

## 9. Business model

### 9.1 Model overview

**Freemium + Premium Packs**

| Layer | Purpose | Brand expression |
|-------|---------|------------------|
| **Free** | Adoption, habit, word of mouth | Generous but premium; never “crippleware” tone |
| **Premium packs** | Revenue, depth, outcomes | Sold as **results**, not effect counts |

### 9.2 Free layer

**Include (directionally)**

- Core motion components sufficient to deliver real client value  
- Limited taste of advanced / pack-grade effects where it helps conversion  
- Brand exposure on free tier acceptable; keep attribution tasteful  

**Goal:** Creators install once and reach for FlowBitz on the **next** project without thinking.

### 9.3 Premium packs (planned)

Sell **outcomes**, not **effect lists**.

| Pack | For | Outcome promise |
|------|-----|-----------------|
| SaaS Motion | Startup landing pages | Crisp, credible product marketing motion |
| Luxury Motion | Premium brands | Restrained, high-end interaction language |
| Portfolio Motion | Creatives | Expressive, memorable personal brands |
| Agency Essentials | Repeat client work | Reliable, reusable client-ready patterns |
| Scroll Storytelling | Immersive pages | Narrative scroll without bespoke dev sprints |
| Conversion Motion | Marketing sites | Motion that supports CTAs without distraction |

**Pack naming on site:** lead with who it’s for and what the site **feels like** after install.

### 9.4 Pricing narrative

- Premium price is justified by **time saved** and **client perception**, not number of components.
- Avoid race-to-bottom comparisons with free snippet sites.
- Agencies: consider team/license story in Phase 4.

---

## 10. Content strategy

### 10.1 Goals

1. **Inspire** — raise the bar for what Webflow sites can feel like  
2. **Educate** — teach premium motion judgment, not only button clicks  
3. **Demonstrate** — product as proof via demos and breakdowns  
4. **Reinforce identity** — serious creators, craftsmanship, details  

### 10.2 Content pillars

| Pillar | Topics | Formats |
|--------|--------|---------|
| **Inspiration** | Site breakdowns, motion references, trends | Short video, carousel, blog |
| **Education** | Timing, scroll logic, when not to animate | Guides, threads, newsletter |
| **Product demo** | Before/after, component spotlights | Embedded demos, GIFs, release posts |
| **Creator identity** | Craft, process, agency quality | Interviews, behind-the-scenes (subtle SlabPixel) |

### 10.3 Editorial calendar (rhythm)

| Cadence | Example |
|---------|---------|
| Weekly | One demo or micro-tip on social |
| Biweekly | Component or pattern spotlight |
| Monthly | Deeper article or showcase feature |
| Per release | Changelog + motion impact summary |

### 10.4 Distribution

- **Owned:** flowbitz.dev, email list, Discord  
- **Social:** X, LinkedIn, YouTube/Webflow community—visual-first posts  
- **Partners:** Webflow community, creator collabs (co-brand, don’t dilute)  

### 10.5 Content do's and don'ts

| Do | Don't |
|----|-------|
| Show real sites and components | List features without motion |
| Teach judgment (“when to use reveal”) | Hype every release as “insane!!!” |
| Credit creators and clients | Overpromise pack contents early |

---

## 11. Showcase & discovery

### 11.1 Strategic goal

Turn FlowBitz into a **discovery engine**—a place creators return for inspiration, not only documentation.

### 11.2 Structure

| Surface | Purpose |
|---------|---------|
| **Inspiration gallery** | Real sites built with FlowBitz (with permission) |
| **Motion showcase** | Interactive demos and composable scenes |
| **Curated references** | External premium web—editorial, not a link dump |

### 11.3 Curation standards

- Every entry must meet a **premium bar** (craft, performance, intention).  
- Reject generic templates even if they use FlowBitz.  
- Prefer diversity of industry with consistent quality.  

### 11.4 Success signal

> “I’m browsing FlowBitz for ideas again this week.”

---

## 12. Relationship with SlabPixel

### 12.1 Brand independence

FlowBitz must feel like a **standalone premium product**, not an agency side project.

### 12.2 Strategic link

FlowBitz builds **authority** that can transfer trust to SlabPixel for high-touch work—without hard-selling in product UI.

| Do | Don't |
|----|-------|
| “Crafted by SlabPixel” / “Built by the team behind SlabPixel” | “Hire us now” banners in component docs |
| About page studio story | Aggressive cross-sell in free library |
| Shared quality bar | FlowBitz looking like SlabPixel’s portfolio only |

**Goal:** Trust transfer, not lead forcing.

### 12.3 Placement guidelines

- Footer, About, credits in OSS README: appropriate  
- Installation success, error states, pack checkout: minimal or none  
- Case studies: SlabPixel as implementer when relevant; FlowBitz as the system used  

---

## 13. Brand do's and don'ts

### Do

- Feel premium, experimental, and inspiring  
- Show motion visually everywhere possible  
- Prioritize quality and curation over catalog size  
- Write for serious freelancers and agencies  
- Dogfood components on the marketing site  
- Document honestly (performance, limits, accessibility)  

### Don't

- Slide into generic SaaS or template-market tone  
- Overexplain before showing  
- Chase every feature request  
- Compete on component count  
- Sound cheap, desperate, or beginner-only  
- Attack competitors by name in public copy  

---

## 14. Decision framework

Before building a feature, page, pack, or campaign, score honestly:

| # | Question |
|---|----------|
| 1 | Does this strengthen **premium website quality** for end users? |
| 2 | Does this help **serious creators** (freelancers/agencies)? |
| 3 | Would agencies **repeatedly** use this across projects? |
| 4 | Does this make FlowBitz **more memorable** as a brand? |
| 5 | Does this reinforce **Premium UI Motion System for Webflow**? |

**If two or more answers are no:** do not build—or rescope until they become yes.

**Escalation:** Founders/product lead for exceptions; document why in release notes or internal log.

---

## 15. North star & success metrics

### 15.1 Qualitative north star

**End users say:** “This website feels premium.”  
**Buyers say:** “We should use FlowBitz on this project.”

**Ultimate aspiration:** Default motion layer for serious Webflow creators.

### 15.2 Quantitative signals (directional)

| Signal | Why it matters |
|--------|----------------|
| Repeat installs / projects per user | Habit, not one-off trial |
| Showcase submissions and return visits | Discovery engine working |
| Agency mentions / case studies | Repeatability thesis |
| Premium pack conversion (when live) | Outcome pricing validated |
| Support tickets per active user | Premium audience sustainability |

### 15.3 Anti-metrics (do not optimize blindly)

- Raw signup count from beginner-heavy campaigns  
- Component count alone  
- Social vanity without demo depth  

---

## 16. Appendix

### 16.1 Glossary

| Term | Definition |
|------|------------|
| **Motion system** | Coherent set of components, patterns, and principles for site-wide interaction quality |
| **Premium** | Craft-led, intentional, client-ready—not maximum animation density |
| **Serious creators** | Freelancers and agencies who ship commercial Webflow sites |
| **`wb-*` attributes** | FlowBitz HTML attribute API for configuring components in Webflow |
| **Pack** | Outcome-themed premium bundle (future monetization) |

### 16.2 Related documents

- [SEO.md](./SEO.md) — technical SEO and meta patterns  
- [COMPONENT.md](./COMPONENT.md) — how components are built and documented  
- [DEVELOPMENT.md](./DEVELOPMENT.md) — release and build workflow  
- [../README.md](../README.md) — product overview and catalog  

### 16.3 Document changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | — | Initial playbook (condensed) |
| 2.0 | May 2026 | Restructured as full brand guidelines; expanded voice, messaging, product, and implementation guidance |

### 16.4 Review cadence

Revisit this document:

- After major positioning or pricing launches  
- Annually at minimum  
- When entering a new roadmap phase (see [§2.3](#23-four-phase-evolution))  

---

*FlowBitz brand guidelines — internal use. Questions: align with product/design lead before publishing customer-facing changes.*
