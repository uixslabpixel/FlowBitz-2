// Art direction for gallery cards (from the pen.dev redesign), keyed by component id.
// Sizes are in cqw (1% of the card's width; the card is a size container), converted from the
// design's px at its 447px card width, so previews scale with the card at every breakpoint.
// Each theme sets the card surface and a custom preview snippet that still runs the real effect.
// Components without a theme fall back to a white card with their metadata example.

// Faded DM Mono rows behind the decrypted-text card. Every row is three equal 17-char blocks,
// so the animated phrase (middle block of the PHRASE row) sits dead centre and columns line up.
const PHRASE = "Encrypted Message";
const CODE_ROWS = [
  ["KC7R10D8E 13H6O4Y", "YY8K28C4L 28M1E7A", "KM1E93Z9T 91H7F0L"],
  ["ZJ4N31H5X 61S5V2Y", "QD1E99D2E 86M0F1U", "EZ6Q98M6G 42Y1E3U"],
  ["JX5N26E9L 83S8A9O", "PG7G19P3B 74R5X7G", "KU1S65S1Q 02T9Z6W"],
  ["JY1W13Z1L 53R7D6O", PHRASE, "DD3X74D5Z 88A9R6X"],
  ["SU4V38M3Q 43E3D1J", "UT4I14W5K 70K2P2A", "EE1V08D6H 69B3D0G"],
  ["SZ1K78B4N 98O6K3R", "BA9S85N7M 25N2A4C", "TB2R14U9H 77D5O3M"],
  ["DM5Y92U7Z 01L4C1P", "LB0P22G7C 75B4F7X", "VA4U22V1Q 96A1M5Q"],
];

// Fixed 17ch blocks keep every row the same width even while the phrase is scrambling.
const block = (content, extra = "opacity-30") =>
  `<span class="w-[17ch] shrink-0 text-center ${extra}">${content}</span>`;

// Every block runs decrypted-text, so on hover (the card replays) the whole wall scrambles:
// the faded code resolves all at once, the phrase decodes letter by letter.
const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const PHRASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const decrypt = (text, sequential = false) =>
  `<span wb-component="decrypted-text" wb-animate-on="view" wb-sequential="${sequential}" wb-characters="${
    sequential ? PHRASE_CHARS : CODE_CHARS
  }" wb-trigger-on-view="false">${text}</span>`;

const codeRow = ([left, middle, right]) =>
  `<div class="flex gap-[1ch] whitespace-nowrap">${block(decrypt(left))}${
    middle === PHRASE ? block(decrypt(PHRASE, true), "") : block(decrypt(middle))
  }${block(decrypt(right))}</div>`;

// Variable-proximity rest shape: one wght value per char, as if a cursor were parked over "ab".
const VARIABLES_REST = [100, 100, 100, 100, 800, 900, 600, 300, 100];
const VARIABLES_CLASS =
  "font-inter font-normal text-white text-[length:21.237cqw] leading-[22.355cqw] tracking-[-1.487cqw]";

// Image-trail photos, cropped to the design's 67x85 tile.
const TRAIL_IMAGES = [1, 2, 3, 4].map((n) => `/images/cards/trail-${n}.webp`);
// Where the design draws the resting trail, as [left, top] in cqw.
const TRAIL_POSTER = [
  [50.075, 11.401],
  [63.264, 18.107],
  [73.547, 30.402],
  [67.735, 44.486],
];

// Big button shared by the button cards, sized like the design's "Hover Me" button.
const BUTTON =
  "pointer-events-auto inline-flex items-center justify-center h-[12.519cqw] px-[7.154cqw] font-inter font-semibold text-[length:3.8cqw] leading-[5.365cqw]";

// `code` is the live preview (runs the effect, mounted only while the card is hovered).
// `poster` is static markup of the effect's settled look shown at rest; when omitted, the card
// uses `code` with every wb-* attribute stripped.
export const cardThemes = {
  "split-text": {
    background: "#1d2fd0",
    // Split by character with a slow stagger, so each letter visibly lands; the last word in lime.
    code: `<h2 wb-component="split-text" wb-split-type="characters" wb-stagger-delay="60" wb-duration="0.9"
      wb-ease="back.out(1.7)" wb-trigger-on-view="false"
      class="w-[86cqw] text-left font-clash font-semibold uppercase text-white text-[length:21cqw] leading-[18.2cqw] tracking-[-0.5cqw]">
      Every<br>letter<br><span class="text-[#c6ff3d]">lands.</span></h2>`,
  },
  "gradient-text": {
    background: "#103337",
    code: `<h2 class="font-inter font-medium text-white text-[length:9.389cqw] leading-[10.73cqw] tracking-[-0.469cqw]">
      Feel the <span wb-component="gradient-text" wb-colors="#faf601, #faf601, #40ffaa, #faf601">gradient</span></h2>`,
    poster: `<h2 class="font-inter font-medium text-white text-[length:9.389cqw] leading-[10.73cqw] tracking-[-0.469cqw]">
      Feel the <span class="bg-[linear-gradient(90deg,#faf601_45%,#40ffaa)] bg-clip-text text-transparent">gradient</span></h2>`,
  },
  "text-type": {
    background: "#1a0909",
    code: `<h2 class="font-mono-dm font-medium text-white text-[length:6.706cqw] leading-[8.942cqw] [&_[class*=cursor]]:text-[#ff0000]">
      We Are <span wb-component="text-type" wb-cursor-character="full-block"
      wb-text-1="Developers" wb-text-2="Designers" wb-text-3="Builders">Developers</span></h2>`,
    poster: `<h2 class="font-mono-dm font-medium text-white text-[length:6.706cqw] leading-[8.942cqw]">
      We Are Developers<span class="ml-[0.1em] font-mono text-[#ff0000]">█</span></h2>`,
  },
  "decrypted-text": {
    background: "#000000",
    fill: true,
    code: `<div class="w-full h-full flex flex-col items-center justify-center overflow-hidden font-mono-dm font-medium text-[#00ffcc] text-[length:5.589cqw] leading-[7.601cqw]">
      ${CODE_ROWS.map(codeRow).join("")}
    </div>`,
  },
  "variable-proximity": {
    background: "#273155",
    // The live effect tracks the cursor anywhere on the card (wb-container).
    hoverDriven: true,
    code: `<h2 wb-component="variable-proximity" wb-container="#card-variable-proximity" wb-radius="160"
      class="${VARIABLES_CLASS}">Variables</h2>`,
    poster: `<h2 class="${VARIABLES_CLASS}">${[..."Variables"]
      .map((ch, i) => `<span class="inline-block" style="font-variation-settings: 'wght' ${VARIABLES_REST[i]}, 'opsz' 8">${ch}</span>`)
      .join("")}</h2>`,
  },
  "count-up": {
    background: "#bbbcd2",
    code: `<h2 wb-component="count-up" wb-count-to="68" wb-trigger-on-view="false"
      class="font-clash font-medium text-black text-[length:26.155cqw] leading-[29.061cqw] tracking-[-1.046cqw]">0</h2>`,
    poster: `<h2 class="font-clash font-medium text-black text-[length:26.155cqw] leading-[29.061cqw] tracking-[-1.046cqw]">68</h2>`,
  },
  // Cards from the Figma "New Preview" set. Cursor-driven effects get pointer-events-auto, since
  // the card's preview layer ignores the pointer.
  "blur-text": {
    background: "#103337",
    fill: true,
    code: `<div class="relative w-full h-full flex items-center justify-center">
      <img src="/images/cards/foggy-forest.webp" alt="" class="absolute inset-0 w-full h-full object-cover">
      <div class="absolute inset-0 bg-black/40"></div>
      <h2 wb-component="blur-text"
        class="relative max-w-[72cqw] font-inter font-semibold text-white text-[length:12.519cqw] leading-[14.307cqw] tracking-[-0.501cqw]">
        Blur to Clear Text Effect</h2>
    </div>`,
  },
  "scramble-text": {
    background: "#7b808b",
    // wb-font="inherit" sets font-family: inherit on the <p> itself, so DM Mono sits on a wrapper.
    code: `<div class="font-mono-dm"><p wb-component="scramble-text" wb-font="inherit (use existing font)"
      class="pointer-events-auto w-[83.383cqw] font-medium uppercase text-white text-justify text-[length:5.365cqw] leading-[7.154cqw]">
      Once you hover over me, you will see the effect in action! You can customize the radius, duration, and speed of the scramble effect.</p></div>`,
  },
  "rotating-text": {
    background: "#f6c945",
    // Split effects wrap stray whitespace in spans, so the rotating word hugs its tags.
    code: `<h2 class="font-anton uppercase text-[#111111] text-[length:13cqw] leading-[1.15] flex flex-col items-center gap-[1.5cqw]">
      <span>We build</span>
      <span wb-component="rotating-text" wb-text-1="Websites" wb-text-2="Brands" wb-text-3="Motion"
        wb-background-color="#111111" wb-text-color="#f6c945" wb-border-radius="2.5cqw"
        class="px-[3.5cqw] py-[0.5cqw]">Websites</span>
    </h2>`,
    poster: `<h2 class="font-anton uppercase text-[#111111] text-[length:13cqw] leading-[1.15] flex flex-col items-center gap-[1.5cqw]">
      <span>We build</span>
      <span class="px-[3.5cqw] py-[0.5cqw] rounded-[2.5cqw] bg-[#111111] text-[#f6c945]">Websites</span>
    </h2>`,
  },
  shuffle: {
    background: "#0f4c3a",
    // One element per line, text hugging its tags: shuffle wraps leading whitespace in its own span,
    // which adds a blank line. Looping keeps it moving for the whole preview clip.
    code: `<div class="flex flex-col items-center font-anton uppercase text-[#b8f5d0] text-[length:22cqw] leading-[0.95]">
      ${["Shuffle", "Text"]
        .map(
          (word) =>
            `<h2 wb-component="shuffle" wb-loop="true" wb-loop-delay="0.6" wb-color-from="#ffffff" wb-color-to="#b8f5d0" class="pointer-events-auto">${word}</h2>`,
        )
        .join("")}
    </div>`,
  },
  "roll-text": {
    background: "#3b2bff",
    // A site menu, the classic place for rolling links; each item rolls as the cursor crosses it.
    code: `<nav class="flex flex-col items-center gap-[1cqw] font-anton uppercase text-white text-[length:13cqw] leading-[1.05]">
      ${["Work", "About", "Contact"]
        .map((item) => `<div wb-component="roll-text" class="pointer-events-auto inline-block"><span>${item}</span></div>`)
        .join("")}
    </nav>`,
  },
  "magnetic-button": {
    background: "#ff2e88",
    // The dashed rings sit outside the magnetic element, so they stay put and show the field the
    // button is pulled within.
    code: `<div class="relative flex items-center justify-center w-[56cqw] h-[56cqw]">
      <span class="absolute inset-0 rounded-full border-[0.4cqw] border-dashed border-black/25"></span>
      <span class="absolute inset-[9cqw] rounded-full border-[0.4cqw] border-dashed border-black/40"></span>
      <span wb-component="magnetic-button" wb-padding="140" wb-strength="1.6"
        class="pointer-events-auto flex items-center justify-center w-[26cqw] h-[26cqw] rounded-full bg-black font-anton uppercase text-[#ff2e88] text-[length:5.4cqw] leading-none">
        Grab me</span>
    </div>`,
  },
  "3d-card-hover": {
    background: "#cae9ed",
    fill: true,
    // The effect makes its element a full-size perspective wrapper and moves these classes onto a
    // new inner card, which its own stylesheet sizes to 100%; !important keeps the design's size, and
    // the margins (not the flex parent) centre it: (75cqw - 57.228cqw) / 2 on top.
    code: `<div wb-component="3d-card-hover"
      class="pointer-events-auto relative !mx-auto !mt-[8.886cqw] !w-[39.344cqw] !h-[57.228cqw] rounded-[3.577cqw] bg-[#238390]">
      <span class="absolute left-[2.683cqw] bottom-[2.683cqw] text-left font-anton uppercase text-black/20 text-[length:14.126cqw] leading-[0.91]">3D<br>Card</span>
    </div>`,
    // Same full-size wrapper the effect adds, so the card rests exactly where the live one starts.
    poster: `<div class="w-full h-full">
      <div class="relative mx-auto mt-[8.886cqw] w-[39.344cqw] h-[57.228cqw] rounded-[3.577cqw] bg-[#238390]">
        <span class="absolute left-[2.683cqw] bottom-[2.683cqw] text-left font-anton uppercase text-black/20 text-[length:14.126cqw] leading-[0.91]">3D<br>Card</span>
      </div>
    </div>`,
  },
  "outline-gradient": {
    background: "#282828",
    code: `<div wb-component="outline-gradient" wb-colors="#ffffff 0%, #6b6b6b 50%, #ffffff 100%" wb-border-width="4"
      class="relative w-[39.344cqw] h-[57.228cqw] rounded-[3.577cqw]"></div>`,
    // The effect paints its own border; at rest, a plain white one stands in for it.
    poster: `<div class="w-[39.344cqw] h-[57.228cqw] rounded-[3.577cqw] border-[0.894cqw] border-white"></div>`,
  },
  "image-trail": {
    background: "#d2d2d2",
    fill: true,
    code: `<div wb-component="image-trail" ${TRAIL_IMAGES.map((src, i) => `wb-image-${i + 1}="${src}"`).join(" ")}
      wb-image-width="15cqw" wb-image-height="19cqw" class="pointer-events-auto relative w-full h-full flex items-center justify-center">
      <h2 class="font-anton uppercase text-[#282828] text-[length:8.942cqw] leading-[1.5] whitespace-nowrap pointer-events-none">Image trail on hover</h2>
    </div>`,
    // At rest, the trail is drawn where the design shows it.
    poster: `<div class="relative w-full h-full flex items-center justify-center">
      <h2 class="font-anton uppercase text-[#282828] text-[length:8.942cqw] leading-[1.5] whitespace-nowrap">Image trail on hover</h2>
      ${TRAIL_POSTER.map(([left, top], i) => `<img src="${TRAIL_IMAGES[i]}" alt="" class="absolute w-[14.978cqw] h-[19.002cqw] object-cover" style="left:${left}cqw;top:${top}cqw">`).join("")}
    </div>`,
  },
  "hover-zoom": {
    background: "#11385e",
    fill: true,
    code: `<div class="w-full h-full p-[2.906cqw]">
      <img wb-component="hover-zoom" src="/images/cards/milky-way.webp" alt="" class="pointer-events-auto w-full h-full object-cover">
    </div>`,
  },

  // The rest, in the same language as the Figma set: one bold colour per card, Anton / Inter /
  // DM Mono, sizes in cqw against the 447px card.
  "shiny-text": {
    background: "#161616",
    code: `<h2 wb-component="shiny-text" wb-text-color="#5c5c5c" wb-shine-color="#ffffff" wb-speed="2.5"
      class="font-inter font-semibold text-[length:14.307cqw] leading-[1.1] tracking-[-0.716cqw]">Shiny Text</h2>`,
    poster: `<h2 class="font-inter font-semibold text-[#8a8a8a] text-[length:14.307cqw] leading-[1.1] tracking-[-0.716cqw]">Shiny Text</h2>`,
  },
  "text-pressure": {
    background: "#e4ff3d",
    code: `<h2 wb-component="text-pressure" wb-text="PRESSURE" wb-font-family="Roboto Flex" wb-text-color="#111111"
      class="pointer-events-auto w-[86cqw] text-[#111111] text-[length:22cqw] leading-none">PRESSURE</h2>`,
    poster: `<h2 class="font-anton text-[#111111] text-[length:22cqw] leading-none tracking-[-0.4cqw]">PRESSURE</h2>`,
  },
  "tooltip-text": {
    background: "#f1ebe0",
    code: `<p class="max-w-[76cqw] font-inter font-semibold text-[#1d1d1d] text-[length:6.706cqw] leading-[8.5cqw] tracking-[-0.2cqw]">
      Hover the <span wb-component="tooltip-text" wb-tooltip-text="Hi, I'm a tooltip" wb-tooltip-background="#1d1d1d"
      class="pointer-events-auto underline decoration-[0.6cqw] underline-offset-[1.6cqw] decoration-[#ff5a36]">underlined</span> word to learn more</p>`,
    // At rest the bubble is already up, so the card shows what the effect does.
    poster: `<p class="max-w-[76cqw] font-inter font-semibold text-[#1d1d1d] text-[length:6.706cqw] leading-[8.5cqw] tracking-[-0.2cqw]">
      Hover the <span class="relative underline decoration-[0.6cqw] underline-offset-[1.6cqw] decoration-[#ff5a36]">underlined<span
      class="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+2.5cqw)] whitespace-nowrap rounded-[1.5cqw] bg-[#1d1d1d] px-[3cqw] py-[1.5cqw] text-white no-underline text-[length:3.2cqw] leading-[4.5cqw] tracking-normal">Hi, I'm a tooltip</span></span> word to learn more</p>`,
  },
  "gradient-button": {
    background: "#120f1a",
    code: `<span wb-component="gradient-button" wb-colors="#ff8a3d, #ff3d8b, #8b5cff, #ff3d8b, #ff8a3d" class="${BUTTON} rounded-full">Gradient Button</span>`,
    poster: `<span class="${BUTTON} rounded-full text-white bg-[linear-gradient(90deg,#ff8a3d,#ff3d8b_50%,#8b5cff)]">Gradient Button</span>`,
  },
  "ripple-button": {
    background: "#0b64ff",
    code: `<span wb-component="ripple-button" wb-ripple-color="rgba(11, 100, 255, 0.35)" class="${BUTTON} rounded-[2cqw] bg-white text-[#0b64ff]">Click for Ripple</span>`,
  },
  "pulse-button": {
    background: "#ff5a36",
    // A real <button>: the library only pulses <button> and <a> elements.
    code: `<button type="button" wb-component="pulse-button" wb-hover-pause="false" wb-intensity="1.1" wb-speed="1.4s" class="${BUTTON} rounded-full bg-white text-[#ff5a36]">Pulse Button</button>`,
  },
  "shimmer-button": {
    background: "#1f1838",
    code: `<span wb-component="shimmer-button" wb-shimmer-color="rgba(255, 255, 255, 0.45)" class="${BUTTON} rounded-[2cqw] bg-[#6d4aff] text-white">Shimmer Button</span>`,
  },
  "smart-animate": {
    background: "#1d1d1d",
    // Each direct child animates in, one after another: four labels stacking up.
    code: `<div wb-component="smart-animate" class="flex flex-col items-center gap-[1.4cqw] font-anton uppercase text-[length:9.5cqw] leading-[1.2]">
      <span class="px-[3cqw] bg-[#e4ff3d] text-[#111111]">Every element</span>
      <span class="px-[3cqw] bg-[#ff5a36] text-white">arrives</span>
      <span class="px-[3cqw] bg-[#6d4aff] text-white">in its</span>
      <span class="px-[3cqw] bg-white text-[#111111]">own time</span>
    </div>`,
  },
  "matrix-rain": {
    background: "#020a05",
    fill: true,
    code: `<section wb-component="matrix-rain" wb-background="#020a05" wb-text-color="#3dff8a" wb-font-size="14px"
      class="relative w-full h-full flex items-center justify-center">
      <h2 class="relative z-10 font-mono-dm font-medium uppercase text-[#d9ffe6] text-[length:6cqw] tracking-[0.6cqw] bg-[#020a05]/70 px-[3cqw] py-[1cqw]">Wake up, Neo</h2>
    </section>`,
  },
  "firefly-background": {
    background: "#0e1f17",
    fill: true,
    code: `<section wb-component="firefly-background" wb-color="#ffd84d" wb-count="45"
      class="relative w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_50%_120%,#24543c,#0e1f17_70%)]">
      <h2 class="relative z-10 font-anton uppercase text-white/90 text-[length:15cqw] leading-none">Late Summer</h2>
    </section>`,
  },
  "dot-grid": {
    background: "#0b64ff",
    fill: true,
    code: `<section wb-component="dot-grid" wb-dot-color="rgba(255,255,255,0.4)" wb-dot-size="2" wb-dot-spacing="22"
      class="relative w-full h-full flex items-center justify-center">
      <h2 class="relative z-10 font-inter font-semibold text-white text-[length:10cqw] leading-none tracking-[-0.5cqw]">Built on a grid</h2>
    </section>`,
  },
  "star-field": {
    background: "#05060f",
    fill: true,
    code: `<section wb-component="star-field" wb-star-color="#fff3c4" wb-background="#05060f"
      class="pointer-events-auto relative w-full h-full flex items-center justify-center">
      <h2 class="relative z-10 pointer-events-none font-anton uppercase text-white text-[length:16cqw] leading-none tracking-[0.4cqw]">Hyperspace</h2>
    </section>`,
  },
  "particles-network": {
    background: "#0d1b2a",
    fill: true,
    code: `<section wb-component="particles-network" wb-background="#0d1b2a" wb-particle-color="#ffffff" wb-connection-color="#4fc3f7" wb-count="70"
      class="pointer-events-auto relative w-full h-full flex items-center justify-center">
      <h2 class="relative z-10 pointer-events-none font-inter font-semibold text-white text-[length:8.5cqw] leading-none tracking-[-0.35cqw]">Everything connects</h2>
    </section>`,
  },
  "flow-field": {
    background: "#f4efe9",
    fill: true,
    code: `<section wb-component="flow-field" wb-palette="fire" wb-background="transparent" wb-count="260"
      class="relative w-full h-full flex items-center justify-center">
      <h2 class="relative z-10 font-anton uppercase text-[#1d1d1d] text-[length:24cqw] leading-none">Flow</h2>
    </section>`,
  },
};

// Effects shown in the gallery, in display order (insertion order of cardThemes).
export const FEATURED_EFFECTS = Object.keys(cardThemes);
