# FlowBitz: handoff context

Updated 2026-11-03. All 30 home-grid preview videos are re-recorded with the warm-up fix. Nothing is pending.

## Where things stand

- Live site: https://flowbitz-redesign.vercel.app (Vercel project `uix-4102/flowbitz-redesign`).
- All 30 cards have recordings made with the **warm-up hover** in `scripts/record-previews.mjs`: hover the card for
  1.5s so fonts and images load, leave, hover again, and wait 150ms before filming. This fixed a glitch in the first
  frames: the static poster flashed, and Text Pressure briefly showed a fallback serif before Roboto Flex loaded.
- Checked: all 90 files in `public/previews/` are 1280x960, all 60 videos are tagged `color_transfer=iec61966-2-1`,
  the first ~12 frames show no poster flash or font swap, and each poster shows its effect mid-action.
- Shimmer Button's shimmer only plays on hover, so its 2.5s poster fell between sweeps. Its poster time is now 3.55s
  (`POSTER_AT_FOR`). The sweep follows the cursor path, so it can drift by a few frames between runs; check the
  poster after re-recording it.
- The mobile navbar (below `lg`) matches Figma node 913:2527 (file `Qk6OJ3HZnRZVdoHVC6K0HV`): a 60px bar,
  two 26px/3px lines that morph into the design's X, and the pixel easter-egg mark hidden on mobile (the user's
  choice). When the menu opens, the card floats over the page (the bar keeps a 76px slot), each menu line rises
  in 35ms apart at full opacity (the user rejected fades), `main` dims to 40% via `data-menu-open` on
  `#main-content` (see `Base.astro`), and the scroller is locked. Tapping the page, Esc, or widening to
  desktop closes it. The user reviews motion changes as recorded before/after clips in a Claude artifact
  before anything is pushed.
- Not done: the page heading and filter chips below the mobile bar are larger than in that Figma frame.

## Re-recording previews

1. Run the dev server: `npm run dev`. In the cloud environment it served on http://localhost:3000, so set
   `BASE_URL=http://localhost:3000`. The default is :4321.
2. Run `node scripts/record-previews.mjs <id> [<id> ...]`.
   This needs **Google Chrome** (playwright-core with `channel: "chrome"`), **ffmpeg/ffprobe** (with libvpx-vp9
   and libx264), and **python3 with Pillow** (posters are made as WebP). If the environment has no Chrome, switch
   the launch to a bundled Chromium and drop `channel`. Each card takes about 30–40s.
3. Check sizes and tags with
   `ffprobe -v error -select_streams v -show_entries stream=width,height,color_transfer -of csv=p=0 <file>`,
   then look at the first frames and the posters.

## Deploying

The Vercel project is **not git-connected**, so deploy manually from a clean checkout of `origin/main`
(`npm install && npm run build && npx vercel --prod --yes`). This needs a logged-in Vercel CLI or a `VERCEL_TOKEN`.

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
