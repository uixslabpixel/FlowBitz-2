import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../Logo";
import EasterEggMark from "./EasterEggMark";

// Main sections of the sidebar. `to: null` renders the item as not yet available.
// `match` lists extra path prefixes that should mark the item as active.
// TODO(human): decide where "Tools" and "Templates" should go (or keep them unlinked).
const PRIMARY_NAV = [
  { label: "Tools", to: null },
  { label: "Effects", to: "/", match: ["/components"] },
  { label: "Templates", to: null },
];

const DOCS_NAV = [
  { label: "Installation", to: "/installation" },
  { label: "FAQ", to: "/faq" },
  { label: "Support", to: "/support" },
  { label: "Release notes", to: "/release" },
];

const SECONDARY_NAV = [
  { label: "Showcase", to: "/showcase" },
  { label: "About", to: "/about" },
];

const isActive = ({ to, match = [] }, pathname) =>
  !!to &&
  (pathname === to ||
    (to !== "/" && pathname.startsWith(`${to}/`)) ||
    match.some((p) => pathname === p || pathname.startsWith(`${p}/`)));

const itemClass =
  "relative flex items-center h-8 text-[15px] leading-7 transition-opacity duration-200";

// Not-yet-available item: clicking it flashes a "Coming soon" tooltip beside the label.
const SoonItem = ({ label }) => {
  const [open, setOpen] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = () => {
    setOpen(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 1500);
  };

  return (
    <button type="button" onClick={show} className={`${itemClass} w-fit text-left`}>
      <span className="opacity-50">{label}</span>
      <span
        role="status"
        aria-hidden={!open}
        className={`absolute left-full top-1/2 ml-2 whitespace-nowrap rounded-md bg-black px-2 text-[13px] leading-6 text-white pointer-events-none transition-all duration-200 ${
          open ? "opacity-100 -translate-y-1/2" : "opacity-0 -translate-y-1/2 translate-x-[-4px]"
        }`}
      >
        Coming soon
      </span>
    </button>
  );
};

const NavItem = ({ label, to, active }) => {
  if (!to) return <SoonItem label={label} />;

  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`${itemClass} ${active ? "opacity-100" : "opacity-50 hover:opacity-100"}`}
    >
      {label}
    </Link>
  );
};

const NavGroup = ({ items, pathname, className = "" }) => (
  <nav className={`flex flex-col ${className}`}>
    {items.map((item) => (
      <NavItem key={item.label} {...item} active={isActive(item, pathname)} />
    ))}
  </nav>
);

// One shared active marker that rolls between items: it travels to the active link and
// turns 90° per item height it covers (a square rolling on its edge), so halfway it's a diamond.
const ITEM_HEIGHT = 32;
const MARKER_SIZE = 8;

const useRollingMarker = (containerRef, pathname) => {
  const [marker, setMarker] = useState({
    y: 0,
    rotation: 0,
    visible: false,
    animate: false,
  });

  useLayoutEffect(() => {
    const place = () => {
      const container = containerRef.current;
      const active = container?.querySelector('[aria-current="page"]');
      if (!container || !active) {
        setMarker((m) => ({ ...m, visible: false }));
        return;
      }
      const c = container.getBoundingClientRect();
      const a = active.getBoundingClientRect();
      const y = a.top - c.top + a.height / 2 - MARKER_SIZE / 2;

      setMarker((m) => {
        // Whole quarter-turns only (at least one per move), so the square always lands flat.
        const steps = Math.round((y - m.y) / ITEM_HEIGHT) || Math.sign(y - m.y);
        return {
          y,
          rotation: m.visible ? m.rotation + steps * 90 : 0,
          visible: true,
          animate: m.visible, // first placement jumps; later moves roll
        };
      });
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [containerRef, pathname]);

  return marker;
};

// Zig-zag rule between the nav groups (Vector 53 in the design).
const WavyDivider = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 168.5 4"
    preserveAspectRatio="none"
    className="w-[197px] h-1 opacity-20 shrink-0"
  >
    <path
      d={`M0 2L3.24 0${Array.from({ length: 26 }, (_, i) => `L${(9.72 + i * 6.48).toFixed(2)} ${i % 2 ? 0 : 4}`).join("")}L168.5 2`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const BugIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[17px] h-[15px]" aria-hidden="true">
    <defs>
      <linearGradient id="report-bug-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4bb7ff" />
        <stop offset="100%" stopColor="#00ffcc" />
      </linearGradient>
    </defs>
    <g
      fill="none"
      stroke="url(#report-bug-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M9 4.5a3 3 0 0 1 6 0V6H9z" />
      <rect x="7" y="8" width="10" height="12" rx="5" />
      <path d="M12 12v8M3 13h4M17 13h4M4 7l3.5 2.5M20 7l-3.5 2.5M4.5 19.5L7.5 17M19.5 19.5L16.5 17" />
    </g>
  </svg>
);

const ReportBugButton = () => (
  <Link
    to="/contact?tab=report"
    className="block w-full rounded-[4px] bg-[#1a0909] p-px transition-opacity hover:opacity-90"
  >
    <span
      className="flex items-center justify-center gap-2 h-12 rounded-[3px] text-[15px] leading-7 text-white"
      style={{
        border: "1px solid transparent",
        background:
          "linear-gradient(#1a0909, #1a0909) padding-box, linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0)) border-box",
      }}
    >
      <BugIcon />
      Report Bug
    </span>
  </Link>
);

const SideNav = () => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const linksRef = useRef(null);
  const marker = useRollingMarker(linksRef, pathname);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <aside className="relative lg:fixed lg:left-2 lg:top-2 lg:bottom-2 lg:w-[250px] m-2 lg:m-0 bg-white rounded-md p-[25px] flex flex-col text-black font-inter z-20 overflow-y-auto overflow-x-hidden">
      <EasterEggMark className="absolute top-0 right-0 z-10" />

      <div className="flex items-center justify-between">
        <Link to="/" aria-label="FlowBitz home" className="block w-fit">
          <Logo fill="black" className="h-[34px] w-auto" />
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="side-nav-links"
          className="lg:hidden mr-6 text-[15px] leading-7 px-3 rounded-[26px] bg-[#f0f0f0]"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      <div
        ref={linksRef}
        id="side-nav-links"
        className={`${menuOpen ? "flex" : "hidden"} lg:flex relative flex-col flex-1`}
      >
        <span
          aria-hidden="true"
          className={`hidden lg:block absolute -left-[25px] top-0 w-2 h-2 bg-black ${
            marker.animate
              ? "transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
              : ""
          } ${marker.visible ? "" : "opacity-0"}`}
          style={{
            transform: `translateY(${marker.y}px) rotate(${marker.rotation}deg)`,
          }}
        />
        <NavGroup items={PRIMARY_NAV} pathname={pathname} className="py-6" />
        <WavyDivider />
        <NavGroup items={DOCS_NAV} pathname={pathname} className="pt-6" />

        <div className="flex flex-col mt-6 lg:mt-auto">
          <NavGroup
            items={SECONDARY_NAV}
            pathname={pathname}
            className="pb-4"
          />
          <ReportBugButton />
        </div>
      </div>
    </aside>
  );
};

export default SideNav;
