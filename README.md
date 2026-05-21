# FlowBitz

[![Version](https://img.shields.io/badge/version-2.4.5-blue.svg)](https://github.com/Slabpixel/FlowBitz)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![CDN](https://img.shields.io/badge/CDN-flowbitz.dev-orange.svg)](https://www.flowbitz.dev)

> Production-ready motion components for Webflow. Drop in a script, add a few attributes, and ship premium animations in minutes.

---

## Table of Contents

- [Overview](#overview)
- [What's New in v2.4.5](#whats-new-in-v245)
- [Quick Start](#quick-start)
- [Component Catalog](#component-catalog)
- [Bundles & CDN](#bundles--cdn)
- [Local Development](#local-development)
- [Contributing](#contributing)
- [Support & Resources](#support--resources)

---

## Overview

- **30** plug-and-play components for text, buttons, effects, and canvas backgrounds
- Built for visual developers: configure everything with `wb-*` attributes inside Webflow
- GSAP under the hood with graceful CSS and canvas fallbacks where possible
- Dual build pipeline (UMD + ES modules) with smart lazy loading
- Detailed docs, metadata, and debugging utilities baked in

---

## What's New in v2.4.5

- **New backgrounds:** `firefly-background`, `dot-grid`, `star-field`, `particles-network`, `flow-field`
- **Canvas backgrounds:** Full-screen effects on `<div>` / `<section>` with content staying interactive above the layer
- **Docs & site:** SEO and brand copy updates, improved installation notes for background components
- **Earlier in v2.4:** `shimmer-button`, `hover-zoom`, `matrix-rain`, ImageTrail and ScrollTrigger improvements

---

## Quick Start

### CDN (UMD)

```html
<script src="https://cdn.jsdelivr.net/npm/flowbitz@latest/dist/flowbitz.umd.js"></script>

<h1 wb-component="split-text" wb-split-type="words">
  Create Amazing Websites with Powerful Animations
</h1>
```

### npm (ES modules)

```bash
npm install flowbitz
```

```javascript
import FlowBitz from 'flowbitz';

await FlowBitz.init({
  components: ['splitText', 'starField'],
  debug: false,
});
```

### Background example

```html
<section
  wb-component="star-field"
  wb-star-color="#e6e664"
  wb-interactive="true"
  class="h-screen w-full"
></section>
```

---

## Component Catalog

### Text

| Component            | GSAP | Highlights                                      |
| -------------------- | ---- | ----------------------------------------------- |
| `split-text`         | ✅   | Character/word/line splits with stagger control |
| `gradient-text`      | ✅   | Animated gradients + optional border            |
| `text-type`          | ✅   | Typewriter effect with cursor states            |
| `blur-text`          | ✅   | Blur-to-clear entrances                         |
| `shiny-text`         | ❌   | CSS shimmer sweep                               |
| `count-up`           | ✅   | Number animations with separators               |
| `decrypted-text`     | ✅   | Matrix-style decoding                           |
| `scramble-text`      | ✅   | Character scramble with hover retrigger         |
| `variable-proximity` | ✅   | Mouse-driven variable font control              |
| `rotating-text`      | ✅   | Rotating phrases with pause/resume API          |
| `text-pressure`      | ✅   | Variable font modulation (weight/width/italic)  |
| `shuffle`            | ✅   | Sliding character shuffle                       |
| `tooltip-text`       | ❌   | Hover tooltips (CSS only)                       |
| `roll-text`          | ✅   | Vertical rolling text reveal                    |

### Buttons

| Component         | GSAP | Highlights                                           |
| ----------------- | ---- | ---------------------------------------------------- |
| `gradient-button` | ❌   | Animated gradient background                         |
| `ripple-button`   | ❌   | Material-style click ripple                          |
| `pulse-button`    | ❌   | Attention pulse                                      |
| `shimmer-button`  | ❌   | Shimmer effect with customizable direction and color |
| `magnetic-button` | ✅   | Cursor-follow magnetism                              |

### Effects

| Component          | GSAP | Highlights                                  |
| ------------------ | ---- | ------------------------------------------- |
| `smart-animate`    | ✅   | Scroll-driven reveal engine                 |
| `3d-card-hover`    | ❌   | CSS perspective tilt                        |
| `outline-gradient` | ❌   | Animated gradient outlines                  |
| `image-trail`      | ✅   | Mouse-following image trails (8 variants)   |
| `hover-zoom`       | ❌   | Zoom effect with parallax movement on hover |

### Background

| Component             | GSAP | Highlights                                                    |
| --------------------- | ---- | ------------------------------------------------------------- |
| `matrix-rain`         | ❌   | Matrix or binary digital rain (Canvas 2D)                     |
| `firefly-background`  | ❌   | Floating firefly particles with glow and lifecycle (Canvas 2D) |
| `dot-grid`            | ❌   | Animated dot grid with scroll direction and spacing (CSS)     |
| `star-field`          | ❌   | Cursor-driven star burst with trails and click acceleration   |
| `particles-network`   | ❌   | Bouncing particles with mouse-proximity connection lines      |
| `flow-field`          | ❌   | Sinusoidal vector-field trails with palette presets (Canvas 2D) |

> Components marked ❌ do not use GSAP (CSS-only or Canvas 2D) for smaller bundles when those effects are used alone.

---

## Bundles & CDN

| Channel   | Use case              |
| --------- | --------------------- |
| `@latest` | Newest stable build   |
| `@2.4.5`  | Pinned release        |
| `@beta`   | Beta channel          |

```html
<!-- flowbitz.dev -->
<script src="https://www.flowbitz.dev/latest/flowbitz.umd.js"></script>

<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/flowbitz@2.4.5/dist/flowbitz.umd.js"></script>

<!-- ES module -->
<script type="module">
  import FlowBitz from 'https://cdn.jsdelivr.net/npm/flowbitz@2.4.5/dist/flowbitz.es.js';
  await FlowBitz.init();
</script>
```

| Bundle        | v1 (gzipped) | v2.4 (gzipped) | Notes        |
| ------------- | ------------ | -------------- | ------------ |
| UMD           | 300 KB       | ~108 KB        | GSAP bundled |
| ES entry      | 300 KB       | ~4.5 KB        | + lazy chunks |
| npm install   | 828 KB       | ~320 KB        | Full package |

---

## Local Development

### Prerequisites

- Node.js 16+
- npm 8+

### Setup

```bash
git clone https://github.com/Slabpixel/FlowBitz.git
cd FlowBitz
npm install
npm run dev
```

### Common scripts

| Command                 | Purpose                          |
| ----------------------- | -------------------------------- |
| `npm run dev`           | Showcase app (Vite)              |
| `npm run build:library` | Library bundles                  |
| `npm run deploy:stable` | Build versioned dist + Vercel    |
| `npm run deploy:beta`   | Beta channel only                |

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) and [docs/VERSION.md](docs/VERSION.md) for release workflow.

---

## Contributing

We love community contributions—bug fixes, docs, and new components all welcome.

1. Fork the repo and create a feature branch
2. Implement your change and run `npm run build:library`
3. Update documentation / metadata as needed
4. Open a PR describing the change, usage, and testing steps

Adding a component? Remember to:

- Implement it in `src/library/components/`
- Register it inside `src/library/core/WebflowBits.js`
- Document attributes in `src/library/data/componentsMetadata.js`
- (Optional) add a demo to the showcase app

---

## Support & Resources

- Docs & demos: [flowbitz.dev](https://www.flowbitz.dev)
- Release notes: [flowbitz.dev/release](https://www.flowbitz.dev/release)
- Issues & feature requests: [GitHub Issues](https://github.com/Slabpixel/FlowBitz/issues)
- Community chat: FlowBitz Discord (link on the website)
- Email: [support@flowbitz.dev](mailto:support@flowbitz.dev)

---

## License & Credits

- Licensed under the [MIT License](LICENSE)
- Crafted by [Slabpixel Studio](https://slabpixel.com)
- Powered by [GSAP](https://greensock.com/gsap) and inspired by the Webflow motion community

Made with ❤️ for creative Webflow builders.
