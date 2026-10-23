import React, { useMemo, useRef, useState } from "react";
import SEO from "../components/SEO.jsx";
import { PageHeader } from "../components/redesign/AppShell.jsx";
import ToolCard from "../components/redesign/ToolCard.jsx";
import FilterChips from "../components/redesign/FilterChips.jsx";
import { useStaggerIn } from "../components/redesign/useStaggerIn.js";

// One JSON file per tool, written by Pages CMS (see .pages.yml).
const TOOLS = Object.values(
  import.meta.glob("../content/tools/*.json", { eager: true, import: "default" }),
).sort((a, b) => a.name.localeCompare(b.name));

// Filter chips come from the tags editors set in the CMS.
const buildFilters = (tools) => {
  // TODO(human): return [{ id, label }, ...] chips for the tools' tags, starting with "All".
  return [{ id: "all", label: "All" }];
};

const Tools = () => {
  const filters = useMemo(() => buildFilters(TOOLS), []);
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? TOOLS
        : TOOLS.filter((t) => t.tags?.some((tag) => tag.toLowerCase() === activeFilter)),
    [activeFilter],
  );

  const gridRef = useRef(null);
  useStaggerIn(gridRef, activeFilter);

  return (
    <>
      <SEO
        title="Free Webapp Tools | FlowBitz"
        description="Free web app tools from the FlowBitz team."
        image="https://www.slabpixel.dev/images/FlowBitz-OpenGraph.webp"
        url="https://www.flowbitz.dev/tools"
      />

      <PageHeader title="Free Webapp Tools">
        {filters.length > 1 && (
          <FilterChips
            filters={filters}
            active={activeFilter}
            onChange={setActiveFilter}
            label="Filter tools"
          />
        )}
      </PageHeader>

      <section
        ref={gridRef}
        className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {filtered.map((tool) => (
          <ToolCard key={tool.name} {...tool} />
        ))}
      </section>
    </>
  );
};

export default Tools;
