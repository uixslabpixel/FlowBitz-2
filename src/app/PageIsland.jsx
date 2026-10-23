import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "./config/fontawesome.js";
import AstroRouter from "./AstroRouter";
import AppShell from "./components/redesign/AppShell";
import FeedbackModal from "./components/redesign/FeedbackModal";
import Home from "./pages/Home";
import Tools from "./pages/Tools";
import Templates from "./pages/Templates";
import ComponentDetail from "./pages/ComponentDetail";
import Installation from "./pages/Installation";
import About from "./pages/About";
import Support from "./pages/Support";
import Showcase from "./pages/Showcase";
import FAQ from "./pages/FAQ";
import Release from "./pages/Release";
import License from "./pages/License";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

// Legacy React pages, each hydrated by its own Astro route. New pages should be plain Astro
// (see CHANGELOG.md); only add here if a page is mostly client-side interactivity.
// `paths` are the URLs this island handles in place, without an Astro page swap.
const PAGES = {
  home: { paths: ["/", "/components"], element: <Home /> },
  componentDetail: { paths: ["/components/:componentName"], element: <ComponentDetail /> },
  tools: { paths: ["/tools"], element: <Tools /> },
  templates: { paths: ["/templates", "/templates/:slug"], element: <Templates /> },
  installation: { paths: ["/installation"], element: <Installation /> },
  about: { paths: ["/about"], element: <About /> },
  support: { paths: ["/support"], element: <Support /> },
  faq: { paths: ["/faq"], element: <FAQ /> },
  showcase: { paths: ["/showcase"], element: <Showcase /> },
  blog: { paths: ["/blog"], element: <Blog /> },
  blogPost: { paths: ["/blog/:slug"], element: <BlogPost /> },
  release: { paths: ["/release"], element: <Release /> },
  license: { paths: ["/license"], element: <License /> },
  contact: { paths: ["/contact"], element: <ContactRedirect /> },
  notFound: { paths: ["*"], element: <NotFound /> },
};

// Old /contact?tab=… links open the feedback popup over the home page.
function ContactRedirect() {
  const tab = new URLSearchParams(useLocation().search).get("tab");
  const type = ["report", "feature"].includes(tab) ? tab : "contact";
  return <Navigate to={`/?feedback=${type}`} replace />;
}

const PageIsland = ({ page }) => {
  const { paths, element } = PAGES[page] ?? PAGES.notFound;
  return (
    <HelmetProvider>
      <AstroRouter localPaths={paths}>
        <AppShell>
          <Routes>
            {paths.map((path) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Routes>
        </AppShell>
        <FeedbackModal />
      </AstroRouter>
    </HelmetProvider>
  );
};

export default PageIsland;
