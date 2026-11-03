import React, { useRef, useState } from "react";
import gsap from "gsap";

// The sidebar's 3x3 pixel mark hides one easter egg per page load (see pickEgg):
//   glider     — click: one pixel hops, the mark becomes a Game of Life glider and flies off-screen
//   rain       — click: the pixels fall to the bottom of the viewport, bounce, and fly home
//   screensaver— click: the mark drifts around the viewport bouncing off the edges
//   firework   — click: every pixel bursts into falling sparks, then the mark pops back
//   tagalong   — click: the pixels chase the cursor as a chain, then fly home
const PATTERN = [1, 0, 1, 0, 1, 1, 0, 0, 1];
const CELL = 10;
// Pixels are white and blend with `exclusion`: black on light surfaces, inverted over dark ones.
const INK = "#fff";
const BLEND = "exclusion";
const EGGS = ["glider", "rain", "screensaver", "firework", "tagalong"];
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
  await gsap.to(canvas, { opacity: 0, duration: 0.3 });
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
      gsap.fromTo(
        p.el,
        { x: p.x, y: p.y, rotation: p.rot },
        { x: p.home.x, y: p.home.y, rotation: 0, duration: 0.7, delay: k * 0.07, ease: "power2.inOut" },
      ),
    ),
  );
  layer.remove();
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
  await gsap.fromTo(sprite, { x, y }, { x: home.left, y: home.top, duration: 0.8, ease: "power2.inOut" });
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
      gsap.fromTo(
        p.el,
        { x: p.x, y: p.y },
        { x: p.home.x, y: p.home.y, duration: 0.65, delay: k * 0.06, ease: "power2.inOut" },
      ),
    ),
  );
  layer.remove();
}

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
      gsap.fromTo(mark, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)", clearProps: "opacity,transform" });
      busy.current = false;
    }
  };

  const PLAYS = {
    glider: playGlider,
    rain: playRain,
    screensaver: playScreensaver,
    firework: playFirework,
    tagalong: playTagAlong,
  };
  const onClick = () => PLAYS[egg] && run(PLAYS[egg]);

  return (
    <div
      ref={markRef}
      aria-hidden="true"
      data-egg={egg || undefined}
      onClick={onClick}
      className={`grid grid-cols-3 select-none ${egg ? "cursor-pointer" : ""} ${className}`}
      style={{ width: CELL * 3, height: CELL * 3, mixBlendMode: BLEND }}
    >
      {PATTERN.map((on, i) => (
        <span
          key={i}
          ref={(el) => (cellsRef.current[i] = el)}
          style={{ background: on ? INK : "transparent" }}
        />
      ))}
    </div>
  );
};

export default EasterEggMark;
