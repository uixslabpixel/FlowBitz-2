import React, { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import SEO from "../components/SEO.jsx";
import { PageHeader } from "../components/redesign/AppShell.jsx";
import ToolCard from "../components/redesign/ToolCard.jsx";
import FilterChips from "../components/redesign/FilterChips.jsx";
import { useStaggerIn } from "../components/redesign/useStaggerIn.js";
import TemplateModal from "../components/redesign/TemplateModal.jsx";
import { TEMPLATES } from "../content/templateDetails.js";

// Filter chips come from the tags editors set in the CMS.
const buildFilters = (tools) => {
  // Case-insensitive: "Shaders" and "shaders" are one chip, labelled with the first spelling seen.
  const tags = new Map();
  tools.forEach((t) =>
    t.tags?.forEach((tag) => {
      const id = tag.trim().toLowerCase();
      if (id && !tags.has(id)) tags.set(id, tag.trim());
    }),
  );
  const chips = [...tags].map(([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label));
  return [{ id: "all", label: "All" }, ...chips];
};

const Templates = () => {
  // /templates/:slug keeps the gallery underneath and opens that template as a popup.
  const { slug } = useParams();
  const filters = useMemo(() => buildFilters(TEMPLATES), []);
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? TEMPLATES
        : TEMPLATES.filter((t) => t.tags?.some((tag) => tag.toLowerCase() === activeFilter)),
    [activeFilter],
  );

  const gridRef = useRef(null);
  useStaggerIn(gridRef, activeFilter);

  return (
    <>
      <SEO
        title="Premium Website Templates | FlowBitz"
        description="Website templates from the FlowBitz team."
        image="https://www.slabpixel.dev/images/FlowBitz-OpenGraph.webp"
        url="https://www.flowbitz.dev/templates"
      />

      <PageHeader title="Premium Website Templates">
        {filters.length > 1 && (
          <FilterChips
            filters={filters}
            active={activeFilter}
            onChange={setActiveFilter}
            label="Filter templates"
          />
        )}
      </PageHeader>

      <section
        ref={gridRef}
        className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {filtered.map((template) => (
          <ToolCard key={template.slug} {...template} to={`/templates/${template.slug}`} />
        ))}
      </section>

      {slug && <TemplateModal slug={slug} />}
    </>
  );
};

export default Templates;
