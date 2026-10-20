import { useLayoutEffect } from "react";

const KEYFRAMES = [
  { opacity: 0, transform: "translate3d(0, 24px, 0)" },
  { opacity: 1, transform: "translate3d(0, 0, 0)" },
];

// Staggered rise-in for a container's children, replayed whenever `trigger` changes.
// Only opacity + transform are animated, so the browser can run it on the compositor
// (no repaint, no re-raster of the live previews), and nothing is remounted.
export const useStaggerIn = (containerRef, trigger, { step = 60, duration = 550 } = {}) => {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !container.animate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animations = [...container.children].map((el, i) =>
      el.animate(KEYFRAMES, {
        duration,
        delay: i * step,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "backwards", // hold the hidden first frame during the delay
      }),
    );
    return () => animations.forEach((a) => a.cancel());
  }, [containerRef, trigger, step, duration]);
};
