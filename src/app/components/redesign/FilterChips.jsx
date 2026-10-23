import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const EASE = "cubic-bezier(0.65,0,0.35,1)";
const SLIDE_MS = 500;
const LABEL_LIGHT_MS = 260; // label turns white as the block arrives, not before

// "Slide" filter chips: one shared black block glides to the active chip and stretches to its
// width, rounding into a pill while moving and squaring up (2px) when it lands.
const FilterChips = ({ filters, active, onChange, label }) => {
  const chipRefs = useRef({});
  const mounted = useRef(false); // first placement jumps; later changes slide
  const [block, setBlock] = useState(null); // { x, y, w, animate }
  const [moving, setMoving] = useState(false);
  const [lit, setLit] = useState(active);

  // Measure after render: the active chip already has its final (500) weight, so the width fits.
  useLayoutEffect(() => {
    const measure = (animate) => {
      const chip = chipRefs.current[active];
      if (!chip) return;
      setBlock({ x: chip.offsetLeft, y: chip.offsetTop, w: chip.offsetWidth, animate });
    };
    measure(mounted.current);

    const onResize = () => measure(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    mounted.current = true;
    if (lit === active) return; // nothing to travel (first mount, StrictMode re-run)
    setMoving(true);
    setLit(null);
    const light = setTimeout(() => setLit(active), LABEL_LIGHT_MS);
    const land = setTimeout(() => setMoving(false), SLIDE_MS - 200);
    return () => {
      clearTimeout(light);
      clearTimeout(land);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div role="tablist" aria-label={label} className="relative flex flex-wrap gap-1.5">
      {block && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 h-7 bg-black pointer-events-none z-[1]"
          style={{
            width: block.w,
            transform: `translate(${block.x}px, ${block.y}px)`,
            borderRadius: moving ? 26 : 2,
            transition: block.animate
              ? `transform ${SLIDE_MS}ms ${EASE}, width ${SLIDE_MS}ms ${EASE}, border-radius 250ms ease`
              : "none",
          }}
        />
      )}
      {filters.map((filter) => {
        const isActive = filter.id === active;
        const isLit = filter.id === lit;
        return (
          <button
            key={filter.id}
            ref={(el) => (chipRefs.current[filter.id] = el)}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter.id)}
            className={`relative bg-white rounded-[26px] px-3 text-[15px] leading-7 transition-colors duration-[250ms] ${
              isActive ? "font-medium" : ""
            } ${isLit ? "text-white" : "text-black/50 hover:text-black"}`}
          >
            <span className="relative z-[2]">{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default FilterChips;
