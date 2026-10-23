import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import SEO from "../components/SEO.jsx";
import { PageHeader } from "../components/redesign/AppShell.jsx";
import ToolCard from "../components/redesign/ToolCard.jsx";
import { useStaggerIn } from "../components/redesign/useStaggerIn.js";
import { useSquish } from "../motion/gsap.js";
import { seoPages, jsonLd } from "../content/brandCopy.js";
import Logo from "../components/Logo.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Modal } from "../components/ui/modal.jsx";
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
  // Covers below still point at slabpixel.dev, where the files are missing (404).
  {
    name: "SlabPixel",
    url: "https://slabpixel.com",
    image: "https://slabpixel.dev/images/slabpixel.webp",
    description: "Creative Digital Studio",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Neuera",
    url: "https://neuera.webflow.io",
    image: "https://slabpixel.dev/images/neuera.webp",
    description: "AI-powered Solutions",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Whispr",
    url: "https://whisprrr.webflow.io",
    image: "https://slabpixel.dev/images/whispr.webp",
    description: "Communication Platform",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Quantra AI",
    url: "https://quantra-ai.webflow.io",
    image: "https://slabpixel.dev/images/quantra.webp",
    description: "Quantum AI Technology",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Mavence",
    url: "https://mavencee.webflow.io",
    image: "https://slabpixel.dev/images/mavence.webp",
    description: "Business Solutions",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Formahaus",
    url: "https://formahaus.webflow.io",
    image: "https://slabpixel.dev/images/formahaus.webp",
    description: "Design & Architecture",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Vexum",
    url: "https://vexum.webflow.io",
    image: "https://slabpixel.dev/images/vexum.webp",
    description: "WEB3 & Finance",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Langford",
    url: "https://llangford.webflow.io",
    image: "https://slabpixel.dev/images/langford.webp",
    description: "Fashion & Lifestyle",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Stagetimer",
    url: "https://stagetimer.webflow.io",
    image: "https://slabpixel.dev/images/stagetimer.webp",
    description: "Tools & Management",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Art-Doc",
    url: "https://art-doc.webflow.io",
    image: "https://slabpixel.dev/images/artdoc.webp",
    description: "Art & Culture",
    components: ["Split Text", "Smart Animate"],
  },
  {
    name: "Swiftmate",
    url: "https://swftmate.webflow.io",
    image: "https://slabpixel.dev/images/swiftmate.webp",
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
        className="flex flex-wrap items-center gap-1.5 w-full min-h-10 rounded bg-base-medium px-2 py-1.5 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {selected.map((name) => (
          <span
            key={name}
            className="inline-flex items-center gap-1 rounded bg-foreground/90 px-2.5 py-1 text-xs font-medium text-background"
          >
            {name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeItem(name);
              }}
              className="ml-0.5 hover:text-background/70 transition-colors"
              aria-label={`Remove ${name}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
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
          className="flex-1 min-w-[80px] bg-transparent text-sm text-foreground placeholder:text-base-medium outline-none"
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
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded border border-border bg-background shadow-md"
        >
          {filtered.map((name, i) => (
            <li
              key={name}
              role="option"
              aria-selected={i === activeIndex}
              className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                i === activeIndex
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-accent/50"
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

      {/* Submit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        {submitStatus === "success" ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Submission Received!
            </h3>
            <p className="text-sm text-muted-foreground">
              We'll take a look and get back to you soon. Thanks for sharing
              your work!
            </p>
            <Button
              onClick={() => setModalOpen(false)}
              variant="custom"
              size="custom"
              className="mt-2 h-10 px-6 bg-foreground rounded text-tooltip text-background"
            >
              Close
            </Button>
          </div>
        ) : submitStatus === "error" ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Submission Failed
            </h3>
            <p className="text-sm text-muted-foreground">
              Something went wrong. Please try again or contact us at
              flowbitz@slabpixel.com
            </p>
            <Button
              onClick={() => setSubmitStatus(null)}
              variant="custom"
              size="custom"
              className="mt-2 h-10 px-6 bg-foreground rounded text-tooltip text-background"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 md:gap-10">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="bg-foreground/10 h-[30px] w-fit px-4 flex items-center justify-center gap-1">
                  <span className="text-link font-medium text-foreground">
                    Made with
                  </span>
                  <Logo className="h-4 w-auto" />
                </div>

                <p className="inter-med-40 text-foreground">
                  Share Your <br /> #MadewithFlowbitz Project
                </p>
              </div>

              <p className="inter-reg-18 text-text-medium opacity-80">
                Share your cool FlowBitz project! Fill out this <br /> form to
                feature your work.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label
                  htmlFor="modal-email"
                  className="block text-link text-foreground font-medium mb-2"
                >
                  Your Email
                </label>
                <Input
                  id="modal-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  placeholder="john@example.com"
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="modal-url"
                  className="block text-link text-foreground font-medium mb-2"
                >
                  Website URL
                </label>
                <Input
                  id="modal-url"
                  type="url"
                  value={formData.liveUrl}
                  onChange={(e) => handleInputChange("liveUrl", e.target.value)}
                  required
                  placeholder="https://yourproject.com"
                />
              </div>

              <div className="mb-10 pb-6">
                <label
                  htmlFor="modal-components"
                  className="block text-link text-foreground font-medium mb-2"
                >
                  Flowbitz components used
                </label>
                <ComponentAutocomplete
                  selected={formData.components}
                  onChange={(val) => handleInputChange("components", val)}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                variant="custom"
                size="custom"
                className="w-full h-10 bg-foreground rounded text-link font-medium text-background flex items-center justify-center gap-4"
              >
                {isSubmitting ? (
                  <>
                    Submitting...
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background" />
                  </>
                ) : (
                  <>
                    Submit
                    <ArrowRight className="w-3 h-3 opacity-60" />
                  </>
                )}
              </Button>

              <p className="mt-2 text-tooltip text-text-medium text-center opacity-60">
                By submitting, you agree that your project may be featured in
                our showcase gallery.
              </p>
            </form>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Showcase;
