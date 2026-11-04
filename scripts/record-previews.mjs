// Records the gallery preview video for each effect card on the home page.
//
//   npm run dev                                   (in another terminal)
//   node scripts/record-previews.mjs              every effect
//   node scripts/record-previews.mjs split-text   only the named effects
//
// Each card is hovered in a real browser so the live effect runs, captured for a few seconds
// through Chrome's screencast while the mouse moves around it like a hand would (cursor-driven
// effects need movement), then cropped with ffmpeg into public/previews/<id>.webm, .mp4 (Safari) and .webp (poster).
// Needs Google Chrome and ffmpeg installed. Set BASE_URL if the dev server isn't on :4321.

import { chromium } from "playwright-core";
import { componentsMetadata } from "../src/library/data/componentsMetadata.js";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:4321";
const OUT_DIR = "public/previews";
const LIST_FILE = "src/app/content/previewVideos.json";
const SECONDS = 4;
// Below md the grid is one column, so a 672px window gives a 640x480 card. The window is only a
// little taller than the card: smaller screencast frames arrive about 60 times a second instead of
// 40, so fewer output frames repeat.
const VIEWPORT = { width: 672, height: 540 };
// Captured and kept at 2x, so cards stay crisp on retina screens.
const SCALE = 2;
const OUTPUT_WIDTH = 1280;
const FPS = 30;
// Canvas backgrounds paint their first frame a moment after mounting; skip that blank lead-in.
const LEAD_IN = { background: 1.2 };
// Cursor effects start filming after this much off-camera wiggling in the middle: an effect's first
// pointer moves can stall the page briefly, which would otherwise show as a frozen cursor at the start.
const PRE_ROLL = 0.4;
// The poster frame, in seconds into the clip: late enough that intro animations have settled.
const POSTER_AT = 2.5;
// Effects whose 2.5s frame is mid-transition, has the cursor away from the text, or (shimmer-button)
// falls between hover sweeps.
const POSTER_AT_FOR = { "rotating-text": 1.0, "text-pressure": 1.8, "shimmer-button": 3.55 };
// Effects that react to clicks: the mouse moves around the button and clicks each time it stops.
const CLICKED = new Set(["ripple-button", "pulse-button"]);
// Effects on a smaller target (a button, one word, the 3D card): the mouse moves over that element,
// not the whole card. The value is the element to measure inside the card.
const AIMED = {
  ...Object.fromEntries([...CLICKED, "tooltip-text"].map((id) => [id, "[wb-component]"])),
  // The effect moves the visible card into a new inner element; the outer one fills the tile.
  "3d-card-hover": ".wb-hover3d__inner",
};
// Effects driven by the pointer get a drawn cursor (screencasts don't capture the real one), so the
// video shows what's causing the motion.
const CURSOR = new Set([
  "3d-card-hover", "hover-zoom", "image-trail", "magnetic-button", "variable-proximity", "text-pressure",
  "tooltip-text", "roll-text", "scramble-text", "star-field", "particles-network", ...CLICKED,
]);

// The cursor from the design (Figma "Cursor size scale", node 915:1841): drawn 22x24 on a 448px card,
// so it is scaled by card width / 448 to keep that size relative to the card.
const CURSOR_SVG = `<svg width="27.3608" height="30.0649" viewBox="0 0 27.3608 30.0649" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible"><g filter="url(#wb-cursor-shadow)"><path d="M4.75003 1.87558L22.6108 12.5641L12.6539 13.1635L8.68519 22.3149L4.75003 1.87558Z" fill="#1E1E1E" stroke-width="1.5" stroke-linejoin="round" stroke="white"/></g><defs><filter id="wb-cursor-shadow" x="-1.21276" y="-1" width="30" height="32" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="3"/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.34 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter></defs></svg>`;
const CURSOR_DESIGN_CARD_WIDTH = 448;
// The arrow's tip in the SVG: the point that sits on the mouse position.
const CURSOR_TIP = [4.75, 1.876];

// Draws the cursor at the mouse; it dips slightly, around its tip, while the button is pressed.
// Runs in the page.
const addCursor = ({ svg, scale, tip }) => {
  const cursor = document.createElement("div");
  cursor.innerHTML = svg;
  cursor.style.cssText = `position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;transform-origin:${tip[0]}px ${tip[1]}px;scale:${scale};transition:scale .12s cubic-bezier(.3,0,.2,1)`;
  document.body.append(cursor);
  addEventListener("mousemove", (e) => (cursor.style.translate = `${e.clientX - tip[0]}px ${e.clientY - tip[1]}px`), true);
  addEventListener("mousedown", () => (cursor.style.scale = String(scale * 0.86)), true);
  addEventListener("mouseup", () => (cursor.style.scale = String(scale)), true);
};

// The mouse's route: points around the middle of the card (or of the aimed element), as fractions
// of its width and height scaled by `spread`. Every route starts and ends in the middle, so the clip
// loops without a jump. The mouse rests `pause` seconds at each point (and clicks there, for
// CLICKED effects); `bow` curves each move to one side, alternating, like a wrist pivoting.
const ROUTES = {
  default: {
    points: [[0, 0], [-0.85, -0.6], [0.9, -0.3], [0.3, 0.85], [-0.65, 0.4], [0, 0]],
    spread: { x: 0.32, y: 0.26 },
    pause: 0.18,
    bow: 0.16,
  },
  // The card tilts toward the pointer (1deg per 15px from its centre, eased over 300ms). Visit its
  // corners at 80% of the way out, so the tilt stays slight, and pause long enough to let it settle:
  // top-left, a slow sweep to top-right, down to the bottom edge, back to the middle.
  "3d-card-hover": {
    points: [[0, 0], [-0.8, -0.78], [0.8, -0.72], [0.05, 0.85], [0, 0]],
    spread: { x: 0.5, y: 0.5 },
    pause: 0.3,
    bow: 0.08,
    // Poster: mid-pause at the top-right corner, with the card fully tilted.
    posterAtStop: 2,
  },
};

// A hand reaching for a point speeds up smoothly and settles gently: the minimum-jerk profile.
const reach = (u) => u * u * u * (10 - 15 * u + 6 * u * u);

// Plans the route through the area as timed, slightly curved moves. Longer moves take longer, but
// not proportionally (as with a real hand), and the whole route fills exactly `seconds`.
const planRoute = (area, seconds, { points: route, spread, pause, bow: bowBy }) => {
  const cx = area.x + area.width / 2;
  const cy = area.y + area.height / 2;
  const points = route.map(([nx, ny]) => [cx + nx * area.width * spread.x, cy + ny * area.height * spread.y]);
  const moves = points.slice(1).map((end, i) => {
    const start = points[i];
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const length = Math.hypot(dx, dy) || 1;
    // Bow each move a little to one side, alternating, like a wrist pivoting.
    const bow = length * bowBy * (i % 2 ? -1 : 1);
    const nx = (-dy / length) * bow;
    const ny = (dx / length) * bow;
    return {
      start,
      end,
      c1: [start[0] + dx * 0.3 + nx, start[1] + dy * 0.3 + ny],
      c2: [start[0] + dx * 0.7 + nx, start[1] + dy * 0.7 + ny],
      weight: Math.sqrt(length),
    };
  });
  const moving = seconds - pause * moves.length;
  const total = moves.reduce((sum, m) => sum + m.weight, 0);
  let at = 0;
  for (const m of moves) {
    m.from = at;
    m.to = at + (m.weight / total) * moving;
    m.clickAt = m.to + pause / 2;
    at = m.to + pause;
  }
  return { moves, start: points[0] };
};

// Where the mouse is `t` seconds into the route.
const positionAt = ({ moves, start }, t) => {
  if (t <= 0) return start;
  for (const m of moves) {
    if (t < m.from) return m.start;
    if (t <= m.to) {
      const u = reach((t - m.from) / (m.to - m.from));
      const v = 1 - u;
      return [0, 1].map((k) => v * v * v * m.start[k] + 3 * v * v * u * m.c1[k] + 3 * v * u * u * m.c2[k] + u * u * u * m.end[k]);
    }
  }
  return moves[moves.length - 1].end;
};

// Screencast frames only arrive when the page repaints, and compositor-only animations (a CSS
// transform pulse) don't repaint. A 1px dot outside the card changing every frame keeps them coming.
const keepPainting = () => {
  const dot = document.createElement("div");
  dot.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none";
  document.body.append(dot);
  let odd = false;
  const tick = () => {
    dot.style.background = (odd = !odd) ? "rgba(0,0,0,0.01)" : "rgba(0,0,0,0.02)";
    requestAnimationFrame(tick);
  };
  tick();
};

const tmp = mkdtempSync(join(tmpdir(), "flowbitz-previews-"));
mkdirSync(OUT_DIR, { recursive: true });

// deviceScaleFactor alone still screencasts at 1x; the flag makes the frames really 2x.
const browser = await chromium.launch({ channel: "chrome", args: [`--force-device-scale-factor=${SCALE}`] });

// Opens the home page with every card rendered and the hover chrome hidden. ?live-previews makes
// the cards run their live effect instead of an earlier recording.
const openGallery = async (page) => {
  await page.goto(`${BASE_URL}/?live-previews`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: 'a[id^="card-"] > span { display: none !important; }' });
  // Cards are links; a cancelled click still reaches the effect but doesn't navigate away.
  await page.evaluate(() => document.addEventListener("click", (e) => e.preventDefault(), true));
  for (;;) {
    const more = page.getByRole("button", { name: /load more/i });
    if (!(await more.count())) break;
    await more.click();
    await page.waitForTimeout(400);
  }
};

const listPage = await browser.newPage({ viewport: VIEWPORT });
await openGallery(listPage);
const allIds = await listPage.$$eval('a[id^="card-"]', (cards) => cards.map((a) => a.id.slice(5)));
await listPage.close();

const wanted = process.argv.slice(2);
const ids = wanted.length ? allIds.filter((id) => wanted.includes(id)) : allIds;
const missing = wanted.filter((id) => !allIds.includes(id));
if (missing.length) console.warn(`Not on the home page, skipped: ${missing.join(", ")}`);

const ffmpeg = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args]);

for (const id of ids) {
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: SCALE });
  await openGallery(page);
  await page.evaluate((cardId) => document.getElementById(cardId).scrollIntoView({ block: "center" }), `card-${id}`);
  await page.waitForTimeout(600);
  const box = await page.locator(`#card-${id}`).boundingBox();
  await page.evaluate(keepPainting);
  if (CURSOR.has(id)) {
    await page.evaluate(addCursor, { svg: CURSOR_SVG, scale: box.width / CURSOR_DESIGN_CARD_WIDTH, tip: CURSOR_TIP });
  }

  // Warm-up hover: loads the effect's fonts and images, and measures an aimed target (the live
  // element only exists while hovered). Then leave, so the filmed hover mounts the effect fresh
  // and intro animations play from the start, without the poster or a fallback font showing.
  const clicked = CLICKED.has(id);
  const aimAt = AIMED[id];
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(1500);
  const area = aimAt ? await page.locator(`#card-${id} ${aimAt}`).first().boundingBox() : box;
  const cx = area.x + area.width / 2;
  const cy = area.y + area.height / 2;
  await page.mouse.move(1, 1);
  await page.waitForTimeout(500);
  // Hover again just before filming, giving the live markup its first paint.
  await page.mouse.move(cx, cy);
  await page.waitForTimeout(150);

  // Screencast frames arrive only when the page repaints, each with its own timestamp.
  const frames = [];
  const cdp = await page.context().newCDPSession(page);
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    frames.push({ at: metadata.timestamp, data: Buffer.from(data, "base64") });
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", {
    format: "jpeg",
    quality: 92,
    everyNthFrame: 1,
    maxWidth: VIEWPORT.width * SCALE,
    maxHeight: VIEWPORT.height * SCALE,
  });

  // Only cursor effects get the pre-roll: others often play an intro on hover, which must start on camera.
  const leadIn = (LEAD_IN[componentsMetadata[id]?.category] ?? 0) + (CURSOR.has(id) ? PRE_ROLL : 0);
  const startedAt = Date.now() / 1000 + leadIn;
  // The mouse follows the clock, not a step count, so a slow machine can't change its speed. It
  // waits in the middle through any lead-in, then runs the route over the filmed seconds.
  const routePlan = ROUTES[id] ?? ROUTES.default;
  const route = planRoute(area, SECONDS, routePlan);
  const clicks = clicked ? route.moves.map((m) => m.clickAt) : [];
  for (;;) {
    const t = Date.now() / 1000 - startedAt;
    if (t > SECONDS + 1 / FPS) break;
    const [x, y] = positionAt(route, t);
    // Before the route starts, wiggle half a pixel so the effect keeps getting pointer moves.
    await page.mouse.move(t < 0 ? x + (Math.round(t * 60) % 2) * 0.5 : x, y);
    if (clicks.length && t >= clicks[0]) {
      clicks.shift();
      await page.mouse.down();
      await page.waitForTimeout(70);
      await page.mouse.up();
    }
    await page.waitForTimeout(8);
  }
  await cdp.send("Page.stopScreencast");
  await page.close();

  // Resample to a steady frame rate: each output frame repeats the latest screencast frame.
  const dir = mkdtempSync(join(tmp, `${id}-`));
  let latest = frames.find((f) => f.at >= startedAt) ?? frames[0];
  for (let n = 0; n < SECONDS * FPS; n++) {
    const at = startedAt + n / FPS;
    for (const f of frames) if (f.at <= at && f.at > latest.at) latest = f;
    writeFileSync(join(dir, `${String(n).padStart(4, "0")}.jpg`), latest.data);
  }

  // Chrome may send smaller frames than asked for, so scale the card box by the real frame width.
  const frameWidth = Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=width", "-of", "csv=p=0", join(dir, "0000.jpg")]),
  );
  const k = frameWidth / VIEWPORT.width;
  // Even dimensions keep H.264 happy.
  const even = (n) => Math.floor(n / 2) * 2;
  const crop = `crop=${even(box.width * k)}:${even(box.height * k)}:${Math.round(box.x * k)}:${Math.round(box.y * k)},scale='min(${OUTPUT_WIDTH},iw)':-2`;
  // JPEG frames are full-range colour; browsers' hardware decoders reject full-range VP9
  // (PIPELINE_ERROR_DECODE), so convert to the standard limited range.
  const toVideo = `${crop},scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p,setparams=range=tv:colorspace=bt709:color_primaries=bt709:color_trc=iec61966-2-1`;
  // Tagged as sRGB: untagged video is colour-managed with the video (BT.709) curve, which shifts
  // saturated colours away from the CSS colours around it.
  const colour = ["-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "iec61966-2-1"];
  const input = ["-framerate", String(FPS), "-i", join(dir, "%04d.jpg"), "-vf", toVideo, ...colour, "-an"];

  ffmpeg([...input, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "38", "-row-mt", "1", join(OUT_DIR, `${id}.webm`)]);
  ffmpeg([...input, "-c:v", "libx264", "-crf", "27", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", join(OUT_DIR, `${id}.mp4`)]);
  const routePoster = routePlan.posterAtStop && route.moves[routePlan.posterAtStop - 1].clickAt;
  const posterAt = POSTER_AT_FOR[id] ?? routePoster ?? POSTER_AT;
  const posterFrame = join(dir, `${String(Math.round(posterAt * FPS)).padStart(4, "0")}.jpg`);
  // Many ffmpeg builds lack libwebp, so the poster goes through a PNG and Pillow.
  const posterPng = join(dir, "poster.png");
  ffmpeg(["-i", posterFrame, "-vf", crop, posterPng]);
  execFileSync("python3", ["-c", "import sys; from PIL import Image; Image.open(sys.argv[1]).save(sys.argv[2], quality=80, method=6)", posterPng, join(OUT_DIR, `${id}.webp`)]);
  console.log(`recorded ${id} (${frames.length} frames captured)`);
}

await browser.close();
rmSync(tmp, { recursive: true, force: true });

// The gallery only swaps in a video for effects that have one.
const recorded = [...new Set(readdirSync(OUT_DIR).filter((f) => f.endsWith(".webm")).map((f) => f.slice(0, -5)))].sort();
writeFileSync(LIST_FILE, `${JSON.stringify(recorded, null, 2)}\n`);
console.log(`${recorded.length} previews listed in ${LIST_FILE}`);
