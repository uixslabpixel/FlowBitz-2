import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ScrollToTop from "./components/ScrollToTop";
import AppShell from "./components/redesign/AppShell";
import Home from "./pages/Home";
import Tools from "./pages/Tools";
import Templates from "./pages/Templates";
import ComponentDetail from "./pages/ComponentDetail";
import Installation from "./pages/Installation";
import About from "./pages/About";
import Support from "./pages/Support";
import FeedbackModal from "./components/redesign/FeedbackModal";
import Showcase from "./pages/Showcase";
import FAQ from "./pages/FAQ";
import Release from "./pages/Release";
import License from "./pages/License";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Old /contact?tab=… links now open the feedback popup over the home page.
const ContactRedirect = () => {
  const tab = new URLSearchParams(useLocation().search).get("tab");
  const type = ["report", "feature"].includes(tab) ? tab : "contact";
  return <Navigate to={`/?feedback=${type}`} replace />;
};

function App() {
  return (
    <HelmetProvider>
      <ScrollToTop />
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* The effects gallery replaced the separate components index. */}
          <Route path="/components" element={<Home />} />
          <Route path="/components/:componentName" element={<ComponentDetail />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/templates/:slug?" element={<Templates />} />
          <Route path="/installation" element={<Installation />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/contact" element={<ContactRedirect />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/release" element={<Release />} />
          <Route path="/license" element={<License />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell>
      <FeedbackModal />
      <Analytics />
      <SpeedInsights />
    </HelmetProvider>
  );
}

export default App;
