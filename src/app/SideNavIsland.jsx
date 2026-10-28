import React from "react";
import AstroRouter from "./AstroRouter";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import SideNav from "./components/redesign/SideNav";
import FaqModal from "./components/redesign/FaqModal";

// Persisted across Astro page swaps (transition:persist), so it never remounts.
// Vercel analytics and the FAQ popup ride along here because this island lives for the whole
// visit and is on every page, Astro-only ones included.
const SideNavIsland = () => (
  <AstroRouter>
    <SideNav />
    <FaqModal />
    <Analytics />
    <SpeedInsights />
  </AstroRouter>
);

export default SideNavIsland;
