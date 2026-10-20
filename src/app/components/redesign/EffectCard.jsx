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
      <span className="absolute left-4 bottom-3 text-[13px] leading-6 bg-white/90 text-black px-2 rounded-sm opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100">
        {name}
      </span>
    </Link>
  );
};

export default EffectCard;
