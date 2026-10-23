import React from "react";
import AstroRouter from "./AstroRouter";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import SideNav from "./components/redesign/SideNav";

// Persisted across Astro page swaps (transition:persist), so it never remounts.
// Vercel analytics ride along here because this island lives for the whole visit.
const SideNavIsland = () => (
  <AstroRouter>
    <SideNav />
    <Analytics />
    <SpeedInsights />
  </AstroRouter>
);

export default SideNavIsland;
