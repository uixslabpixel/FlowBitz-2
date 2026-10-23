import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap, { EASE_OUT, prefersReducedMotion } from "../../motion/gsap";
import { useNavigate } from "react-router-dom";
import SEO from "../SEO.jsx";
import { getTemplate } from "../../content/templateDetails.js";

// Template detail popup, opened over the gallery at /templates/:slug.
// Living in the URL means links stay shareable and the back button closes it.
// Hand-drawn wavy divider: a small sine tile repeated across the width.
const WAVE = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="6"><path d="M0 3Q3 0 6 3T12 3" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1"/></svg>',
)}")`;

const Divider = () => (
  <div aria-hidden="true" className="h-1.5 bg-repeat-x bg-left" style={{ backgroundImage: WAVE }} />
);

// Native <details> gives keyboard and screen-reader support for free; closed by default.
const Accordion = ({ title, children }) => (
  <>
    <details className="group">
      <summary className="flex items-center justify-between py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-xs uppercase tracking-[0.04em] text-black/50 hover:text-black">
        {title}
        <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M0 5h10" />
          <path d="M5 0v10" className="origin-center [transform-box:fill-box] transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-open:rotate-90" />
        </svg>
      </summary>
      <div className="pb-4">{children}</div>
    </details>
    <Divider />
  </>
);

const List = ({ items }) => (
  <ul className="text-[15px] leading-6">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

const TemplateModal = ({ slug }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const template = getTemplate(slug);
  // Fade/zoom in on the frame after mount; on close, play it out before leaving the URL.
  const backdropRef = useRef(null);
  useLayoutEffect(() => {
    if (!template || prefersReducedMotion()) return;
    const tl = gsap
      .timeline()
      .fromTo(backdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0)
      .fromTo(scrollRef.current, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: EASE_OUT }, 0);
    return () => tl.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const close = () => {
    if (prefersReducedMotion()) return navigate("/templates");
    gsap
      .timeline({ onComplete: () => navigate("/templates") })
      .to(scrollRef.current, { autoAlpha: 0, scale: 0.9, duration: 0.2, ease: "power2.in" }, 0)
      .to(backdropRef.current, { autoAlpha: 0, duration: 0.25, ease: "power2.out" }, 0);
  };

  useEffect(() => {
    if (!template) return navigate("/templates", { replace: true });
    scrollRef.current?.scrollTo(0, 0);
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!template) return null;

  const { name, subtitle, price, cover, hover, info, features, pages, platform, tags = [], keywords = [], links = [] } = template;
  const chips = [...new Set([...tags, ...keywords])];
  const buyUrl = links[0]?.url;
  const previewUrl = links[1]?.url ?? links[0]?.url;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 font-inter text-black"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-title"
    >
      <SEO
        title={`${name} — ${subtitle} | FlowBitz`}
        description={info}
        image={cover ? `https://www.flowbitz.dev${cover}` : undefined}
        url={`https://www.flowbitz.dev/templates/${slug}`}
      />
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/30"
        onClick={close}
      />

      <div
        ref={scrollRef}
        className="relative w-full max-w-[1200px] max-h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-lg bg-white"
      >
        {/* Zero-height sticky rail: the button stays pinned without taking width from the content. */}
        <div className="sticky top-0 z-10 h-0 flex justify-end">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="mt-3 mr-3 w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center hover:bg-[#e4e4e4]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        </div>

        <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          {/* Mobile: swipeable carousel under the heading. Desktop: stacked column beside the info. */}
          <div className="order-2 lg:order-1 -mx-4 px-4 scroll-px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:px-0 lg:flex-col lg:gap-4 lg:overflow-visible">
            {[cover, hover].filter(Boolean).map((src) => (
              <img key={src} src={src} alt={`${name} preview`} className="w-[85%] shrink-0 snap-start rounded-lg bg-[#f0f0f0] lg:w-full" />
            ))}
          </div>

          {/* `contents` on mobile lets the heading and details sit above and below the carousel. */}
          <aside className="contents lg:order-2 lg:sticky lg:top-6 lg:self-start lg:flex lg:flex-col lg:gap-6">
            <div className="order-1 pr-10 lg:order-none lg:pr-0">
              <h2 id="template-title" className="font-inter-tight text-3xl font-medium leading-tight">{name}</h2>
            </div>

            <div className="order-3 lg:order-none flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <a
                  href={buyUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 rounded-full bg-black text-white text-sm font-medium flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  Buy Template · {price}
                </a>
                <a
                  href={previewUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 rounded-full bg-[#f0f0f0] text-black text-sm font-medium flex items-center justify-center hover:bg-[#e4e4e4] transition-colors"
                >
                  Preview live site
                </a>
              </div>

              <p className="text-[15px] leading-6">{info}</p>

              <div className="flex flex-col">
                <Divider />
                <Accordion title="Features">
                  <List items={features} />
                </Accordion>
                <Accordion title="Pages">
                  <List items={pages} />
                </Accordion>
                <Accordion title="Platform">
                  <p className="text-[15px] leading-6">{platform}</p>
                </Accordion>
                {chips.length > 0 && (
                  <Accordion title="Tags">
                    <ul className="flex flex-wrap gap-1.5">
                      {chips.map((chip) => (
                        <li key={chip} className="px-3 rounded-[26px] bg-[#f0f0f0] text-[13px] leading-7">
                          {chip}
                        </li>
                      ))}
                    </ul>
                  </Accordion>
                )}
              </div>
            </div>
          </aside>
        </div>

      </div>
    </div>
  );
};

export default TemplateModal;
