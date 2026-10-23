import React from "react";
import { Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ScrollToTop from "./components/ScrollToTop";
import AppShell from "./components/redesign/AppShell";
import Home from "./pages/Home";
import Tools from "./pages/Tools";
import ComponentDetail from "./pages/ComponentDetail";
import Installation from "./pages/Installation";
import About from "./pages/About";
import Support from "./pages/Support";
import Contact from "./pages/Contact";
import Showcase from "./pages/Showcase";
import FAQ from "./pages/FAQ";
import Release from "./pages/Release";
import License from "./pages/License";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

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
          <Route path="/installation" element={<Installation />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/release" element={<Release />} />
          <Route path="/license" element={<License />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell>
      <Analytics />
      <SpeedInsights />
    </HelmetProvider>
  );
}

export default App;
