import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cardThemes } from "./cardThemes";
import { useWebflowBits } from "../../hooks/useWebflowBits";
import previewVideos from "../../content/previewVideos.json";

// Static fallback: the example markup with every wb-* attribute removed, so nothing initialises.
const stripEffects = (code) => code.replace(/\s+wb-[\w-]+="[^"]*"/g, "");

// Live previews must play immediately, not wait for scroll-into-view.
const disableViewTrigger = (code) =>
  code.includes("wb-trigger-on-view")
    ? code.replace(/wb-trigger-on-view="[^"]*"/g, 'wb-trigger-on-view="false"')
    : code.replace(/wb-component="([^"]*)"/, 'wb-component="$1" wb-trigger-on-view="false"');

// ?live-previews (used by scripts/record-previews.mjs) forces the live effect, so a re-recording
// never films an older video.
const forceLive = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("live-previews");

// Touch screens have no hover, so one shared observer plays the card video nearest the middle of
// the screen (if at least 60% of it shows) and pauses the rest. Deciding from all cards at once,
// not per card, keeps two half-visible cards from pausing each other.
const touchVideos = new Map(); // video -> latest intersection ratio
let touchObserver = null;

const playNearestToCentre = () => {
  const middle = window.innerHeight / 2;
  let best = null;
  let bestDistance = Infinity;
  touchVideos.forEach((ratio, video) => {
    if (ratio < 0.6) return;
    const { top, height } = video.getBoundingClientRect();
    const distance = Math.abs(top + height / 2 - middle);
    if (distance < bestDistance) [best, bestDistance] = [video, distance];
  });
  touchVideos.forEach((_, video) => {
    if (video === best) {
      if (video.paused) video.play().catch(() => {});
    } else if (!video.paused) {
      video.pause();
    }
  });
};

// Pick the card once scrolling settles, so cards flicked past never start (or download).
let settle;
const pickSoon = () => {
  clearTimeout(settle);
  settle = setTimeout(playNearestToCentre, 150);
};

const watchOnTouch = (video) => {
  if (!touchObserver) {
    touchObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          touchVideos.set(e.target, e.intersectionRatio);
          // A card leaving the screen stops at once; starting one waits for the scroll to settle.
          if (e.intersectionRatio < 0.6 && !e.target.paused) e.target.pause();
        });
        pickSoon();
      },
      { threshold: [0, 0.6, 1] },
    );
    // Thresholds only fire on crossings; which card is nearest the middle changes in between.
    // Capture catches scrolling in any container.
    document.addEventListener("scroll", pickSoon, { capture: true, passive: true });
  }
  touchVideos.set(video, 0);
  touchObserver.observe(video);
  return () => {
    touchObserver.unobserve(video);
    touchVideos.delete(video);
  };
};

// Recorded preview: poster image at rest, nothing downloaded until it plays.
const PreviewVideo = React.forwardRef(({ id }, ref) => (
  <video
    ref={ref}
    poster={`/previews/${id}.webp`}
    preload="none"
    muted
    loop
    playsInline
    aria-hidden="true"
    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
  >
    <source src={`/previews/${id}.webm`} type="video/webm" />
    <source src={`/previews/${id}.mp4`} type="video/mp4" />
  </video>
));

// Each card shows a static poster at rest. Effects with a recorded preview (scripts/record-previews.mjs)
// play that video; the rest mount the live effect only while hovered, so at most one FlowBitz
// effect runs in the gallery at a time.
const EffectCard = ({ id, name, category, exampleCode }) => {
  const theme = cardThemes[id];
  const liveCode = theme?.code || exampleCode || "";
  const live = useMemo(() => disableViewTrigger(liveCode), [liveCode]);
  const poster = useMemo(() => theme?.poster ?? stripEffects(liveCode), [theme, liveCode]);
  const fillCard = theme?.fill || category === "background";

  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const { reinitializeComponents } = useWebflowBits();
  const hasVideo = !forceLive && previewVideos.includes(id);

  // Desktop: the video plays while the card is hovered and returns to its poster on leave.
  const playedRef = useRef(false);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (hovered) {
      playedRef.current = true;
      video.play().catch(() => {});
    } else if (playedRef.current) {
      // load() rewinds and shows the poster again instead of a paused mid-clip frame. Only after
      // a play: on a fresh card it would start the download that preload="none" holds back.
      video.load();
    }
  }, [hovered]);

  // Touch screens: the shared observer above decides which card plays.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia("(hover: hover)").matches) return;
    return watchOnTouch(video);
  }, []);

  // After the live markup mounts, let FlowBitz initialise it. Hover-driven effects listen for
  // pointerenter on the card, which already happened before they existed, so replay it for them.
  useEffect(() => {
    if (!hovered || hasVideo) return;
    const timer = setTimeout(() => {
      reinitializeComponents();
      if (theme?.hoverDriven) cardRef.current?.dispatchEvent(new PointerEvent("pointerenter"));
    }, 30);
    return () => clearTimeout(timer);
  }, [hovered, hasVideo, reinitializeComponents, theme]);

  return (
    <Link
      ref={cardRef}
      id={`card-${id}`}
      to={`/components/${id}`}
      aria-label={name}
      className="group relative block aspect-[4/3] rounded-lg overflow-hidden text-black"
      // Size container: preview text uses cqw so it scales with the card.
      style={{ backgroundColor: theme?.background || "#ffffff", containerType: "inline-size" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hasVideo ? (
        <PreviewVideo ref={videoRef} id={id} />
      ) : (
        <>
          {theme?.image && (
            <img
              src={theme.image}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute max-w-none w-[227%] h-[170%] left-[-69%] top-[-3%] origin-top-left -rotate-[5.56deg] object-cover pointer-events-none"
            />
          )}
          <div
            // New key per state: the live markup is always a fresh node for FlowBitz to init.
            key={hovered ? "live" : "poster"}
            className={`relative w-full h-full flex items-center justify-center text-center pointer-events-none ${
              fillCard ? "" : "p-[5.37cqw]"
            } ${
              theme || fillCard
                ? ""
                : "scale-75 [&_*]:font-medium [&_.lg\\:text-6xl]:!text-4xl [&_.text-3xl]:!text-2xl"
            }`}
            dangerouslySetInnerHTML={{ __html: hovered ? live : poster }}
          />
        </>
      )}
      {/* Hover chrome (pen.dev "Link" hover state): name pill slides up from below, open arrow drops in from above;
          both rest just outside the card and are hidden by its overflow clip. */}
      <span className="absolute left-2 bottom-2 h-[22px] px-[9px] flex items-center rounded-[18px] bg-black text-white text-xs leading-3 font-medium tracking-[-0.01em] whitespace-nowrap translate-y-[calc(100%+8px)] transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0">
        {name}
      </span>
      <span
        aria-hidden="true"
        className="absolute right-2 top-2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center -translate-y-[calc(100%+8px)] transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0"
      >
        <svg width="12.33" height="12.33" viewBox="0 0 12.33 12.33" fill="currentColor">
          <path d="M12.33017 8.08753l-0.02209 0.99437-1.98874 0c0-0.04419 0-1.94454 0-5.65685l-8.90513 8.90512-1.41421-1.41421 8.90513-8.90513c-3.71231 0-5.61266 0-5.65686 0l0-1.98873 0.99437-0.0221 8.08753 0 0 8.08753z" />
        </svg>
      </span>
    </Link>
  );
};

export default EffectCard;
