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

// `code` is the live preview (runs the effect, mounted only while the card is hovered).
// `poster` is static markup of the effect's settled look shown at rest; when omitted, the card
// uses `code` with every wb-* attribute stripped.
export const cardThemes = {
  "split-text": {
    background: "#1d2fd0",
    image: "/images/cards/wave-gradient.webp",
    code: `<h2 wb-component="split-text" wb-split-type="words" wb-trigger-on-view="false"
      class="font-inter font-semibold text-white text-[length:6.259cqw] leading-[8.271cqw] tracking-[-0.263cqw] max-w-[89.419cqw]">
      Create Amazing Websites with Powerful Animations</h2>`,
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
};

// Effects shown in the gallery, in display order (insertion order of cardThemes).
export const FEATURED_EFFECTS = Object.keys(cardThemes);
