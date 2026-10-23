import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./config/fontawesome.js";
import ScrollToTop from "./components/ScrollToTop";
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

// Every Astro page hydrates this same island with the full route table. After the first
// load React Router handles navigation client-side, so the AppShell (sidebar) stays mounted;
// Astro still emits static HTML for each URL so direct visits and refreshes work.
const PAGES = {
  home: { paths: ["/", "/components"], element: <Home /> },
  componentDetail: { paths: ["/components/:componentName"], element: <ComponentDetail /> },
  tools: { paths: ["/tools"], element: <Tools /> },
  templates: { paths: ["/templates/:slug?"], element: <Templates /> },
  installation: { paths: ["/installation"], element: <Installation /> },
  about: { paths: ["/about"], element: <About /> },
  support: { paths: ["/support"], element: <Support /> },
  faq: { paths: ["/faq"], element: <FAQ /> },
  showcase: { paths: ["/showcase"], element: <Showcase /> },
  blog: { paths: ["/blog"], element: <Blog /> },
  blogPost: { paths: ["/blog/:slug"], element: <BlogPost /> },
  release: { paths: ["/release"], element: <Release /> },
  license: { paths: ["/license"], element: <License /> },
  notFound: { paths: ["*"], element: <NotFound /> },
};

// Old /contact?tab=… links open the feedback popup over the home page.
const ContactRedirect = () => {
  const tab = new URLSearchParams(useLocation().search).get("tab");
  const type = ["report", "feature"].includes(tab) ? tab : "contact";
  return <Navigate to={`/?feedback=${type}`} replace />;
};

const PageIsland = ({ url }) => {
  const Router = typeof window === "undefined" ? StaticRouter : BrowserRouter;
  const routerProps = typeof window === "undefined" ? { location: url } : {};

  return (
    <HelmetProvider>
      <Router {...routerProps} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <AppShell>
          <Routes>
            {Object.values(PAGES).flatMap(({ paths, element }) =>
              paths.map((path) => <Route key={path} path={path} element={element} />),
            )}
            <Route path="/contact" element={<ContactRedirect />} />
          </Routes>
        </AppShell>
        <FeedbackModal />
      </Router>
      <Analytics />
      <SpeedInsights />
    </HelmetProvider>
  );
};

export default PageIsland;
