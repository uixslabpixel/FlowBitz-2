# Plan 003: Smart Animate starts in every build and is torn down by `destroy()`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 5f0e001..HEAD -- src/library/components/effect/smartAnimate.js`
> If the file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-add-verification-baseline.md
- **Category**: bug
- **Planned at**: commit `5f0e001`, 2026-11-10

## Why this matters

`smart-animate` is FlowBitz's scroll-reveal component. Unlike the other 29
components, its animator has no `initAll()` and no `destroyAll()`. The
published loader starts a component by calling `initAll()` and stops it by
calling `destroyAll()`, each only if it exists. Smart Animate instead relies
on a `DOMContentLoaded` listener registered when its module is evaluated — but
in the ES-module build the module is fetched after that event has already
fired, so the listener never runs and `wb-component="smart-animate"` elements
never animate. `FlowBitz.destroy()` also leaves its scroll triggers alive.
This plan gives Smart Animate the same lifecycle methods as its siblings.

## Current state

- `src/library/components/effect/smartAnimate.js` — the whole component (270
  lines). Two classes: `SmartAnimate` (one element's animation) and
  `SmartAnimateAnimator` (the manager, exported as a singleton default).
- `src/library/loader.js` — the published entry. After importing a component
  it runs (`:404-407`):

```js
      // Initialize component
      if (component && component.initAll) {
        component.initAll();
        this.initialized.add(componentName);
```

  and in `destroy()` (`:569-573`):

```js
    Object.values(this.modules).forEach((component) => {
      if (component && component.destroyAll) {
        component.destroyAll();
      }
    });
```

  The loader waits for `DOMContentLoaded` before importing anything
  (`:303-307`), which is why a listener for that event inside a lazily
  imported module is too late.

`src/library/components/effect/smartAnimate.js:202-262` — the manager and the
auto-init, as they are today:

```js
class SmartAnimateAnimator {
  constructor() {
    this.componentName = "smart-animate";
    this.instances = new Map();
  }

  /**
   * Initialize SmartAnimate on a specific element
   * @param {HTMLElement} element - The element to initialize
   */
  initElement(element) {
    if (this.instances.has(element)) {
      return this.instances.get(element);
    }

    const options = {
      direction: element.getAttribute("wb-direction") || "bottom",
      …
    };

    const instance = new SmartAnimate(element, options);
    this.instances.set(element, instance);
    return instance;
  }

  /**
   * Refresh all SmartAnimate instances
   */
  refresh() {
    // SmartAnimate doesn't need refresh like ScrollTrigger components
    return this;
  }

  /**
   * Destroy all instances
   */
  destroy() {
    this.instances.forEach((instance) => {
      if (instance.destroy) {
        instance.destroy();
      }
    });
    this.instances.clear();
  }
}

// Create singleton instance
const smartAnimateAnimator = new SmartAnimateAnimator();

// Auto-initialize components with wb-component="smart-animate"
document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll('[wb-component="smart-animate"]');
  elements.forEach((element) => {
    smartAnimateAnimator.initElement(element);
  });
});

export default smartAnimateAnimator;
export { SmartAnimate, SmartAnimateAnimator };
```

`SmartAnimate.destroy()` (`:180-195`) kills the element's tweens and its
ScrollTrigger. It does **not** undo the hidden starting state that
`setupInitialState()` (`:50-64`) applies with
`gsap.set(el, { y: 30, autoAlpha: 0 })` to the element and each direct child.
This plan leaves that as it is (see Maintenance notes).

The repo's pattern for "initialise now or when the DOM is ready", from
`src/library/components/effect/imageTrail.js:1780-1794` — match it:

```js
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      imageTrailAnimator.initAll().catch(err => { … });
    })
  } else {
    // DOM already loaded, initialize immediately
    imageTrailAnimator.initAll().catch(err => { … });
  }
}
```

The repo's pattern for `initAll` / `destroyAll`, from
`src/library/components/effect/3dCardHover.js:207-210`:

```js
  initAll() {
    const elements = document.querySelectorAll('[wb-component="3d-card-hover"]');
    elements.forEach((el) => this.initElement(el));
  };
```

`smartAnimate.js` uses double quotes, semicolons and two-space indentation;
keep that style.

Other callers of this animator (do not edit them, just be aware):
`src/library/core/WebflowBits.js` calls `smartAnimateAnimator.initElement(…)`
and `smartAnimateAnimator.refresh()`. Nothing in the repo calls
`smartAnimateAnimator.destroy()`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `npm install` | exit 0 |
| Tests | `npm test` | exit 0, all pass |
| Library build | `npm run build:library` | exit 0 |

`npm test` is added by plan 001. The install and build commands come from
`package.json`; they were not executed during planning.

## Scope

**In scope** (the only files you should modify):
- `src/library/components/effect/smartAnimate.js`
- `test/lifecycle.test.js` (create)

**Out of scope** (do NOT touch, even though they look related):
- `src/library/core/WebflowBits.js` — it also omits Smart Animate from its
  init and destroy lists, but that orchestrator is the showcase's and is under
  a separate decision. Do not edit it.
- `src/library/loader.js` — no change is needed there.
- The `SmartAnimate` class (animation behaviour, options, `destroy()`).
- Any other component, even ones missing `destroyElement`.

## Git workflow

- Branch: `advisor/003-smart-animate-lifecycle`
- One commit is fine. Message style: a short sentence, e.g.
  `Smart Animate: add initAll and destroyAll so the loader can start and stop it`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Write the failing test

Create `test/lifecycle.test.js`. It checks source text, because component
modules import GSAP and touch `document` and cannot be imported in plain Node:

```js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve(import.meta.dirname, "../src/library/components");
const files = fs
  .readdirSync(dir, { recursive: true })
  .filter((f) => f.endsWith(".js"))
  .map((f) => path.join(dir, f));

test("there are 30 component files", () => {
  assert.equal(files.length, 30);
});

// The loader starts a component with initAll() and stops it with destroyAll().
for (const method of ["initAll", "destroyAll"]) {
  test(`every component defines ${method}()`, () => {
    const missing = files
      .filter((f) => !new RegExp(`^\\s*(async\\s+)?${method}\\(`, "m").test(fs.readFileSync(f, "utf8")))
      .map((f) => path.basename(f));
    assert.deepEqual(missing, []);
  });
}
```

**Verify**: `npm test` → the two "every component defines …" tests fail, each
listing exactly `[ 'smartAnimate.js' ]`; all other tests pass.

### Step 2: Add the lifecycle methods

In `src/library/components/effect/smartAnimate.js`, inside
`SmartAnimateAnimator`:

1. Directly after `initElement(element) { … }`, add:

```js
  /**
   * Initialize SmartAnimate on every matching element in the document
   */
  initAll() {
    const elements = document.querySelectorAll('[wb-component="smart-animate"]');
    elements.forEach((element) => this.initElement(element));
  }
```

2. Replace the existing `destroy() { … }` method with these three (the old
   name is kept as an alias so existing callers keep working):

```js
  /**
   * Destroy the instance for a specific element
   * @param {HTMLElement} element - The element to clean up
   */
  destroyElement(element) {
    const instance = this.instances.get(element);
    if (!instance) return;
    instance.destroy();
    this.instances.delete(element);
  }

  /**
   * Destroy all instances
   */
  destroyAll() {
    Array.from(this.instances.keys()).forEach((element) =>
      this.destroyElement(element),
    );
  }

  /**
   * Destroy all instances (kept for backward compatibility)
   */
  destroy() {
    this.destroyAll();
  }
```

3. Replace the auto-init block at the bottom (the
   `document.addEventListener("DOMContentLoaded", …)` call and its comment)
   with:

```js
// Auto-initialize components with wb-component="smart-animate"
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      smartAnimateAnimator.initAll();
    });
  } else {
    // DOM already loaded, initialize immediately
    smartAnimateAnimator.initAll();
  }
}
```

`initElement` already returns early for an element it holds, so the loader
calling `initAll()` right after this block has run is harmless.

**Verify**: `npm test` → exit 0, all tests pass, including the two that failed
in Step 1.

**Verify**: `grep -c "initAll()" src/library/components/effect/smartAnimate.js`
→ prints `3` (the definition and the two calls in the auto-init block).

### Step 3: Confirm the bundle still builds

**Verify**: `npm install` (if `node_modules/` is absent) then
`npm run build:library` → exit 0.

## Test plan

- New file `test/lifecycle.test.js`, three tests (Step 1): the component count,
  and one per lifecycle method asserting no component file lacks it.
- Structural pattern: `test/registry.test.js` from plan 001.
- Verification: `npm test` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm test` exits 0; `test/lifecycle.test.js` contributes 3 passing tests
- [ ] `npm run build:library` exits 0
- [ ] `grep -c "^  initAll()\|^  destroyAll()\|^  destroyElement(element)" src/library/components/effect/smartAnimate.js` prints `3`
- [ ] `grep -n 'document.addEventListener("DOMContentLoaded"' src/library/components/effect/smartAnimate.js`
      shows exactly one match, and it is inside the `readyState === "loading"` branch
- [ ] `git diff --stat` shows only `src/library/components/effect/smartAnimate.js`
      and `test/lifecycle.test.js` (plus `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `npm test` does not exist (plan 001 has not landed).
- The code in `smartAnimate.js` doesn't match the "Current state" excerpt.
- In Step 1 the failing tests list any file other than `smartAnimate.js`, or
  the count test reports a number other than 30 (the component set has
  changed; the maintainer must decide what to do with the others).
- You are tempted to make destroyed elements visible again, or to edit
  `WebflowBits.js` — both are out of scope.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- Reaches CDN users only after the next library release.
- Not verified in a browser by this plan. A reviewer should load the built ES
  bundle (`<script type="module">import FlowBitz from "./dist/flowbitz.es.js"</script>`)
  on a page with a `wb-component="smart-animate"` block and confirm it reveals
  on scroll, then call `FlowBitz.destroy()` and confirm no ScrollTrigger for
  it remains (`ScrollTrigger.getAll()`).
- Known gap, left on purpose: `SmartAnimate.destroy()` does not restore
  visibility. An element destroyed before its reveal stays at `autoAlpha: 0`.
  Whether destroy should reveal content is a behaviour decision for the
  maintainer.
- `WebflowBits.js` (showcase and beta entry) still leaves Smart Animate out of
  its default init list and its `destroy()`; with this plan the module's own
  auto-init covers the showcase's first render.
