import React, { useEffect, useMemo, useRef, useState } from "react";
import SEO from "../components/SEO.jsx";
import { PageHeader } from "../components/redesign/AppShell.jsx";
import EffectCard from "../components/redesign/EffectCard.jsx";
import FilterChips from "../components/redesign/FilterChips.jsx";
import PixelMark from "../components/redesign/PixelMark.jsx";
import { useStaggerIn } from "../components/redesign/useStaggerIn.js";
import { FEATURED_EFFECTS } from "../components/redesign/cardThemes.js";
import {
  componentsMetadata,
  getFilteredComponentKeys,
} from "../../library/data/componentsMetadata.js";
import { useInstallModal } from "../components/redesign/InstallModal.jsx";
import { Code } from "lucide-react";
import { seoPages, jsonLd } from "../content/brandCopy.js";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "text", label: "Text" },
  { id: "button", label: "Button" },
  { id: "effect", label: "Effects" },
  { id: "background", label: "Background" },
];

const PAGE_SIZE = 12;

// Empty category: dashed placeholder cards keep the grid's rhythm; the first one explains
// and offers a way back to everything.
const EmptyState = ({ label, onReset }) => (
  <>
    <div
      className="aspect-[4/3] rounded-lg border border-dashed border-black/15 flex flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <PixelMark size={8} />
      <div>
        <p className="font-inter-tight text-xl font-medium leading-7">
          {label} is coming soon
        </p>
        <p className="text-[15px] leading-6 text-black/50 mt-1">
          We're still crafting this set. Explore the rest meanwhile.
        </p>
      </div>
      <button
        onClick={onReset}
        className="bg-black text-white rounded-[2px] px-3 text-[15px] leading-8 font-medium hover:bg-black/80 transition-colors"
      >
        Show all effects
      </button>
    </div>
    {[1, 2].map((i) => (
      <div
        key={i}
        aria-hidden="true"
        className={`hidden ${i === 1 ? "md:block" : "xl:block"} aspect-[4/3] rounded-lg border border-dashed border-black/10`}
      />
    ))}
  </>
);

const Home = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const installModal = useInstallModal();

  const allComponents = useMemo(
    () =>
      // Art-directed cards lead; every other effect follows on its default card.
      [
        ...FEATURED_EFFECTS,
        ...getFilteredComponentKeys().filter((key) => !FEATURED_EFFECTS.includes(key)),
      ].map((key) => ({
        id: key,
        ...componentsMetadata[key],
      })),
    [],
  );

  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? allComponents
        : allComponents.filter((c) => c.category === activeFilter),
    [allComponents, activeFilter],
  );

  const visible = filtered.slice(0, visibleCount);

  // Cards rise in one after another on load and on every filter switch.
  const gridRef = useRef(null);
  useStaggerIn(gridRef, activeFilter);

  useEffect(() => setVisibleCount(PAGE_SIZE), [activeFilter]);

  const libraryCount = getFilteredComponentKeys().length;
  const homeSeo = seoPages.home(libraryCount);

  return (
    <>
      <SEO
        title={homeSeo.title}
        description={homeSeo.description}
        keywords={homeSeo.keywords}
        image="https://www.slabpixel.dev/images/FlowBitz-OpenGraph.webp"
        url="https://www.flowbitz.dev"
        structuredData={jsonLd.website(libraryCount)}
      />

      <PageHeader title="Premium effects for Webflow">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <FilterChips
            filters={FILTERS}
            active={activeFilter}
            onChange={setActiveFilter}
            label="Filter effects"
          />
          <button
            onClick={() => installModal.setOpen(true)}
            className="flex items-center gap-2 px-3 bg-white rounded-[26px] text-[15px] leading-7 text-black/60 hover:text-black transition-colors"
          >
            <Code className="w-4 h-4" />
            Installation guide
          </button>
        </div>
      </PageHeader>

      <section
        ref={gridRef}
        className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {visible.map((c) => (
          <EffectCard
            key={c.id}
            id={c.id}
            name={c.name}
            category={c.category}
            exampleCode={c.example?.code}
          />
        ))}
        {filtered.length === 0 && (
          <EmptyState
            label={FILTERS.find((f) => f.id === activeFilter)?.label}
            onReset={() => setActiveFilter("all")}
          />
        )}
      </section>

      {visible.length < filtered.length && (
        <div className="flex justify-center pb-10">
          <button
            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            className="bg-white rounded-[26px] px-4 text-[15px] leading-8 text-black/60 hover:text-black transition-colors"
          >
            Load more
          </button>
        </div>
      )}
    </>
  );
};

export default Home;
