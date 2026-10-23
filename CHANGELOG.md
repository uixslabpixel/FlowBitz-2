# Changelog

> **Convention from here on:** build new pages and content in Astro (`src/astro/`,
> content collections for data) with GSAP for motion. Use a React island only where a
> piece genuinely needs client-side interactivity. Don't add new pages to `PageIsland`.
> New pages just use `Base.astro`: the sidebar and Astro navigation come with it.

## 2026-10-23 — Persistent sidebar via Astro ClientRouter

- `Base.astro` now owns the frame: `<ClientRouter />`, the `#main-content` scroller, and
  the sidebar as its own island (`SideNavIsland.jsx`, `transition:persist="sidenav"`).
  Astro page swaps replace only `<main>`; the sidebar never remounts, Astro or React page.
- `src/app/AstroRouter.jsx` — a React Router `<Router>` whose navigator hands page changes
  to Astro's `navigate()`. Same-path changes (`?feedback=`) and an island's own
  `localPaths` (`/templates` <-> `/templates/:slug`) are a plain `pushState` instead.
  Location re-syncs on `popstate` and `astro:page-load` (fired on `document`).
- `PageIsland` is per-page again (`page` prop picks the React page). `AppShell` no longer
  renders the frame, it only re-scans wb-components after each render.
- Vercel Analytics / Speed Insights moved into the persisted sidebar island.

## 2026-10-23 — Astro port + GSAP motion

The showcase site moved from a Vite React SPA to **Astro 7** (static output), and every
authored motion now runs on **GSAP**. The wb-component library (`src/library/`) and its
build (`vite.config.library.js`) are unchanged.

### How the site is put together now

- `astro.config.mjs` — `srcDir` is `src/astro`, output goes to `dist/`. Keeps the
  `@app` / `@library` / `@shared` aliases and the `VITE_*` env prefix (Supabase keys).
- `src/astro/layouts/Base.astro` — `<head>` meta, favicons, GSAP CDN scripts the
  library reads from `window`, Google Analytics. Replaces the old root `index.html`.
- `src/astro/pages/**` — one `.astro` file per route. Dynamic routes use
  `getStaticPaths` from existing data: component keys (`componentsMetadata.js`),
  template slugs (`templateDetails.js`), blog slugs (`blogPosts.js`).
- `src/app/PageIsland.jsx` — the React island for the legacy React pages (superseded
  by the per-page setup in the entry above). `src/app/App.jsx` / `main.jsx` are no
  longer entry points.
- Islands use `client:only="react"`: the library touches `document` at import time, so
  it can't be server-rendered. Only `<head>` is static HTML.
- `npm run dev` → `astro dev`; `npm run build` → `astro build` then the library build.
  Astro empties `dist/` first, so always run the full `build` before deploying.
- `vercel.json` — the SPA fallback (`/(.*) → /index.html`) is gone. Security headers
  apply to all routes; clean URLs map to `/<path>/index.html`; anything else is a 404.

### Motion (GSAP)

Shared helpers live in `src/app/motion/gsap.js`, using npm `gsap`. All of them skip
when `prefers-reduced-motion` is set and kill their tweens on cleanup.

| Motion | Before | Now |
| --- | --- | --- |
| Card stagger-in (Effects, Tools, Templates, Showcase) | WAAPI in `useStaggerIn` | `gsap.fromTo` with stagger |
| Report Bug hover (silk, climb, arrive) | CSS keyframes | `useBugHover` timeline |
| Button press squish (sidebar, Showcase submit card) | `.squish` CSS | `useSquish` (`back.out` spring) |
| Shimmer on gallery previews | CSS keyframes | `useShimmer` |
| Template modal open/close | Tailwind transitions + `setTimeout` | GSAP timeline, navigates on complete |
| EasterEggMark sequences | `el.animate()` | `gsap.to/fromTo` (awaited) |

Still CSS or rAF on purpose: hover colour transitions, Radix state animations, and the
frame-by-frame physics loops (EasterEggMark rain/tag-along, canvas backgrounds).

### Gotchas

- `Installation.jsx` imports the Prism theme from `react-syntax-highlighter/dist/cjs/...`
  because the ESM barrel has extensionless imports Node can't resolve.
- First `astro dev` run after a dependency change logs `504 (Outdated Optimize Dep)`;
  a refresh clears it.
- `.astro/` is generated and gitignored.
- `src/app/pages/Contact.jsx` exists (restored on main) but isn't routed; `/contact`
  still redirects to `/?feedback=…`.
