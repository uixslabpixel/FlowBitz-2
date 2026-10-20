import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Lightbulb,
  Gift,
  Zap,
  Settings,
  Palette,
  Smartphone,
  Rocket,
  Globe,
  AlertCircle,
  TrendingUp,
  Heart,
  Infinity as InfinityIcon,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SEO from "../components/SEO.jsx";
import { PageHeader, Panel } from "../components/redesign/AppShell.jsx";
import { getFilteredComponentKeys } from "../../library/data/componentsMetadata.js";
import { seoPages, jsonLd, uiCopy } from "../content/brandCopy.js";

const ABOUT_HERO_IMAGE =
  "/images/FlowBitz-OpenGraph.webp";

const problemPoints = (componentCount) => [
  {
    icon: AlertCircle,
    title: "The challenge:",
    text: "Webflow’s native interactions cover basics, but premium sites need motion that feels studio-made—often requiring custom GSAP, ScrollTrigger, and maintenance on every project.",
  },
  {
    icon: Lightbulb,
    title: "Our solution:",
    text: `FlowBitz is a motion system—${componentCount} crafted components you configure with wb-* attributes in Webflow. Ship sophisticated text, hover, and scroll motion without rebuilding GSAP from scratch each time.`,
  },
  {
    icon: TrendingUp,
    title: "The impact:",
    text: "Freelancers ship client-ready polish faster. Agencies reuse a consistent motion language across projects—less reinvention, more margin, stronger quality control.",
  },
  {
    icon: Heart,
    title: "Our commitment:",
    text: "A free, open-source core library so serious creators can adopt FlowBitz on real client work—premium craft without a motion dev on every build. Crafted by SlabPixel Studio.",
  },
];

const differentiators = [
  {
    icon: Gift,
    title: "Free core, premium craft",
    text: "Start with a generous free layer built for adoption on real projects—crafted defaults that feel intentional, not gimmicky.",
  },
  {
    icon: Zap,
    title: "GSAP-powered",
    text: "GSAP where motion needs depth; CSS-only paths where lean bundles win. Studio-grade timing without maintaining custom plugins per site.",
  },
  {
    icon: Settings,
    title: "No custom GSAP workflow",
    text: "Configure motion with wb-* attributes in Webflow—no per-project animation codebase to write, debug, and hand off.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    text: "Every component is optimized for mobile devices and responsive design. No more worrying about animations breaking on different screen sizes.",
  },
  {
    icon: Palette,
    title: "Highly Customizable",
    text: "Extensive customization through HTML attributes — control timing, easing, colors, and behavior without touching a single line of JavaScript code.",
  },
  {
    icon: Rocket,
    title: "Performance Optimized",
    text: "Lightweight and optimized for Core Web Vitals. Minimal impact on page load times while delivering smooth 60fps animations across all devices.",
  },
];

const SectionRow = ({ title, children }) => (
  <Panel as="section" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 p-6">
    <h2 className="font-inter-tight text-xl font-medium">{title}</h2>
    <div className="md:col-span-2 text-[15px] leading-7 text-foreground/70">{children}</div>
  </Panel>
);

const IconList = ({ items, bold }) => (
  <ul className="flex flex-col gap-6 list-none p-0 m-0">
    {items.map(({ icon: Icon, title, text }) => (
      <li key={title} className="flex gap-3 items-start">
        <Icon className="w-5 h-5 mt-1 shrink-0 text-foreground/60" aria-hidden />
        {bold ? (
          <p>
            <strong className="text-foreground font-medium">{title}</strong> {text}
          </p>
        ) : (
          <div>
            <h3 className="text-foreground font-medium">{title}</h3>
            <p>{text}</p>
          </div>
        )}
      </li>
    ))}
  </ul>
);

const pillButton =
  "flex items-center gap-2 px-4 rounded-[26px] bg-[#f0f0f0] text-[15px] leading-9 hover:bg-black hover:text-white transition-colors";

const About = () => {
  const componentCount = getFilteredComponentKeys().length;
  const navigate = useNavigate();
  const copy = uiCopy.about;

  const stats = [
    { icon: Layers, value: componentCount, label: "Components" },
    { icon: Gift, value: "100%", label: "Free" },
    { icon: LayoutGrid, value: 3, label: "Categories" },
    { icon: InfinityIcon, value: "∞", label: "Possibilities" },
  ];

  return (
    <>
      <SEO
        title={seoPages.about.title}
        description={seoPages.about.description}
        keywords={seoPages.about.keywords}
        image="https://www.slabpixel.dev/images/FlowBitz-OpenGraph.webp"
        url="https://www.flowbitz.dev/about"
        structuredData={jsonLd.about}
      />

      <PageHeader title={copy.headline} description={copy.subhead} />

      <div wb-component="smart-animate" className="p-4 lg:p-6 flex flex-col gap-4">
        <Panel className="overflow-hidden">
          <img
            src={ABOUT_HERO_IMAGE}
            alt="FlowBitz — premium UI motion system for Webflow"
            className="w-full"
            loading="lazy"
          />
        </Panel>

        <SectionRow title="Our Mission">{copy.mission}</SectionRow>
        <SectionRow title="Our Vision">{copy.vision}</SectionRow>
        <SectionRow title="The Problem We’re Solving">
          <IconList items={problemPoints(componentCount)} bold />
        </SectionRow>
        <SectionRow title="Why FlowBitz is Different">
          <IconList items={differentiators} />
        </SectionRow>

        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0 m-0">
          {stats.map(({ icon: Icon, value, label }) => (
            <Panel as="li" key={label} className="p-6 flex flex-col items-center gap-2 text-center">
              <Icon className="w-5 h-5 text-foreground/50" aria-hidden />
              <span className="font-inter-tight text-3xl font-medium tabular-nums">{value}</span>
              <span className="text-[15px] text-foreground/50">{label}</span>
            </Panel>
          ))}
        </ul>

        <Panel className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <h2 className="font-inter-tight text-2xl font-medium max-w-xl">{copy.ctaHeadline}</h2>
          <p className="text-[15px] leading-7 text-foreground/60 max-w-xl">{copy.ctaSubhead}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button className={pillButton} onClick={() => navigate("/")}>
              <Zap className="w-4 h-4" />
              Explore effects
            </button>
            <a
              className={pillButton}
              href="https://github.com/Slabpixel/FlowBitz"
              target="_blank"
              rel="noreferrer"
            >
              <FontAwesomeIcon icon={["fab", "github"]} className="w-4 h-4" />
              View on GitHub
            </a>
            <a className={pillButton} href="https://slabpixel.com" target="_blank" rel="noreferrer">
              <Globe className="w-4 h-4" />
              Visit SlabPixel
            </a>
          </div>
        </Panel>
      </div>
    </>
  );
};

export default About;
