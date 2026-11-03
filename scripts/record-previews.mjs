// Records the gallery preview video for each effect card on the home page.
//
//   npm run dev                                   (in another terminal)
//   node scripts/record-previews.mjs              every effect
//   node scripts/record-previews.mjs split-text   only the named effects
//
// Each card is hovered in a real browser so the live effect runs, captured for a few seconds
// through Chrome's screencast while the mouse traces a figure-eight (cursor-driven effects need
// movement), then cropped with ffmpeg into public/previews/<id>.webm, .mp4 (Safari) and .webp (poster).
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
// Below md the grid is one column, so a 672px window gives a 640x480 card.
const VIEWPORT = { width: 672, height: 900 };
// Captured and kept at 2x, so cards stay crisp on retina screens.
const SCALE = 2;
const OUTPUT_WIDTH = 1280;
const FPS = 30;
// Canvas backgrounds paint their first frame a moment after mounting; skip that blank lead-in.
const LEAD_IN = { background: 1.2 };
// The poster frame, in seconds into the clip: late enough that intro animations have settled.
const POSTER_AT = 2.5;
// Effects whose 2.5s frame is mid-transition, has the cursor away from the text, or (shimmer-button)
// falls between hover sweeps.
const POSTER_AT_FOR = { "rotating-text": 1.0, "text-pressure": 1.8, "shimmer-button": 3.55 };
// Effects that react to clicks: the mouse stays on the button and clicks about once a second.
const CLICKED = new Set(["ripple-button", "pulse-button"]);
const CLICK_EVERY = Math.round(FPS * 0.9);
// Effects on a small target (a button, one word): the mouse traces over that element, not the card.
const AIMED = new Set([...CLICKED, "tooltip-text"]);
// Effects driven by the pointer get a drawn cursor (screencasts don't capture the real one), so the
// video shows what's causing the motion.
const CURSOR = new Set([
  "3d-card-hover", "hover-zoom", "image-trail", "magnetic-button", "variable-proximity", "text-pressure",
  "tooltip-text", "roll-text", "scramble-text", "star-field", "particles-network", ...CLICKED,
]);

// An arrow that follows the mouse and dips on press. Runs in the page.
const addCursor = () => {
  const cursor = document.createElement("div");
  cursor.innerHTML = `<svg width="30" height="38" viewBox="0 0 22 28"><path d="M2 2v21l5.5-5.2 3.6 8.3 3.6-1.6-3.5-8.1H19z" fill="#111" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>`;
  cursor.style.cssText = "position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;transition:scale .12s;transform-origin:3px 3px";
  document.body.append(cursor);
  addEventListener("mousemove", (e) => (cursor.style.translate = `${e.clientX - 3}px ${e.clientY - 3}px`), true);
  addEventListener("mousedown", () => (cursor.style.scale = "0.8"), true);
  addEventListener("mouseup", () => (cursor.style.scale = "1"), true);
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
  if (CURSOR.has(id)) await page.evaluate(addCursor);

  // Warm-up hover: loads the effect's fonts and images, and measures an aimed target (the live
  // element only exists while hovered). Then leave, so the filmed hover mounts the effect fresh
  // and intro animations play from the start, without the poster or a fallback font showing.
  const clicked = CLICKED.has(id);
  const aimed = AIMED.has(id);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(1500);
  const area = aimed ? await page.locator(`#card-${id} [wb-component]`).boundingBox() : box;
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

  const leadIn = LEAD_IN[componentsMetadata[id]?.category] ?? 0;
  const startedAt = Date.now() / 1000 + leadIn;
  const steps = (SECONDS + leadIn) * FPS;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = cx + Math.sin(t) * area.width * 0.3;
    const y = cy + Math.sin(t * 2) * area.height * 0.2;
    if (clicked && i % CLICK_EVERY === Math.floor(CLICK_EVERY / 2)) await page.mouse.click(x, y);
    else await page.mouse.move(x, y);
    await page.waitForTimeout(1000 / FPS);
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
  const posterFrame = join(dir, `${String(Math.round((POSTER_AT_FOR[id] ?? POSTER_AT) * FPS)).padStart(4, "0")}.jpg`);
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
