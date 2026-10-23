import { useLayoutEffect } from "react";
import gsap, { EASE_OUT, prefersReducedMotion } from "../../motion/gsap";

// Staggered rise-in for a container's children, replayed whenever `trigger` changes.
// Only opacity + transform are animated, so the browser can run it on the compositor
// (no repaint, no re-raster of the live previews), and nothing is remounted.
export const useStaggerIn = (containerRef, trigger, { step = 60, duration = 550 } = {}) => {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) return;

    const tween = gsap.fromTo(
      container.children,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: duration / 1000,
        stagger: step / 1000,
        ease: EASE_OUT,
        force3D: true,
        clearProps: "opacity,visibility,transform",
      },
    );
    return () => tween.revert();
  }, [containerRef, trigger, step, duration]);
};
