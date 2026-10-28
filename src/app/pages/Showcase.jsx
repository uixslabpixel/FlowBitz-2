import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { Check, Plus, X } from "lucide-react";
import SEO from "../components/SEO.jsx";
import { PageHeader } from "../components/redesign/AppShell.jsx";
import ToolCard from "../components/redesign/ToolCard.jsx";
import { useStaggerIn } from "../components/redesign/useStaggerIn.js";
import { seoPages, jsonLd } from "../content/brandCopy.js";
import gsap, { EASE_OUT, prefersReducedMotion, useSquish } from "../motion/gsap.js";
import { componentsMetadata } from "../../library/data/componentsMetadata.js";

// Ghost site card behind the "Showcase your site" button; springs out with a slight overshoot.
const GHOST =
  "absolute inset-0 rounded-md bg-[#f3f3f3] border border-black/10 transition-transform [transition-duration:450ms] [transition-timing-function:cubic-bezier(.34,1.56,.64,1)]";

const SHOWCASE_PROJECTS = [
  {
    name: "Lunet",
    url: "https://lunets.webflow.io/",
    image: "/showcase/lunet.webp",
    description: "Fashion & Lifestyle",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Alexandria AI",
    url: "https://alexandria-ai.webflow.io/",
    image: "/showcase/alexandria.webp",
    description: "AI Agentic Platform",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Asgard",
    url: "https://asgard-slabpixel.webflow.io/",
    image: "/showcase/asgard.webp",
    description: "Construction Management",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Soun AI",
    url: "https://soun-ai.webflow.io/",
    image: "/showcase/soun.webp",
    description: "Personal AI Assistant",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Finguard",
    url: "https://finguard-e89d5c.webflow.io/",
    image: "/showcase/finguard.webp",
    description: "Finance Application",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "LOUD Fest",
    url: "https://loud-fest.webflow.io/",
    image: "/showcase/loud.webp",
    description: "Music and Art Festival",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Vallen Angel",
    url: "https://vallenangel.webflow.io/",
    image: "/showcase/vallen.webp",
    description: "Fashion & Lifestyle",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "SlabPixel",
    url: "https://slabpixel.com",
    image: "/showcase/slabpixel.webp",
    description: "Creative Digital Studio",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Neuera",
    url: "https://neuera.webflow.io",
    image: "/showcase/neuera.webp",
    description: "AI-powered Solutions",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Whispr",
    url: "https://whisprrr.webflow.io",
    image: "/showcase/whispr.webp",
    description: "Communication Platform",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Quantra AI",
    url: "https://quantra-ai.webflow.io",
    image: "/showcase/quantra.webp",
    description: "Quantum AI Technology",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Formahaus",
    url: "https://formahaus.webflow.io",
    image: "/showcase/formahaus.webp",
    description: "Design & Architecture",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Vexum",
    url: "https://vexum.webflow.io",
    image: "/showcase/vexum.webp",
    description: "WEB3 & Finance",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Langford",
    url: "https://llangford.webflow.io",
    image: "/showcase/langford.webp",
    description: "Fashion & Lifestyle",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Art-Doc",
    url: "https://art-doc.webflow.io",
    image: "/showcase/artdoc.webp",
    description: "Art & Culture",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Swiftmate",
    url: "https://swftmate.webflow.io",
    image: "/showcase/swiftmate.webp",
    description: "Finance Application",
    components: ["Split Text", "Smart Animate"],
  },
];

const componentNames = Object.values(componentsMetadata).map((c) => c.name);

const ComponentAutocomplete = ({ selected = [], onChange }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = componentNames.filter((name) => {
    if (selected.includes(name)) return false;
    if (!query) return true;
    return name.toLowerCase().includes(query.toLowerCase());
  });

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex];
      if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const addItem = useCallback(
    (name) => {
      onChange([...selected, name]);
      setQuery("");
      setActiveIndex(-1);
      inputRef.current?.focus();
    },
    [selected, onChange],
  );

  const removeItem = useCallback(
    (name) => {
      onChange(selected.filter((s) => s !== name));
      inputRef.current?.focus();
    },
    [selected, onChange],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && !query && selected.length > 0) {
      removeItem(selected[selected.length - 1]);
      return;
    }

    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && filtered[activeIndex]) {
          addItem(filtered[activeIndex]);
        }
        break;
      case "Escape":
        e.stopPropagation();
        setOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      <div
        className="flex flex-wrap items-center gap-1.5 w-full min-h-10 rounded-[4px] bg-[#f0f0f0] px-2 py-1.5 focus-within:ring-1 focus-within:ring-black/30 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {selected.map((name) => (
          <span
            key={name}
            className="inline-flex items-center gap-1 rounded-[3px] bg-[#1a0909] px-2 py-0.5 text-[13px] leading-6 text-white"
          >
            {name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeItem(name);
              }}
              className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
              aria-label={`Remove ${name}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id="modal-components"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? "Search components..." : ""}
          className="flex-1 min-w-[80px] bg-transparent text-[15px] leading-7 text-black placeholder:text-black/40 outline-none"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="component-listbox"
          autoComplete="off"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul
          id="component-listbox"
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-black/10 bg-white py-1 shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
        >
          {filtered.map((name, i) => (
            <li
              key={name}
              role="option"
              aria-selected={i === activeIndex}
              className={`cursor-pointer px-3 py-1.5 text-[15px] leading-6 transition-colors ${
                i === activeIndex
                  ? "bg-black/5 text-black"
                  : "text-black/70"
              }`}
              onMouseDown={() => addItem(name)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const fieldClass =
  "w-full h-10 rounded-[4px] bg-[#f0f0f0] px-3 text-[15px] leading-7 outline-none placeholder:text-black/40 focus:ring-1 focus:ring-black/30";
const labelClass = "block text-[13px] leading-5 text-black/50 mb-1.5";
const primaryClass =
  "h-10 rounded-[4px] bg-[#1a0909] text-[15px] text-white disabled:opacity-60 transition-opacity";

// Submit popup in the redesign chrome (white panel, Inter, GSAP entrance) shared with the
// Feedback and Install modals. The fanned ghost cards echo the trigger card in the grid.
const ShowcaseModal = ({ open, onClose, formData, onChange, onSubmit, isSubmitting, submitStatus }) => {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

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
      aria-labelledby="showcase-title"
    >
      <div ref={overlayRef} className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-[400px] max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-lg bg-white shadow-[0_24px_48px_rgba(0,0,0,0.15)] outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-black/50 hover:text-black hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex justify-center bg-[#f7f7f7] pt-8 pb-6 border-b border-black/5">
          <span className="relative w-[120px] h-[90px]">
            <span className={`${GHOST} bg-white -rotate-[10deg] -translate-x-8`} />
            <span className={`${GHOST} bg-white rotate-[8deg] translate-x-8`} />
            <span className="absolute inset-0 rounded-md bg-[#1a0909] flex items-center justify-center text-white text-[13px] font-medium shadow-[0_8px_16px_rgba(0,0,0,0.12)]">
              {submitStatus === "success" ? <Check className="w-5 h-5" /> : "Your site"}
            </span>
          </span>
        </div>

        <div className="p-5 md:p-7">
          {submitStatus === "success" ? (
            <div className="flex flex-col gap-4 text-center">
              <div>
                <h2 id="showcase-title" className="font-inter-tight text-xl font-medium leading-[30px]">
                  Submission received
                </h2>
                <p className="text-[15px] leading-6 text-black/50">
                  We'll take a look and add it to the gallery. Thanks for sharing your work.
                </p>
              </div>
              <button type="button" onClick={onClose} className={primaryClass}>
                Done
              </button>
            </div>
          ) : (
            <>
              <h2 id="showcase-title" className="font-inter-tight text-xl font-medium leading-[30px]">
                Showcase your site
              </h2>
              <p className="text-[15px] leading-6 text-black/50 mb-5">
                Built something with FlowBitz? Send it over and we'll feature it here.
              </p>

              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="modal-url" className={labelClass}>Website URL</label>
                  <input
                    id="modal-url"
                    type="url"
                    value={formData.liveUrl}
                    onChange={(e) => onChange("liveUrl", e.target.value)}
                    required
                    placeholder="https://yourproject.com"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="modal-email" className={labelClass}>Your email</label>
                  <input
                    id="modal-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => onChange("email", e.target.value)}
                    required
                    placeholder="you@example.com"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="modal-components" className={labelClass}>
                    Components used <span className="text-black/30">(optional)</span>
                  </label>
                  <ComponentAutocomplete
                    selected={formData.components}
                    onChange={(val) => onChange("components", val)}
                  />
                </div>

                {submitStatus === "error" && (
                  <p className="text-[13px] text-red-600">
                    Couldn't send. Try again, or email flowbitz@slabpixel.com.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${primaryClass} mt-1`}
                >
                  {isSubmitting ? "Sending…" : "Submit site"}
                </button>
                <p className="text-[13px] leading-5 text-black/40 text-center">
                  By submitting, you agree your site may appear in the gallery.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Showcase = () => {
  const gridRef = useRef(null);
  useStaggerIn(gridRef);
  const submitCardRef = useRef(null);
  const submitIconRef = useRef(null);
  useSquish(submitIconRef, submitCardRef);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    liveUrl: "",
    components: [],
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("https://slabpixel.dev/api/send-email.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "showcase-submit",
          name: "Flowbitz Showcase",
          email: formData.email,
          subject: "New Submission",
          message: "New Submission",
          projectName: "New Submission",
          liveUrl: formData.liveUrl,
          components: formData.components.join(", "),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus("success");
        setFormData({ email: "", liveUrl: "", components: [] });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stable so the modal's focus/keydown effect doesn't re-run (and steal focus) on every keystroke.
  const closeModal = useCallback(() => setModalOpen(false), []);

  const openModal = () => {
    setSubmitStatus(null);
    setModalOpen(true);
  };


  const structuredData = jsonLd.showcase;

  return (
    <>
      <SEO
        title={seoPages.showcase.title}
        description={seoPages.showcase.description}
        keywords={seoPages.showcase.keywords}
        image="https://www.slabpixel.dev/images/FlowBitz-OpenGraph.webp"
        url="https://www.flowbitz.dev/showcase"
        structuredData={structuredData}
      />
      <PageHeader title="Website Showcase" />

      <section
        ref={gridRef}
        className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {/* Same card frame as the gallery, opening the submit form instead of a link. */}
        <button
          ref={submitCardRef}
          type="button"
          onClick={openModal}
          className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-white text-black flex flex-col items-center justify-center gap-6 p-6 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* Two blank site cards behind the button fan out on hover: "your site joins the gallery". */}
          <span className="relative w-[180px] h-[135px]">
            <span className={`${GHOST} -rotate-6 -translate-x-2.5 group-hover:-rotate-[14deg] group-hover:-translate-x-12 group-hover:translate-y-1.5 group-focus-visible:-rotate-[14deg] group-focus-visible:-translate-x-12`} />
            <span className={`${GHOST} rotate-[5deg] translate-x-2.5 group-hover:rotate-[12deg] group-hover:translate-x-12 group-hover:translate-y-1.5 group-focus-visible:rotate-[12deg] group-focus-visible:translate-x-12`} />
          {/* Same chrome as the sidebar's Request Feature button; pressing anywhere on the card squishes it. */}
          <span ref={submitIconRef} className="absolute left-1/2 top-1/2 -ml-[25px] -mt-[25px] block rounded-full bg-[#1a0909] p-px group-hover:shadow-[0_3px_6px_rgba(0,0,0,0.10),0_11px_11px_rgba(0,0,0,0.09),0_24px_14px_rgba(0,0,0,0.05),0_42px_17px_rgba(0,0,0,0.01),0_66px_19px_rgba(0,0,0,0)]">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full text-white"
              style={{
                border: "1px solid transparent",
                background:
                  "linear-gradient(#1a0909, #1a0909) padding-box, linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0)) border-box",
              }}
            >
              <Plus className="h-5 w-5" strokeWidth={2} />
            </span>
          </span>
          </span>
          <span className="text-[15px] leading-7">Showcase your site</span>
        </button>

        {SHOWCASE_PROJECTS.map((project) => (
          <ToolCard
            key={project.name}
            name={project.name}
            cover={project.image}
            price={project.description}
            links={[{ url: project.url }]}
          />
        ))}
      </section>

      <ShowcaseModal
        open={modalOpen}
        onClose={closeModal}
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitStatus={submitStatus}
      />
    </>
  );
};

export default Showcase;
