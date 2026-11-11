# Plan 002: Elements added to the page after a component has loaded are initialised

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 5f0e001..HEAD -- src/library/loader.js`
> Plan 001 edits this file (lines 12, 17, 73 and the last line). Those changes
> are expected. If anything else changed, compare the "Current state" excerpts
> against the live code before proceeding; on a mismatch, treat it as a STOP
> condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-add-verification-baseline.md
- **Category**: bug
- **Planned at**: commit `5f0e001`, 2026-11-10

## Why this matters

FlowBitz is an animation library people add to Webflow sites with one script
tag; elements opt in with a `wb-component="…"` attribute. The published loader
watches the page for new elements, but when the component's code is already
loaded it returns early and never initialises them. So only the elements
present when a component first loads ever animate: a second `split-text`
heading that arrives later (CMS "load more", a tab or modal that renders late,
a page-transition library swapping the body) stays static. This plan makes the
loader initialise late-arriving elements, and makes two simultaneous requests
for the same component share one load.

## Current state

- `src/library/loader.js` — entry of the published bundle. The `FlowBitz`
  class is in this file; a singleton is created at the bottom.
- Each component module's default export is an "animator" object. All 30 have
  `this.instances` (a `Map` or `WeakMap` keyed by element) and guard against
  double initialisation with `this.instances.has(element)`. 29 have
  `initElement(element)`; all have `initAll()` except Smart Animate (plan 003
  adds it). Example, `src/library/components/effect/3dCardHover.js:199-210`:

```js
  initElement(element) {
    if (this.instances.has(element)) return this.instances.get(element);
    const config = this.parseConfig(element);
    const instance = new Hover3DCard(element, config, this.instances);
    this.instances.set(element, instance);
    return instance;
  };

  initAll() {
    const elements = document.querySelectorAll('[wb-component="3d-card-hover"]');
    elements.forEach((el) => this.initElement(el));
  };
```

  Some components log a warning when `initElement` is called on an element
  they already hold (`splitText.js:263-266`), which is why this plan skips
  known elements instead of calling `initAll()` again.

`src/library/loader.js:275-293` (line numbers at the planned commit; the class
constructor):

```js
class FlowBitz {
  constructor() {
    this.modules = {};
    this.loading = new Set();
    this.initialized = new Set();
    this.observers = [];
```

`src/library/loader.js:364-369` — the early return that causes the bug:

```js
  async load(componentName) {
    // Already loading or loaded
    if (this.loading.has(componentName) || this.modules[componentName]) {
      return this.modules[componentName];
    }
```

While a load is in flight this returns `undefined`, so a caller such as
`initOn()` (`:486-492`) logs "not loaded" and does nothing.

`src/library/loader.js:370-420` — the rest of `load()`: it checks
`COMPONENT_LOADERS[componentName]`, adds the name to `this.loading`, awaits
`loadRequiredGSAP(componentName, this.config.debug)`, records GSAP stats,
runs `const module = await COMPONENT_LOADERS[componentName]();`, stores
`module.default` in `this.modules[componentName]`, calls
`component.initAll()` if it exists, removes the name from `this.loading`, and
returns the component. On error it logs, removes the name from
`this.loading`, and returns `null`.

`src/library/loader.js:426-477` — the observer:

```js
  setupObserver() {
    const observer = new MutationObserver(async (mutations) => {
      const componentsToLoad = new Set();

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the node itself has the attribute
              const componentName = node.getAttribute?.(ATTR_PREFIX);
              if (componentName && COMPONENT_LOADERS[componentName]) {
                componentsToLoad.add(componentName);
              }

              // Check children
              const elements = node.querySelectorAll?.(`[${ATTR_PREFIX}]`);
              elements?.forEach((el) => {
                const name = el.getAttribute(ATTR_PREFIX);
                if (COMPONENT_LOADERS[name]) {
                  componentsToLoad.add(name);
                }
              });
            }
          });
        }
      });

      // Load newly detected components
      if (componentsToLoad.size > 0) {
        if (this.config.debug) {
          console.log(
            "🔄 New components detected:",
            Array.from(componentsToLoad),
          );
        }

        for (const name of componentsToLoad) {
          await this.load(name);
        }
      }
    });
```

The lines after this (the comment about watching `<html>` and the
`observer.observe(document.documentElement, …)` call) are a deliberate fix and
must stay exactly as they are.

`src/library/loader.js:340-356` — `detectAndLoad()` also reads
`COMPONENT_LOADERS[componentName]`.

`loadRequiredGSAP` (`:239-270`) returns immediately when a component name has
no entry in `COMPONENT_REQUIREMENTS`, so tests can use made-up component names
without touching the network or the DOM.

Conventions: double quotes, semicolons, two-space indent, JSDoc block above
each method. Debug logs are wrapped in `if (this.config.debug)`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `npm install` | exit 0 |
| Tests | `npm test` | exit 0, all pass |
| Library build | `npm run build:library` | exit 0; `dist/flowbitz.es.js` and `dist/flowbitz.umd.js` written |

`npm test` is added by plan 001. `npm install` and `npm run build:library`
come from `package.json` and the README; they were not executed during
planning (dependencies were not installed in the planning environment).

## Scope

**In scope** (the only files you should modify):
- `src/library/loader.js`
- `test/loader.test.js` (create)

**Out of scope** (do NOT touch, even though they look related):
- Anything under `src/library/components/` — do not add or change
  `initElement`/`initAll` in any component here (Smart Animate is plan 003).
- `src/library/core/WebflowBits.js` — a separate orchestrator with its own
  observer, used by the showcase site only.
- The GSAP loading functions in `loader.js` (`loadGSAPModule`,
  `loadRequiredGSAP`, `GSAP_CDN`) — a known separate issue; leave them alone.
- Handling of **removed** nodes — not part of this plan.
- The `observer.observe(document.documentElement, …)` call and its comment.

## Git workflow

- Branch: `advisor/002-init-added-elements`
- Commit per step or as one commit. Message style: a short sentence, e.g.
  `Loader: initialise elements added after their component loaded`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Make the loader table injectable and share in-flight loads

In `src/library/loader.js`:

1. Change the constructor signature to `constructor(loaders = COMPONENT_LOADERS)`
   and add two fields at the top of its body:

```js
    this.loaders = loaders;
    this.loadPromises = new Map();
```

2. Replace every `COMPONENT_LOADERS[…]` lookup **inside the `FlowBitz` class**
   with `this.loaders[…]` (in `detectAndLoad`, `load`, and the observer). The
   table definition itself and the `export { … }` line stay as they are.

3. Split `load()` in two. The public method becomes:

```js
  async load(componentName) {
    // Already loaded
    if (this.modules[componentName]) {
      return this.modules[componentName];
    }

    // Already loading: share the same promise
    if (this.loadPromises.has(componentName)) {
      return this.loadPromises.get(componentName);
    }

    // Check if component exists
    if (!this.loaders[componentName]) {
      console.warn(`⚠️ FlowBitz: Component "${componentName}" not found`);
      return null;
    }

    const promise = this.loadComponent(componentName).finally(() => {
      this.loadPromises.delete(componentName);
    });
    this.loadPromises.set(componentName, promise);
    return promise;
  }
```

   Move the rest of the old body (from `this.loading.add(componentName);`
   through the `try { … } catch { … }` block) unchanged into a new method
   `async loadComponent(componentName)` placed directly below, with a JSDoc
   comment. Keep `this.loading` add/delete exactly as it was.

4. In `destroy()`, next to `this.loading.clear();`, add
   `this.loadPromises.clear();`.

**Verify**: `npm test` → exit 0 (plan 001's six tests still pass).

**Verify**: `grep -c "COMPONENT_LOADERS\[" src/library/loader.js` → prints `0`.

### Step 2: Initialise added elements

Add this method to the `FlowBitz` class, directly above `setupObserver()`:

```js
  /**
   * Load the components for elements that were added to the page, and
   * initialise any element its component does not hold yet.
   * @param {Map<string, Set<Element>>} elementsByComponent
   */
  async initAddedElements(elementsByComponent) {
    for (const [name, elements] of elementsByComponent) {
      const component = await this.load(name);
      if (!component) continue;

      const pending = Array.from(elements).filter(
        (el) => el.isConnected && !component.instances?.has?.(el),
      );
      if (pending.length === 0) continue;

      if (typeof component.initElement === "function") {
        pending.forEach((el) => component.initElement(el));
      } else if (typeof component.initAll === "function") {
        component.initAll();
      }
    }
  }
```

Rewrite the observer callback in `setupObserver()` to collect elements per
component and hand them to that method. The body between
`const observer = new MutationObserver(async (mutations) => {` and the closing
`});` of the callback becomes:

```js
      const elementsByComponent = new Map();
      const collect = (el) => {
        const name = el.getAttribute?.(ATTR_PREFIX);
        if (!name || !this.loaders[name]) return;
        if (!elementsByComponent.has(name)) elementsByComponent.set(name, new Set());
        elementsByComponent.get(name).add(el);
      };

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              collect(node);
              node.querySelectorAll?.(`[${ATTR_PREFIX}]`).forEach(collect);
            }
          });
        }
      });

      if (elementsByComponent.size > 0) {
        if (this.config.debug) {
          console.log(
            "🔄 New components detected:",
            Array.from(elementsByComponent.keys()),
          );
        }

        await this.initAddedElements(elementsByComponent);
      }
```

Do not change anything after the callback (the `<html>` comment,
`observer.observe(…)`, `this.observers.push(observer)`).

**Verify**: `grep -n "initAddedElements" src/library/loader.js` → exactly two
lines (the definition and the call).

### Step 3: Add tests

Create `test/loader.test.js`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { FlowBitz } from "../src/library/loader.js";

// A stand-in for a component module. Real ones have the same shape.
const fakeComponent = () => {
  const component = {
    instances: new Map(),
    initAllCalls: 0,
    initAll() {
      this.initAllCalls += 1;
    },
    initElement(el) {
      this.instances.set(el, true);
    },
  };
  return component;
};

const fakeLoader = (component) => {
  const loader = async () => {
    loader.calls += 1;
    return { default: component };
  };
  loader.calls = 0;
  return loader;
};

test("an element added after its component loaded is initialised", async () => {
  const component = fakeComponent();
  const fb = new FlowBitz({ fake: fakeLoader(component) });
  await fb.load("fake");

  const el = { isConnected: true };
  await fb.initAddedElements(new Map([["fake", new Set([el])]]));

  assert.ok(component.instances.has(el));
  assert.equal(component.initAllCalls, 1, "initAll runs once, at load");
});

test("an element the component already holds is not initialised again", async () => {
  const component = fakeComponent();
  let calls = 0;
  component.initElement = () => {
    calls += 1;
  };
  const el = { isConnected: true };
  component.instances.set(el, true);
  const fb = new FlowBitz({ fake: fakeLoader(component) });

  await fb.initAddedElements(new Map([["fake", new Set([el])]]));

  assert.equal(calls, 0);
});

test("an element that has left the page is skipped", async () => {
  const component = fakeComponent();
  const fb = new FlowBitz({ fake: fakeLoader(component) });
  const el = { isConnected: false };

  await fb.initAddedElements(new Map([["fake", new Set([el])]]));

  assert.equal(component.instances.has(el), false);
});

test("a component without initElement falls back to initAll", async () => {
  const component = fakeComponent();
  delete component.initElement;
  const fb = new FlowBitz({ fake: fakeLoader(component) });
  await fb.load("fake");

  await fb.initAddedElements(new Map([["fake", new Set([{ isConnected: true }])]]));

  assert.equal(component.initAllCalls, 2);
});

test("two loads of the same component at once share one import", async () => {
  const component = fakeComponent();
  const loader = fakeLoader(component);
  const fb = new FlowBitz({ fake: loader });

  const [a, b] = await Promise.all([fb.load("fake"), fb.load("fake")]);

  assert.equal(a, component);
  assert.equal(b, component);
  assert.equal(loader.calls, 1);
});

test("an unknown component resolves to null", async () => {
  const fb = new FlowBitz({});
  const original = console.warn;
  console.warn = () => {};
  try {
    assert.equal(await fb.load("nope"), null);
  } finally {
    console.warn = original;
  }
});
```

**Verify**: `npm test` → exit 0, 12 tests pass (6 from plan 001 + 6 new).

### Step 4: Confirm the bundle still builds

**Verify**: `npm install` (if `node_modules/` is absent) then
`npm run build:library` → exit 0, and
`ls dist/flowbitz.es.js dist/flowbitz.umd.js` lists both files.

## Test plan

- New file `test/loader.test.js`, six tests (Step 3): late element is
  initialised; known element is skipped; disconnected element is skipped;
  fallback to `initAll`; concurrent loads share one import; unknown component.
- Structural pattern: `test/registry.test.js` from plan 001 (`node:test` +
  `node:assert/strict`).
- Verification: `npm test` → 12 passing.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm test` exits 0 with 12 passing tests
- [ ] `npm run build:library` exits 0
- [ ] `grep -c "COMPONENT_LOADERS\[" src/library/loader.js` prints `0`
- [ ] `grep -c "this.loading.has(componentName) ||" src/library/loader.js` prints `0`
- [ ] `git diff --stat` shows only `src/library/loader.js` and
      `test/loader.test.js` (plus `plans/README.md`); `dist/` is git-ignored
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `npm test` does not exist or plan 001's tests fail before you start (plan
  001 has not landed).
- The code at the locations in "Current state" doesn't match the excerpts,
  beyond plan 001's four edits.
- A step's verification fails twice after a reasonable fix attempt.
- `npm run build:library` fails for a reason unrelated to your change (report
  the error; do not change build configuration).
- You find a component whose default export has no `instances` property — the
  skip logic relies on it; report which one.

## Maintenance notes

- This reaches people using the CDN script only after the next library
  release. It cannot be seen on the showcase site, which uses
  `WebflowBits.js`, not the loader.
- Not verified in a browser by this plan. A reviewer should load the built
  `dist/flowbitz.umd.js` on a test page, append a second
  `<h2 wb-component="split-text">` from the console after load, and confirm it
  animates; and confirm an element that a canvas background re-wraps is not
  initialised twice (the `instances.has` skip covers this).
- The four canvas backgrounds (`star-field`, `firefly-background`,
  `particles-network`, `flow-field`) also run their own observers; with this
  change both paths may see a new element, and the per-element guard makes the
  second a no-op.
- Deferred: destroying instances when their elements are removed; the
  constructor parameter is for tests and is not a documented public option.
