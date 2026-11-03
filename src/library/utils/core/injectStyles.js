/**
 * Injects a <style> tag into the document head.
 * Will not inject again if style with same id already exists.
 *
 * Page-transition routers (Astro's ClientRouter, Barba, Swup) rebuild <head> on every
 * navigation, which drops these tags while each component still treats its styles as loaded
 * (most only inject once). Every tag injected here is remembered and put back if it goes missing,
 * so effects keep their CSS on pages reached without a full reload.
 *
 * @param {string} id - A unique ID for the style tag
 * @param {string} css - The CSS content to inject
 */

const injected = new Map(); // id -> css
let observer = null;
let watchedHead = null;

const append = (id, css) => {
  const styleEl = document.createElement('style');
  styleEl.id = id;
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
};

const restoreMissing = () => {
  if (!document.head) return;
  injected.forEach((css, id) => {
    if (!document.getElementById(id)) append(id, css);
  });
};

// Watch <head>'s children, and <html>'s in case the router swaps <head> itself.
const watchHead = () => {
  if (typeof MutationObserver === 'undefined') return;
  if (!observer) {
    observer = new MutationObserver(() => {
      if (document.head && document.head !== watchedHead) {
        watchedHead = document.head;
        observer.observe(watchedHead, { childList: true });
      }
      restoreMissing();
    });
    observer.observe(document.documentElement, { childList: true });
  }
  if (document.head && document.head !== watchedHead) {
    watchedHead = document.head;
    observer.observe(watchedHead, { childList: true });
  }
};

export function injectStyles(id, css) {
  injected.set(id, css);
  watchHead();
  if (document.getElementById(id)) return;
  append(id, css);
};
