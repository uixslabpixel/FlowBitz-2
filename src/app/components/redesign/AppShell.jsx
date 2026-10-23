import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useWebflowBits } from "../../hooks/useWebflowBits";

// Page content wrapper. The frame itself (#main-content scroller + sidebar) lives in
// src/astro/layouts/Base.astro, where the sidebar is a persisted island.
const AppShell = ({ children }) => {
  const { pathname } = useLocation();
  const { reinitializeComponents } = useWebflowBits();

  // Pages use wb-component attributes (e.g. smart-animate); scan for them after each route renders.
  useEffect(() => {
    const timer = setTimeout(reinitializeComponents, 100);
    return () => clearTimeout(timer);
  }, [pathname, reinitializeComponents]);

  return children;
};

// Standard page header from the redesign: Inter Tight 20/500 title + optional actions row.
export const PageHeader = ({ title, description, children }) => (
  <header className="px-4 lg:px-6 pt-4 lg:pt-[17px]">
    <h1 className="font-inter-tight text-xl font-medium leading-[38px]">{title}</h1>
    {description && (
      <p className="text-[15px] leading-6 text-foreground/50 max-w-[640px]">{description}</p>
    )}
    {children && <div className="mt-[13px]">{children}</div>}
  </header>
);

// White rounded surface used for cards and content panels.
export const Panel = ({ as: Tag = "div", className = "", children, ...rest }) => (
  <Tag className={`bg-white rounded-lg ${className}`} {...rest}>
    {children}
  </Tag>
);

export default AppShell;
