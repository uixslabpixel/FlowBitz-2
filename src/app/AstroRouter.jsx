import React, { useMemo, useSyncExternalStore } from "react";
import { Router, matchPath } from "react-router-dom";
import { navigate as astroNavigate } from "astro:transitions/client";

// React Router driven by Astro's <ClientRouter />. Every React island (sidebar, page) uses it,
// so <Link> and useNavigate() keep working, but a move to another page goes through Astro:
// Astro swaps the page and the persisted sidebar island stays mounted.
// Moves that stay inside the current island (a ?query change, or a path listed in
// `localPaths`, like /templates <-> /templates/:slug) are a plain pushState instead.
const EVENT = "flowbitz:location";
const notify = () => window.dispatchEvent(new Event(EVENT));

// Astro fires its lifecycle events on document, ours and popstate on window.
const subscribe = (cb) => {
  ["popstate", EVENT].forEach((e) => window.addEventListener(e, cb));
  document.addEventListener("astro:page-load", cb);
  return () => {
    ["popstate", EVENT].forEach((e) => window.removeEventListener(e, cb));
    document.removeEventListener("astro:page-load", cb);
  };
};
const snapshot = () => window.location.href;

const toHref = (to) =>
  typeof to === "string" ? to : `${to.pathname ?? window.location.pathname}${to.search ?? ""}${to.hash ?? ""}`;

const NONE = [];

const AstroRouter = ({ localPaths = NONE, children }) => {
  const href = useSyncExternalStore(subscribe, snapshot);
  const location = useMemo(() => {
    const { pathname, search, hash } = new URL(href);
    return { pathname, search, hash, state: window.history.state?.usr ?? null, key: href };
  }, [href]);

  const navigator = useMemo(() => {
    const go = (to, state, replace) => {
      const target = new URL(toHref(to), window.location.href);
      const handles = (pathname) => localPaths.some((p) => p !== "*" && matchPath(p, pathname));
      const local =
        target.pathname === window.location.pathname ||
        (handles(target.pathname) && handles(window.location.pathname));
      if (local) {
        window.history[replace ? "replaceState" : "pushState"]({ usr: state ?? null }, "", target);
        notify();
      } else {
        astroNavigate(target.pathname + target.search + target.hash, { history: replace ? "replace" : "push" });
      }
    };
    return {
      createHref: toHref,
      push: (to, state) => go(to, state, false),
      replace: (to, state) => go(to, state, true),
      go: (n) => window.history.go(n),
    };
  }, [localPaths]);

  return (
    <Router location={location} navigator={navigator}>
      {children}
    </Router>
  );
};

export default AstroRouter;
