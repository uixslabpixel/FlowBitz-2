import { useLayoutEffect } from "react";
import gsap from "gsap";

// Site-wide GSAP motion helpers. Every helper bails out under prefers-reduced-motion and
// kills its tweens on cleanup, so React re-renders never stack animations.
export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const EASE_OUT = "expo.out"; // close to the old cubic-bezier(0.22, 1, 0.36, 1)

// Bug on the sidebar's Report Bug button: spin a thread, climb out the top, a new bug crawls in.
// One 1s timeline, paused until hover; mouseleave snaps it back for the next hover.
export const useBugHover = (ref) => {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const q = gsap.utils.selector(root);
    const tl = gsap
      .timeline({ paused: true })
      .fromTo(q(".bug-silk"), { scaleY: 0 }, { scaleY: 1, duration: 0.28, ease: "power3.out" }, 0)
      .to(q(".bug-climb"), { y: 1.5, duration: 0.06, ease: "power1.out" }, 0.28)
      .to(q(".bug-climb"), { y: -36, duration: 0.36, ease: "power2.inOut" }, 0.34)
      .fromTo(q(".bug-arrive"), { y: 30 }, { y: -1.5, duration: 0.3, ease: "power3.out" }, 0.58)
      .to(q(".bug-arrive"), { y: 0, duration: 0.12, ease: "power1.out" }, 0.88);

    const play = () => tl.restart();
    const reset = () => tl.pause(0);
    root.addEventListener("mouseenter", play);
    root.addEventListener("mouseleave", reset);
    return () => {
      root.removeEventListener("mouseenter", play);
      root.removeEventListener("mouseleave", reset);
      tl.kill();
    };
  }, [ref]);
};

// Press squishes the target flat and wide; release springs it back with a little overshoot.
// `trigger` receives the pointer events (defaults to the target itself).
export const useSquish = (targetRef, triggerRef = targetRef) => {
  useLayoutEffect(() => {
    const target = targetRef.current;
    const trigger = triggerRef.current;
    if (!target || !trigger || prefersReducedMotion()) return;

    const press = () =>
      gsap.to(target, { scaleX: 1.03, scaleY: 0.88, duration: 0.09, ease: "power1.out", overwrite: true });
    const release = () =>
      gsap.to(target, { scaleX: 1, scaleY: 1, duration: 0.32, ease: "back.out(2.5)", overwrite: true });

    trigger.addEventListener("pointerdown", press);
    ["pointerup", "pointerleave", "pointercancel"].forEach((e) => trigger.addEventListener(e, release));
    return () => {
      trigger.removeEventListener("pointerdown", press);
      ["pointerup", "pointerleave", "pointercancel"].forEach((e) => trigger.removeEventListener(e, release));
      gsap.killTweensOf(target);
    };
  }, [targetRef, triggerRef]);
};

// Light sweep across a preview label, looping.
export const useShimmer = (ref) => {
  useLayoutEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const tween = gsap.fromTo(ref.current, { xPercent: -100 }, { xPercent: 100, duration: 2, ease: "none", repeat: -1 });
    return () => tween.kill();
  }, [ref]);
};

export default gsap;
