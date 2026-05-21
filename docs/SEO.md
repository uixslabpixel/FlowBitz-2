# SEO Guide for FlowBitz

Technical SEO implementation and **brand-aligned copy patterns** for titles, descriptions, and keywords. Strategy source: [BRAND.md](./BRAND.md) (messaging §6.6).

## Implemented SEO Features

### Meta tags and Open Graph
- Dynamic meta tags per route via `react-helmet-async` ([`src/app/components/SEO.jsx`](../src/app/components/SEO.jsx))
- Open Graph and Twitter Card tags on all pages
- Canonical URLs per page
- Static fallbacks in [`index.html`](../index.html) and [`public/manifest.json`](../public/manifest.json) — **keep in sync** with [`src/app/content/brandCopy.js`](../src/app/content/brandCopy.js)

### Structured data (JSON-LD)
- **WebSite** — Home (search action, offer)
- **CollectionPage** — Components library, Showcase
- **SoftwareApplication** — Component detail pages
- **AboutPage** — About
- **FAQPage** — FAQ (questions from page content)
- **SupportPage** — Support
- **HowTo** — Installation
- **BlogPosting** — Blog posts (dynamic)

### Technical SEO
- `public/sitemap.xml`, `public/robots.txt`, PWA manifest
- Preconnect / DNS prefetch in SEO component
- Semantic headings and internal linking

### Performance
- Lazy loading, code splitting, optimized assets (see Core Web Vitals targets below)

---

## Copy and SEO messaging rules

From BRAND.md:

1. **Lead with outcomes** in titles and descriptions (premium sites, client-ready motion).
2. **Mechanism second** (motion system, `wb-*` attributes, GSAP-powered).
3. **Features and “free”** — use in keywords and description clauses for capture, not as the primary title hook.
4. **Audience** — serious Webflow freelancers and agencies (avoid “for beginners,” “no skill,” “democratize”).

Centralized copy: [`src/app/content/brandCopy.js`](../src/app/content/brandCopy.js)

---

## Page title and description patterns

| Page | Title pattern | Description focus |
|------|---------------|-------------------|
| Home | `FlowBitz — Premium UI Motion System for Webflow` | Outcome + motion system + free core + serious creators |
| Components | `Motion Components for Webflow — FlowBitz ({n}+)` | Library breadth, wb-* attributes, premium motion |
| Component detail | `{Name} — Premium Webflow Motion — FlowBitz` | Component outcome line + wb-* + GSAP note |
| About | `About FlowBitz — Premium UI Motion System for Webflow` | Category claim + SlabPixel (subtle) |
| Installation | `Installation — FlowBitz \| Add Premium Motion to Webflow` | Setup for pros, one script |
| FAQ | `FAQ — FlowBitz \| Webflow Motion Help` | Install, attributes, troubleshooting |
| Showcase | `Showcase — FlowBitz \| Premium Webflow Sites` | Real projects, premium feel |
| Blog | `FlowBitz Blog \| Motion Craft, Tutorials & Release Notes` | Workflows for serious creators |
| Support / Contact / Release / License / 404 | See `seoPages` in `brandCopy.js` | Consistent premium tone |

When adding a new route, extend `seoPages` and `jsonLd` in `brandCopy.js`, then wire the page `<SEO />` component.

---

## Target keywords

### Primary (brand + capture)
- webflow motion, premium webflow animations, FlowBitz, webflow motion system
- GSAP for Webflow, webflow HTML attributes, wb attributes

### Secondary
- webflow text effects, webflow hover effects, webflow scroll animations
- free webflow components (supporting, not headline)

### Long-tail / component
- split text webflow, gradient text webflow, magnetic button webflow, etc. (per component page)

### Blog
- FlowBitz blog, webflow motion tutorials, FlowBitz release notes, gsap webflow tutorial

---

## Metrics to monitor

### Core Web Vitals
- LCP &lt; 2.5s
- INP / FID &lt; 100ms
- CLS &lt; 0.1

### Search Console
- CTR, average position, impressions, clicks

---

## Files reference

| File | Role |
|------|------|
| `src/app/content/brandCopy.js` | Titles, descriptions, keywords, JSON-LD helpers, UI snippets |
| `src/app/components/SEO.jsx` | Helmet wrapper; defaults from `brandCopy` |
| `index.html` | Pre-JS fallback meta |
| `public/manifest.json` | PWA name/description |
| `src/app/pages/*.jsx` | Per-route SEO + visible copy |
| `src/library/data/componentsMetadata.js` | Component descriptions (SEO + cards) |

---

## Checklist when shipping copy changes

1. Update `brandCopy.js` (and mirror `index.html` + `manifest.json` if home messaging changes).
2. Grep for deprecated phrases: `democratiz`, `No coding required`, `Zero Code`, `100% Free Forever`, `interactive components library` (as primary positioning).
3. Spot-check view-source on Home, `/components`, one component detail.
4. Regenerate or verify `sitemap.xml` if URLs change (not required for copy-only updates).

---

*Align all new marketing copy with [BRAND.md](./BRAND.md) before publishing.*
