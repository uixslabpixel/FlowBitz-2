# FlowBitz: handoff context

Paused 2026-11-03 in the middle of re-recording the home-grid preview videos. Read this before continuing.

## Where things stand

- Live site: https://flowbitz-redesign.vercel.app (Vercel project `uix-4102/flowbitz-redesign`).
  It runs commit `44247f7` ("Warm up each card before filming its preview"): 18 cards have the new
  recordings, and the 12 listed below still have the earlier ones (2x and sRGB, but possibly with the first-frame glitch).
- Since that deploy, `scripts/record-previews.mjs` gained a **warm-up hover**: hover the card for 1.5s
  so fonts and images load, leave, hover again, and wait 150ms before filming. This fixes a glitch in the first
  frames: the static poster flashed, and Text Pressure briefly showed a fallback serif before Roboto Flex loaded.
- All 30 cards were being re-recorded with that fix. The run was stopped after 18 of them.

### Re-recorded with the warm-up fix (committed)
split-text, gradient-text, text-type, decrypted-text, variable-proximity, count-up, blur-text,
scramble-text, rotating-text, shuffle, roll-text, magnetic-button, 3d-card-hover, outline-gradient,
image-trail, hover-zoom, shiny-text, text-pressure

### Still to re-record (12)
tooltip-text, gradient-button, ripple-button, pulse-button, shimmer-button, smart-animate,
matrix-rain, firefly-background, dot-grid, star-field, particles-network, flow-field

## How to finish

1. Run the dev server: `npm run dev` (Astro on http://localhost:4321).
2. Record the rest:
   ```
   node scripts/record-previews.mjs tooltip-text gradient-button ripple-button pulse-button shimmer-button smart-animate matrix-rain firefly-background dot-grid star-field particles-network flow-field
   ```
   This needs **Google Chrome** (playwright-core with `channel: "chrome"`), **ffmpeg/ffprobe** (with libvpx-vp9
   and libx264), and **python3 with Pillow** (posters are made as WebP). If the environment has no Chrome, switch
   the launch to a bundled Chromium (`npx playwright install chromium` and drop `channel`).
   Each card takes about 30–40s.
3. Check the output:
   - 60 files in `public/previews/` at 1280x960, each tagged `color_transfer=iec61966-2-1`:
     `ffprobe -v error -select_streams v -show_entries stream=width,height,color_transfer -of csv=p=0 <file>`
   - The first ~12 frames of each new video show no poster flash or font swap.
   - Posters (`public/previews/<id>.webp`) show the effect mid-action, not a blank or transitional frame.
4. Commit, then push to `main`.
5. Deploy. The Vercel project is **not git-connected**, so deploy manually from a clean checkout of `origin/main`.
   The user used a worktree at `../flowbitz-deploy`, detached at `origin/main`:
   `npm install && npm run build && npx vercel --prod --yes`.
   This needs a logged-in Vercel CLI. In cloud you may need a `VERCEL_TOKEN`; ask the user.

## How the recorder works (scripts/record-previews.mjs)

- Opens `/?live-previews`. That query makes cards run the live effect instead of their video. It hides the hover
  chrome and clicks "Load more" until all cards show.
- Viewport 672x900 with Chrome launched with `--force-device-scale-factor=2`. Without that flag, the
  CDP screencast sends 1x frames. Output is 1280x960.
- Frames come from the CDP screencast, which sends a frame only when the page repaints. A 1px ticker element
  (`keepPainting`) forces a repaint every frame, so compositor-only animations still get filmed.
- The cursor follows a figure-eight path for 4s. `CURSOR` lists the effects that get a drawn arrow cursor.
  `AIMED` effects trace the path over their element instead of the whole card. `CLICKED` effects (ripple, pulse)
  are clicked about every 0.9s, and a capture-phase `preventDefault` stops the card link from navigating.
- Encoding: VP9 webm (crf 38) plus H.264 mp4 (crf 27), converted to limited range with a BT.709 matrix and tagged
  sRGB via `setparams`. Full-range VP9 fails to decode in Chrome. Untagged video gets colour-managed with
  the video curve and no longer matches the CSS colours.
- Posters are taken at 2.5s, with overrides in `POSTER_AT_FOR` (rotating-text 1.0s, text-pressure 1.8s).
- Writes `src/app/content/previewVideos.json`, the list of ids that have a video.

## Key files

- `src/app/components/redesign/EffectCard.jsx`: the card.
  - It shows the video poster at rest, plays on hover (desktop) and shows the live effect under `?live-previews`.
  - On touch screens, one shared IntersectionObserver plays the card nearest the screen centre once it is at least
    60% visible, after scrolling settles for 150ms.
  - Videos use `preload="none"`; `load()` runs only after a play.
- `src/app/components/redesign/cardThemes.js`: per-effect card design `{background, code, poster?, fill?, hoverDriven?}`.
  - Sizes use `cqw` against the card width, and Tailwind classes must be literal strings.
- Library fixes, which reach CDN users only after a library release:
  - `src/library/components/text/textPressure.js`: the hosted Compressa VF file returns 404, so it now uses
    Roboto Flex with a `wdth` axis, and "Compressa VF" maps to Roboto Flex.
  - `src/library/components/background/matrixRain.js`: columns now cover the full width and are centred.
  - `src/library/components/effect/imageTrail.js`: relative image URLs are accepted.
  - `src/library/components/text/rollText.js`: `splitBy: "chars"` by default.

## User preferences seen in this work

- Before recording any videos, show an HTML preview (`/?live-previews`) for approval.
- Finished work ships to GitHub `main` and Vercel production.
- Untracked folders `.claude/`, `.impeccable/`, `explorations/`, `template cover/` and the file `PRODUCT.md` are the user's
  working files. Don't commit them.
