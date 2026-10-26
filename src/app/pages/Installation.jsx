import React, { useState } from "react";
import { PageHeader } from "../components/redesign/AppShell.jsx";
import SEO from "../components/SEO.jsx";
import { Copy, Check } from "lucide-react";
import { seoPages } from "../content/brandCopy.js";

const SCRIPT_TAG =
  '<script src="https://cdn.jsdelivr.net/npm/flowbitz@latest/dist/flowbitz.umd.js"></script>';

const FAQ_ITEMS = [
  {
    question: "Do I need to install GSAP separately?",
    answer:
      "No. FlowBitz bundles GSAP and the plugins it needs, so one script tag is all you add.",
  },
  {
    question: "Can I use FlowBitz outside Webflow?",
    answer:
      "FlowBitz is designed for Webflow. The core JavaScript can be adapted to other frameworks, but Webflow gives the best experience.",
  },
  {
    question: "My animations aren't working. What should I check?",
    answer:
      "1. The FlowBitz script is in Footer Code and the site is published\n2. The wb-component value is spelled exactly like the effect name\n3. The element has text content\n4. The browser console shows no errors",
  },
  {
    question: "Some Webflow elements don't animate",
    answer:
      "FlowBitz works best on plain text elements. Deeply nested or complex Webflow elements may not, so try a simpler element or check the effect's installation notes.",
  },
];

// Hand-drawn wavy divider, same tile as the template popup.
const WAVE = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="6"><path d="M0 3Q3 0 6 3T12 3" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1"/></svg>',
)}")`;
const Divider = () => (
  <div aria-hidden="true" className="h-1.5 bg-repeat-x bg-left" style={{ backgroundImage: WAVE }} />
);

const useCopy = () => {
  const [copied, setCopied] = useState(null);
  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((k) => (k === key ? null : k)), 1600);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  return { copied, copy };
};

const CopyButton = ({ copied, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={copied ? "Copied" : `Copy ${label}`}
    className="shrink-0 flex items-center gap-1.5 px-2.5 rounded-[26px] bg-white text-[13px] leading-7 text-black/60 hover:text-black transition-colors"
  >
    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    {copied ? "Copied" : "Copy"}
  </button>
);

// A copyable value on the light well: the script tag, or one half of an attribute pair.
const CodeWell = ({ label, value, id, copy, copied, wrap = false }) => (
  <div className="flex items-start gap-2 rounded-[4px] bg-[#f0f0f0] p-1.5 pl-3">
    <code
      className={`flex-1 min-w-0 py-1 font-mono text-[12.5px] leading-5 text-black/80 ${
        wrap ? "break-all" : "truncate"
      }`}
    >
      {value}
    </code>
    <CopyButton copied={copied === id} onClick={() => copy(value, id)} label={label} />
  </div>
);

const Step = ({ n, title, last, children }) => (
  <li className="relative flex gap-4">
    <div className="flex flex-col items-center">
      <span className="w-7 h-7 rounded-full bg-black text-white text-[13px] font-medium flex items-center justify-center tabular-nums">
        {n}
      </span>
      {!last && <span aria-hidden="true" className="flex-1 w-px bg-black/10 my-2" />}
    </div>
    <div className={`flex-1 min-w-0 ${last ? "" : "pb-7"}`}>
      <h3 className="font-inter-tight text-[17px] font-medium leading-7">{title}</h3>
      <div className="mt-1.5 flex flex-col gap-3 text-[15px] leading-6 text-black/60">
        {children}
      </div>
    </div>
  </li>
);

const Path = ({ children }) => <span className="text-black font-medium">{children}</span>;

// Steps + FAQ, shared by the /installation page and the InstallModal popup.
export const InstallationGuide = ({ className = "" }) => {
  const { copied, copy } = useCopy();
  return (
    <div className={`flex flex-col gap-8 ${className}`}>
      <ol className="flex flex-col">
        <Step n={1} title="Add the script">
          <p>
            In Webflow, open <Path>Site settings → Custom code → Footer code</Path> and paste:
          </p>
          <CodeWell label="script tag" value={SCRIPT_TAG} id="script" wrap copy={copy} copied={copied} />
        </Step>
        <Step n={2} title="Tag an element">
          <p>
            Select an element, open <Path>Element settings → Custom attributes</Path>, and add:
          </p>
          <div className="flex flex-col gap-2">
            {[
              ["Name", "wb-component"],
              ["Value", "text-type"],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[0.04em] text-black/50">{label}</span>
                <CodeWell label={`attribute ${label.toLowerCase()}`} value={value} id={label} copy={copy} copied={copied} />
              </div>
            ))}
          </div>
          <p>Swap the value for any effect's name.</p>
        </Step>
        <Step n={3} title="Tune it with attributes">
          <p>
            Every effect page lists its own attributes, like <code className="font-mono text-[13px] text-black/80">wb-duration</code>,{" "}
            <code className="font-mono text-[13px] text-black/80">wb-delay</code> and{" "}
            <code className="font-mono text-[13px] text-black/80">wb-trigger</code>. Add them the same way.
          </p>
        </Step>
        <Step n={4} title="Publish" last>
          <p>Effects run on the published site. The script loads on its own and starts every tagged element.</p>
        </Step>
      </ol>

      <section>
        <h3 className="text-xs uppercase tracking-[0.04em] text-black/50 pb-1">Common questions</h3>
        <Divider />
        {FAQ_ITEMS.map((item) => (
          <React.Fragment key={item.question}>
            <details className="group">
              <summary className="flex items-center justify-between gap-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-[15px] leading-6 text-black/80 hover:text-black">
                {item.question}
                <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="shrink-0">
                  <path d="M0 5h10" />
                  <path d="M5 0v10" className="origin-center [transform-box:fill-box] transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-open:rotate-90" />
                </svg>
              </summary>
              <p className="pb-4 text-[15px] leading-6 text-black/60 whitespace-pre-line">{item.answer}</p>
            </details>
            <Divider />
          </React.Fragment>
        ))}
      </section>
    </div>
  );
};

const Installation = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Install FlowBitz in Webflow",
    description:
      "Complete guide to installing and using FlowBitz animations in your Webflow projects",
    url: "https://www.flowbitz.dev/installation",
    totalTime: "PT5M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: "0",
    },
    step: [
      {
        "@type": "HowToStep",
        name: "Add FlowBitz Script",
        text: "Add the FlowBitz script to your Webflow project's custom code section",
        url: "https://www.flowbitz.dev/installation#step-1",
      },
      {
        "@type": "HowToStep",
        name: "Add Component Attributes",
        text: "Add wb-component attributes to your elements in Webflow",
        url: "https://www.flowbitz.dev/installation#step-2",
      },
      {
        "@type": "HowToStep",
        name: "Customize with Attributes",
        text: "Use additional attributes to customize animation behavior and appearance",
        url: "https://www.flowbitz.dev/installation#step-3",
      },
      {
        "@type": "HowToStep",
        name: "Publish Your Site",
        text: "Publish your Webflow site to see the animations in action",
        url: "https://www.flowbitz.dev/installation#step-4",
      },
    ],
  };

  return (
    <>
      <SEO
        title={seoPages.installation.title}
        description={seoPages.installation.description}
        keywords={seoPages.installation.keywords}
        image="https://www.slabpixel.dev/images/FlowBitz-OpenGraph.webp"
        url="https://www.flowbitz.dev/installation"
        structuredData={structuredData}
      />
      <PageHeader
        title="Installation Guide"
        description="Add FlowBitz to your Webflow project—one script, wb-* attributes, premium motion on your next build."
      />
      <div className="p-4 lg:p-6">
        <InstallationGuide className="max-w-[640px] bg-white rounded-lg p-5 md:p-8" />
      </div>
    </>
  );
};

export default Installation;
