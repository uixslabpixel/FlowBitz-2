import React, { useEffect, useRef, useState } from "react";

// The sidebar's 3x3 pixel mark hides one easter egg per page load (see pickEgg):
//   glider     — click: one pixel hops, the mark becomes a Game of Life glider and flies off-screen
//   rain       — click: the pixels fall to the bottom of the viewport, bounce, and fly home
//   snake      — click: the pixels race one lap around the sidebar's edge
//   tetris     — click: the mark drops row by row to the sidebar floor and clears a line
//   screensaver— click: the mark drifts around the viewport bouncing off the edges
//   firework   — click: every pixel bursts into falling sparks, then the mark pops back
//   dice       — click: the grid tumbles through die faces and lands on a random number
//   tagalong   — click: the pixels chase the cursor as a chain, then fly home
//   shy        — hover near: the pixels scatter away from the cursor and spring back
const PATTERN = [1, 0, 1, 0, 1, 1, 0, 0, 1];
const CELL = 10;
// Pixels are white and blend with `exclusion`: black on light surfaces, inverted over dark ones.
const INK = "#fff";
const BLEND = "exclusion";
const EGGS = ["glider", "rain", "snake", "tetris", "screensaver", "firework", "dice", "tagalong", "shy"];
const BAG_KEY = "flowbitz:egg-bag";

// Shuffle bag: each egg shows up once per cycle of refreshes, in random order. The queue lives
// in localStorage; when it runs out it's reshuffled (never starting with the egg just shown).
const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

let pickedThisLoad; // one draw per page load (StrictMode runs state initialisers twice)

const pickEgg = () => {
  if (pickedThisLoad) return pickedThisLoad;
  pickedThisLoad = drawFromBag();
  return pickedThisLoad;
};

const drawFromBag = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(BAG_KEY) || "{}");
    let queue = Array.isArray(saved.queue) ? saved.queue.filter((e) => EGGS.includes(e)) : [];
    if (!queue.length) {
      queue = shuffle(EGGS);
      if (queue[0] === saved.last && queue.length > 1) queue.push(queue.shift());
    }
    const egg = queue.shift();
    localStorage.setItem(BAG_KEY, JSON.stringify({ queue, last: egg }));
    return egg;
  } catch {
    return EGGS[Math.floor(Math.random() * EGGS.length)]; // storage blocked: plain random
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Full-viewport layer for pixels that leave the sidebar (it clips its own overflow).
const createLayer = () => {
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = `position:fixed;inset:0;z-index:9999;pointer-events:none;mix-blend-mode:${BLEND};`;
  document.body.appendChild(layer);
  return layer;
};

const createPixel = (layer) => {
  const el = document.createElement("div");
  el.style.cssText = `position:absolute;left:0;top:0;width:${CELL}px;height:${CELL}px;background:${INK};`;
  layer.appendChild(el);
  return el;
};

const createSprite = (layer) => {
  const el = document.createElement("div");
  el.style.cssText = `position:absolute;left:0;top:0;width:${CELL * 3}px;height:${CELL * 3}px;display:grid;grid-template-columns:repeat(3,${CELL}px);`;
  el.innerHTML = PATTERN.map((on) => `<span style="background:${on ? INK : "transparent"}"></span>`).join("");
  layer.appendChild(el);
  return el;
};

const nextFrame = () => new Promise(requestAnimationFrame);
const moveTo = (el, x, y, extra = "") => (el.style.transform = `translate(${x}px, ${y}px) ${extra}`);

const filledRects = (cells) =>
  cells.flatMap((c, i) => (PATTERN[i] ? [c.getBoundingClientRect()] : []));

// --- glider -----------------------------------------------------------------------------
async function playGlider(mark, cells) {
  // X.X / .XX / ..X  →  X.X / .XX / .X.  (a real glider, travelling down-right)
  cells[8].style.background = "transparent";
  cells[7].style.background = INK;
  await sleep(300);

  const origin = mark.getBoundingClientRect();
  const W = window.innerWidth, H = window.innerHeight, dpr = window.devicePixelRatio || 1;
  const layer = createLayer();
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.cssText = `width:${W}px;height:${H}px;`;
  layer.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.fillStyle = INK;
  mark.style.visibility = "hidden";

  let live = new Set(["0,0", "2,0", "1,1", "2,1", "1,2"]);
  const parse = (k) => k.split(",").map(Number);
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    live.forEach((k) => {
      const [x, y] = parse(k);
      ctx.fillRect(origin.left + x * CELL, origin.top + y * CELL, CELL, CELL);
    });
  };
  const step = () => {
    const counts = new Map();
    live.forEach((k) => {
      const [x, y] = parse(k);
      for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++)
          if (dx || dy) counts.set(`${x + dx},${y + dy}`, (counts.get(`${x + dx},${y + dy}`) || 0) + 1);
    });
    live = new Set([...counts].filter(([k, n]) => n === 3 || (n === 2 && live.has(k))).map(([k]) => k));
  };
  const offScreen = () =>
    [...live].every((k) => {
      const [x, y] = parse(k);
      return origin.left + x * CELL > W || origin.top + y * CELL > H;
    });

  const started = performance.now();
  draw();
  while (!offScreen() && performance.now() - started < 7000) {
    await sleep(40);
    step();
    draw();
  }
  await canvas.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }).finished;
  layer.remove();
}

// --- rain -------------------------------------------------------------------------------
async function playRain(mark, cells) {
  const layer = createLayer();
  const floor = window.innerHeight - CELL;
  const pixels = filledRects(cells).map((r) => ({
    el: createPixel(layer),
    home: { x: r.left, y: r.top },
    x: r.left,
    y: r.top,
    vx: (Math.random() - 0.5) * 4,
    vy: -2 - Math.random() * 3,
    rot: 0,
    vr: (Math.random() - 0.5) * 24,
  }));
  mark.style.visibility = "hidden";

  const t0 = performance.now();
  await new Promise((done) => {
    const tick = (t) => {
      pixels.forEach((p) => {
        p.vy += 0.6;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > floor) {
          p.y = floor;
          p.vy *= -0.4;
          p.vx *= 0.8;
          p.vr *= 0.6;
        }
        p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`;
      });
      t - t0 < 2400 ? requestAnimationFrame(tick) : done();
    };
    requestAnimationFrame(tick);
  });

  await Promise.all(
    pixels.map((p, k) =>
      p.el.animate(
        [
          { transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)` },
          { transform: `translate(${p.home.x}px, ${p.home.y}px) rotate(0deg)` },
        ],
        { duration: 700, delay: k * 70, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" },
      ).finished,
    ),
  );
  layer.remove();
}

// --- snake ------------------------------------------------------------------------------
async function playSnake(mark) {
  const aside = mark.closest("aside");
  if (!aside) return;
  const r = aside.getBoundingClientRect();
  const cols = Math.floor(r.width / CELL), rows = Math.floor(r.height / CELL);
  const path = [];
  for (let y = 0; y < rows; y++) path.push([cols - 1, y]); // right edge, down
  for (let x = cols - 2; x >= 0; x--) path.push([x, rows - 1]); // bottom, left
  for (let y = rows - 2; y >= 0; y--) path.push([0, y]); // left edge, up
  for (let x = 1; x < cols - 1; x++) path.push([x, 0]); // top, right

  const layer = createLayer();
  const segments = Array.from({ length: 5 }, () => createPixel(layer));
  mark.style.visibility = "hidden";
  const stepMs = Math.max(8, 2600 / path.length);

  for (let head = 0; head < path.length + segments.length; head++) {
    segments.forEach((el, k) => {
      const idx = head - k;
      const on = idx >= 0 && idx < path.length;
      el.style.opacity = on ? 1 : 0;
      if (on) el.style.transform = `translate(${r.left + path[idx][0] * CELL}px, ${r.top + path[idx][1] * CELL}px)`;
    });
    await sleep(stepMs);
  }
  layer.remove();
}

// --- tetris -----------------------------------------------------------------------------
async function playTetris(mark) {
  const aside = mark.closest("aside");
  if (!aside) return;
  const side = aside.getBoundingClientRect();
  const start = mark.getBoundingClientRect();
  const floorY = Math.min(side.bottom, window.innerHeight) - CELL;
  const landY = floorY - 2 * CELL;

  const layer = createLayer();
  const piece = createSprite(layer);
  mark.style.visibility = "hidden";
  let y = start.top, delay = 80;
  moveTo(piece, start.left, y);
  while (y < landY) {
    await sleep(delay);
    delay = Math.max(14, delay * 0.9);
    y = Math.min(landY, y + CELL);
    moveTo(piece, start.left, y);
  }

  const bar = document.createElement("div");
  bar.style.cssText = `position:absolute;left:${side.left}px;top:${floorY}px;height:${CELL}px;width:0;background:${INK};`;
  layer.appendChild(bar);
  await bar.animate([{ width: "0px" }, { width: `${side.width}px` }], { duration: 220, easing: "ease-out", fill: "forwards" }).finished;
  await bar.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 480, fill: "forwards" }).finished;
  layer.remove();
  await sleep(150);
}

// --- screensaver ------------------------------------------------------------------------
async function playScreensaver(mark) {
  const home = mark.getBoundingClientRect();
  const W = window.innerWidth - CELL * 3, H = window.innerHeight - CELL * 3;
  const layer = createLayer();
  const sprite = createSprite(layer);
  mark.style.visibility = "hidden";
  let x = home.left, y = home.top, vx = -9, vy = 7, bounces = 0;
  while (bounces < 6) {
    await nextFrame();
    x += vx;
    y += vy;
    if (x <= 0 || x >= W) { vx *= -1; x = Math.max(0, Math.min(W, x)); bounces++; }
    if (y <= 0 || y >= H) { vy *= -1; y = Math.max(0, Math.min(H, y)); bounces++; }
    moveTo(sprite, x, y);
  }
  await sprite.animate(
    [{ transform: `translate(${x}px, ${y}px)` }, { transform: `translate(${home.left}px, ${home.top}px)` }],
    { duration: 800, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" },
  ).finished;
  layer.remove();
}

// --- firework ---------------------------------------------------------------------------
async function playFirework(mark, cells) {
  const layer = createLayer();
  const sparks = [];
  filledRects(cells).forEach((r) => {
    for (let k = 0; k < 8; k++) {
      const el = createPixel(layer);
      el.style.width = el.style.height = "4px";
      const a = Math.random() * Math.PI * 2, speed = 3 + Math.random() * 6;
      sparks.push({ el, x: r.left + 3, y: r.top + 3, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 2.5, life: 1 });
    }
  });
  mark.style.visibility = "hidden";
  const t0 = performance.now();
  while (performance.now() - t0 < 1400) {
    await nextFrame();
    sparks.forEach((p) => {
      p.vy += 0.2;
      p.vx *= 0.98;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.012;
      moveTo(p.el, p.x, p.y);
      p.el.style.opacity = Math.max(0, p.life);
    });
  }
  layer.remove();
  await sleep(200);
}

// --- dice -------------------------------------------------------------------------------
async function playDice(mark, cells) {
  const FACES = [[4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];
  const show = (on) => cells.forEach((c, i) => (c.style.background = on.includes(i) ? INK : "transparent"));
  const result = FACES[Math.floor(Math.random() * FACES.length)];
  let delay = 45, rot = 0;
  for (let n = 0; n < 12; n++) {
    show(n === 11 ? result : FACES[Math.floor(Math.random() * FACES.length)]);
    rot += 90;
    mark.animate([{ transform: `rotate(${rot - 90}deg)` }, { transform: `rotate(${rot}deg)` }], { duration: delay, fill: "forwards" });
    await sleep(delay);
    delay *= 1.22;
  }
  await mark.animate([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 260 }).finished;
  await sleep(1300);
}

// --- tag along --------------------------------------------------------------------------
async function playTagAlong(mark, cells) {
  const start = mark.getBoundingClientRect();
  let target = { x: start.left + 10, y: start.top + 10 };
  const onMove = (e) => (target = { x: e.clientX - CELL / 2, y: e.clientY - CELL / 2 });
  window.addEventListener("mousemove", onMove, { passive: true });

  const layer = createLayer();
  const chain = filledRects(cells).map((r) => ({ el: createPixel(layer), x: r.left, y: r.top, home: { x: r.left, y: r.top } }));
  mark.style.visibility = "hidden";
  const t0 = performance.now();
  while (performance.now() - t0 < 4500) {
    await nextFrame();
    chain.forEach((p, k) => {
      const lead = k === 0 ? target : { x: chain[k - 1].x - 12, y: chain[k - 1].y };
      p.x += (lead.x - p.x) * 0.18;
      p.y += (lead.y - p.y) * 0.18;
      moveTo(p.el, p.x, p.y);
    });
  }
  window.removeEventListener("mousemove", onMove);
  await Promise.all(
    chain.map((p, k) =>
      p.el.animate(
        [{ transform: `translate(${p.x}px, ${p.y}px)` }, { transform: `translate(${p.home.x}px, ${p.home.y}px)` }],
        { duration: 650, delay: k * 60, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" },
      ).finished,
    ),
  );
  layer.remove();
}

// --- shy (continuous, hover-driven) ------------------------------------------------------
const useShyPixels = (enabled, cellsRef) => {
  useEffect(() => {
    if (!enabled) return;
    const R = 90, PUSH = 28;
    let frame = 0, displaced = false;

    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const cells = cellsRef.current;
        let any = false;
        cells.forEach((c, i) => {
          if (!PATTERN[i]) return;
          const b = c.getBoundingClientRect();
          // Measure from the cell's resting spot, not its pushed position.
          const cx = b.left + CELL / 2 - (c._dx || 0), cy = b.top + CELL / 2 - (c._dy || 0);
          const dx = cx - e.clientX, dy = cy - e.clientY, d = Math.hypot(dx, dy) || 1;
          const f = d < R ? (1 - d / R) * PUSH : 0;
          c._dx = (dx / d) * f;
          c._dy = (dy / d) * f;
          if (f) any = true;
          c.style.transform = f ? `translate(${c._dx}px, ${c._dy}px)` : "";
        });
        displaced = any;
      });
    };
    const onLeave = () => {
      if (!displaced) return;
      cellsRef.current.forEach((c) => {
        c._dx = c._dy = 0;
        c.style.transform = "";
      });
      displaced = false;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled, cellsRef]);
};

const EasterEggMark = ({ className = "" }) => {
  // Drawn once per page load from the shuffle bag; SideNav persists across routes.
  const [egg] = useState(() => {
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return reduced ? null : pickEgg();
  });
  const markRef = useRef(null);
  const cellsRef = useRef([]);
  const busy = useRef(false);

  useShyPixels(egg === "shy", cellsRef);

  const run = async (play) => {
    if (busy.current) return;
    busy.current = true;
    const mark = markRef.current;
    try {
      await play(mark, cellsRef.current);
    } finally {
      // Restore the resting mark, then pop it back in.
      cellsRef.current.forEach((c, i) => (c.style.background = PATTERN[i] ? INK : "transparent"));
      mark.style.visibility = "";
      mark.animate([{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "scale(1)" }], {
        duration: 300,
        easing: "cubic-bezier(.34,1.56,.64,1)",
      });
      busy.current = false;
    }
  };

  const PLAYS = {
    glider: playGlider,
    rain: playRain,
    snake: playSnake,
    tetris: playTetris,
    screensaver: playScreensaver,
    firework: playFirework,
    dice: playDice,
    tagalong: playTagAlong,
  };
  const onClick = () => PLAYS[egg] && run(PLAYS[egg]);

  return (
    <div
      ref={markRef}
      aria-hidden="true"
      data-egg={egg || undefined}
      onClick={onClick}
      className={`grid grid-cols-3 select-none ${egg && egg !== "shy" ? "cursor-pointer" : ""} ${className}`}
      style={{ width: CELL * 3, height: CELL * 3, mixBlendMode: BLEND }}
    >
      {PATTERN.map((on, i) => (
        <span
          key={i}
          ref={(el) => (cellsRef.current[i] = el)}
          style={{
            background: on ? INK : "transparent",
            transition: egg === "shy" ? "transform .25s cubic-bezier(.34,1.56,.64,1)" : undefined,
          }}
        />
      ))}
    </div>
  );
};

export default EasterEggMark;
