import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import gsap, { EASE_OUT, prefersReducedMotion } from "../../motion/gsap";
import { InstallationGuide } from "../../pages/Installation.jsx";

// Installation guide popup, opened from any page with `?install`. Like FeedbackModal, living in
// the URL keeps it shareable and lets the back button close it.
export const useInstallModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setOpen = (open) => {
    const next = new URLSearchParams(searchParams);
    open ? next.set("install", "") : next.delete("install");
    setSearchParams(next);
  };
  return { open: searchParams.has("install"), setOpen };
};

const InstallModal = () => {
  const { open, setOpen } = useInstallModal();
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Same entrance as the template popup: overlay fades, panel scales up from 0.9.
  useLayoutEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const tl = gsap
      .timeline()
      .fromTo(overlayRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0)
      .fromTo(panelRef.current, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: EASE_OUT }, 0);
    return () => tl.kill();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 font-inter text-black"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-title"
    >
      <div ref={overlayRef} className="absolute inset-0 bg-black/30" onClick={close} />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-[480px] max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-lg bg-white shadow-[0_24px_48px_rgba(0,0,0,0.15)] outline-none"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-white px-5 md:px-8 pt-5 md:pt-7 pb-4">
          <div>
            <h2 id="install-title" className="font-inter-tight text-xl font-medium leading-[30px]">
              Install FlowBitz
            </h2>
            <p className="text-[15px] leading-6 text-black/50">
              One script, a few attributes. About five minutes.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="shrink-0 w-8 h-8 -mr-1.5 rounded-full flex items-center justify-center text-black/50 hover:text-black hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>
        <InstallationGuide className="px-5 md:px-8 pb-6 md:pb-8" />
      </div>
    </div>
  );
};

export default InstallModal;
