import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import gsap, { EASE_OUT, prefersReducedMotion } from "../../motion/gsap";
import { faqGroups } from "../../content/faq.js";

// FAQ popup, opened from any page with `?faq`. Mounted in the persisted sidebar island, so it
// also works on Astro-only pages like /about, which open it by pushing `?faq` themselves.
export const useFaqModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setOpen = (open) => {
    const next = new URLSearchParams(searchParams);
    open ? next.set("faq", "") : next.delete("faq");
    setSearchParams(next);
  };
  return { open: searchParams.has("faq"), setOpen };
};

const PlusIcon = () => (
  <svg
    className="shrink-0 transition-transform duration-200 group-open:rotate-45"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    aria-hidden="true"
  >
    <path d="M7.27 5.86h5.86v1.4H7.27v5.87h-1.4V7.27H0v-1.4h5.86V0h1.4v5.86Z" fill="currentColor" />
  </svg>
);

const FaqModal = () => {
  const { open, setOpen } = useFaqModal();
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

  // Same entrance as the install popup: overlay fades, panel scales up from 0.9.
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
      aria-labelledby="faq-title"
    >
      <div ref={overlayRef} className="absolute inset-0 bg-black/30" onClick={close} />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-[560px] max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-lg bg-white shadow-[0_24px_48px_rgba(0,0,0,0.15)] outline-none"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-white px-5 md:px-8 pt-5 md:pt-7 pb-4">
          <div>
            <h2 id="faq-title" className="font-inter-tight text-xl font-medium leading-[30px]">
              Frequently asked questions
            </h2>
            <p className="text-[15px] leading-6 text-black/50">
              About the effects, templates and tools.
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

        <div className="flex flex-col gap-6 px-5 md:px-8 pb-6 md:pb-8">
          {faqGroups.map((group) => (
            <section key={group.key}>
              <h3 className="text-[13px] leading-5 text-black/50 pb-1">{group.label}</h3>
              {group.items.map((item) => (
                <details key={item.question} className="group border-t border-black/10 last:border-b">
                  <summary className="flex items-center justify-between gap-4 py-2.5 text-[15px] leading-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <PlusIcon />
                  </summary>
                  <p className="pb-3 text-[15px] leading-6 text-black/60 whitespace-pre-line">{item.answer}</p>
                </details>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqModal;
