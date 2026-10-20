import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cardThemes } from "./cardThemes";
import { useWebflowBits } from "../../hooks/useWebflowBits";

// Static fallback: the example markup with every wb-* attribute removed, so nothing initialises.
const stripEffects = (code) => code.replace(/\s+wb-[\w-]+="[^"]*"/g, "");

// Live previews must play immediately, not wait for scroll-into-view.
const disableViewTrigger = (code) =>
  code.includes("wb-trigger-on-view")
    ? code.replace(/wb-trigger-on-view="[^"]*"/g, 'wb-trigger-on-view="false"')
    : code.replace(/wb-component="([^"]*)"/, 'wb-component="$1" wb-trigger-on-view="false"');

// Each card shows a static poster at rest and mounts the live effect only while hovered,
// so at most one FlowBitz effect runs in the gallery at a time.
const EffectCard = ({ id, name, category, exampleCode }) => {
  const theme = cardThemes[id];
  const liveCode = theme?.code || exampleCode || "";
  const live = useMemo(() => disableViewTrigger(liveCode), [liveCode]);
  const poster = useMemo(() => theme?.poster ?? stripEffects(liveCode), [theme, liveCode]);
  const fillCard = theme?.fill || category === "background";

  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const { reinitializeComponents } = useWebflowBits();

  // After the live markup mounts, let FlowBitz initialise it. Hover-driven effects listen for
  // pointerenter on the card, which already happened before they existed, so replay it for them.
  useEffect(() => {
    if (!hovered) return;
    const timer = setTimeout(() => {
      reinitializeComponents();
      if (theme?.hoverDriven) cardRef.current?.dispatchEvent(new PointerEvent("pointerenter"));
    }, 30);
    return () => clearTimeout(timer);
  }, [hovered, reinitializeComponents, theme]);

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
          theme
            ? ""
            : "scale-75 [&_*]:font-medium [&_.lg\\:text-6xl]:!text-4xl [&_.text-3xl]:!text-2xl"
        }`}
        dangerouslySetInnerHTML={{ __html: hovered ? live : poster }}
      />
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
