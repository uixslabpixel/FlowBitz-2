# Plan 001: `npm test` exists and proves the published loader, the metadata and the version agree

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 5f0e001..HEAD -- package.json src/library/loader.js src/library/data/componentsMetadata.js src/library/core/WebflowBits.js README.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `5f0e001`, 2026-11-10

## Why this matters

FlowBitz has no test, lint or CI command, so nothing checks a change before it
is deployed. The component list is kept by hand in several files, and those
copies have already drifted: the published loader reports version 2.3.5 in the
2.4.5 release, one component's GSAP-requirements entry uses a different name
from its loader entry, and one metadata entry names a file that does not exist.
This plan adds a one-command check (`npm test`, no new dependencies) that
catches this class of drift, and fixes the three mismatches it finds today.
Plans 002 and 003 depend on `npm test` existing.

## Current state

FlowBitz is a plain-JavaScript (ES modules) animation library for Webflow plus
an Astro showcase site, in one repo. `package.json` has `"type": "module"`.

- `src/library/loader.js` — the entry of the **published** library bundle
  (`vite.config.library.js` builds it). It holds two hand-kept tables and a
  version constant.
- `src/library/data/componentsMetadata.js` — one entry per component (30),
  used to build the documentation pages. It has no imports and loads in Node.
- `src/library/core/WebflowBits.js` — the orchestrator the showcase site uses.
  Holds its own version string.
- `src/app/components/redesign/cardThemes.js` and
  `src/app/content/previewVideos.json` — per-component data for the site's
  home grid.
- There is no `test/` directory and no `test` script.

`package.json:3` and `:31-33`:

```json
  "version": "2.4.5",
```
```json
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && vite build --config vite.config.library.js",
```

`src/library/loader.js:12` and `:17` — the stale version:

```js
 * @version 2.3.5
```
```js
const VERSION = "2.3.5";
```

`src/library/loader.js:73` — the requirements table uses a name no component has:

```js
  "outline-gradient-animate": [], // CSS only, no GSAP needed
```

`src/library/loader.js:117-118` — the loader table (and the metadata, and the
`wb-component` attribute users write) use `outline-gradient`:

```js
  "outline-gradient": () =>
    import("./components/effect/outlineGradientAnimate.js"),
```

`src/library/loader.js:604-605` — the current exports (the last lines of the file):

```js
export default flowbitz;
export { FlowBitz, VERSION };
```

`src/library/data/componentsMetadata.js:1318-1322` — the `magnetic-button`
entry names `magnet.js`, but the file is
`src/library/components/button/magneticButton.js`:

```js
  'magnetic-button': {
```
```js
    file: 'magnet.js',
```

(The `file:` line is a few lines below the key; find it with
`grep -n "file: 'magnet.js'" src/library/data/componentsMetadata.js`.)

`src/library/core/WebflowBits.js:56` — already correct, the test only guards it:

```js
    this.version = '2.4.5';
```

`README.md:3` — already correct, the test only guards it:

```markdown
[![Version](https://img.shields.io/badge/version-2.4.5-blue.svg)](https://github.com/Slabpixel/FlowBitz)
```

Importing `src/library/loader.js` in Node is safe: its only top-level side
effect is inside `if (typeof window !== "undefined")`, and component modules
are loaded lazily through `import()` functions that this plan never calls.

Conventions to match: `loader.js` uses double quotes, semicolons and two-space
indentation. `componentsMetadata.js` uses single quotes for that entry — keep
the quote style of the line you edit.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Node version | `node -v` | `v22.12` or newer (Astro 7 needs it) |
| Tests | `npm test` | exit 0, all tests pass |

No install is needed for this plan: the test uses only Node built-ins and
files in the repo. These commands were checked during planning with Node
v22.23.4 by running the test file below against the repo (it reported exactly
the three failures this plan fixes).

## Scope

**In scope** (the only files you should modify):
- `package.json` (add one script)
- `test/registry.test.js` (create)
- `src/library/loader.js` (three small edits)
- `src/library/data/componentsMetadata.js` (one string)

**Out of scope** (do NOT touch, even though they look related):
- `src/library/data/componentsRegistry.js` and
  `src/library/core/ComponentRegistry.js` — they contain a second, broken copy
  of the component map. Whether to fix or delete them is an open decision for
  the maintainer; do not edit them and do not add tests for them.
- `src/library/core/WebflowBits.js` — do not change its component lists.
- `vite.config.*.js`, `astro.config.mjs` — the version stays a literal in the
  source; do not introduce build-time injection.
- Any lint, formatter, TypeScript or CI configuration.

## Git workflow

- Branch: `advisor/001-verification-baseline`
- One commit per step is fine. Message style in this repo is a short
  sentence, sometimes with an area prefix, e.g.
  `Recorder: pre-roll only for cursor effects` or
  `Keep Scramble Text from leaving a stray 0 before the first word`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Export the two tables from the loader

In `src/library/loader.js`, change the last line of the file from

```js
export { FlowBitz, VERSION };
```

to

```js
export { FlowBitz, VERSION, COMPONENT_LOADERS, COMPONENT_REQUIREMENTS };
```

Change nothing else in this step.

**Verify**: `node -e "import('./src/library/loader.js').then(m => console.log(Object.keys(m).sort().join(',')))"`
→ prints `COMPONENT_LOADERS,COMPONENT_REQUIREMENTS,FlowBitz,VERSION,default`

### Step 2: Add the test file and the script

Create `test/registry.test.js` with exactly this content:

```js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { COMPONENT_LOADERS, COMPONENT_REQUIREMENTS, VERSION } from "../src/library/loader.js";
import { componentsMetadata } from "../src/library/data/componentsMetadata.js";

const root = path.resolve(import.meta.dirname, "..");
const lib = path.join(root, "src/library");
const metaKeys = Object.keys(componentsMetadata).sort();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

// The path inside each `() => import("./components/…")` loader function.
const loaderPath = (name) =>
  COMPONENT_LOADERS[name].toString().match(/import\(\s*["'](\.\/components\/[^"']+)["']\s*\)/)[1];

test("loader.js has a loader for exactly the components in componentsMetadata.js", () => {
  assert.deepEqual(Object.keys(COMPONENT_LOADERS).sort(), metaKeys);
});

test("loader.js lists GSAP requirements for exactly the same components", () => {
  assert.deepEqual(Object.keys(COMPONENT_REQUIREMENTS).sort(), metaKeys);
});

test("every loader points at a file that exists", () => {
  for (const name of Object.keys(COMPONENT_LOADERS)) {
    assert.ok(fs.existsSync(path.join(lib, loaderPath(name))), `${name}: ${loaderPath(name)} is missing`);
  }
});

test("each metadata `file` matches the file its loader imports", () => {
  for (const name of metaKeys) {
    assert.equal(componentsMetadata[name].file, path.basename(loaderPath(name)), `${name}: metadata file is wrong`);
  }
});

test("card themes and preview videos only name real components", () => {
  const themes = read("src/app/components/redesign/cardThemes.js");
  const body = themes.slice(themes.indexOf("export const cardThemes = {"));
  const themeKeys = [...body.matchAll(/^  "?([a-z0-9-]+)"?: \{/gm)].map((m) => m[1]);
  assert.ok(themeKeys.length > 0, "no card themes parsed");
  const videos = JSON.parse(read("src/app/content/previewVideos.json"));
  for (const id of [...themeKeys, ...videos]) assert.ok(metaKeys.includes(id), `${id} is not a component`);
});

test("the version is the same everywhere", () => {
  const { version } = JSON.parse(read("package.json"));
  assert.equal(VERSION, version, "src/library/loader.js VERSION");
  assert.ok(read("src/library/core/WebflowBits.js").includes(`this.version = '${version}'`), "WebflowBits.js this.version");
  assert.ok(read("README.md").includes(`badge/version-${version}-`), "README.md version badge");
});
```

In `package.json`, add this line to `"scripts"`, directly after the `"dev"` line:

```json
    "test": "node --test \"test/**/*.test.js\"",
```

**Verify**: `npm test` → exits non-zero with **6 tests, 3 pass, 3 fail**. The
three failures must be exactly these (this proves the test sees real drift):
- "loader.js lists GSAP requirements…" — mentions `outline-gradient-animate`
- "each metadata `file` matches…" — `magnetic-button: metadata file is wrong`
- "the version is the same everywhere" — `src/library/loader.js VERSION`

### Step 3: Fix the three mismatches

1. `src/library/loader.js:73` — rename the key only:
   `"outline-gradient-animate": [], // CSS only, no GSAP needed`
   becomes
   `"outline-gradient": [], // CSS only, no GSAP needed`
2. `src/library/loader.js:12` and `:17` — change `2.3.5` to `2.4.5` in both
   the `@version` comment and the `VERSION` constant.
3. `src/library/data/componentsMetadata.js` — in the `'magnetic-button'`
   entry, change `file: 'magnet.js',` to `file: 'magneticButton.js',`.

**Verify**: `npm test` → exit 0, `# pass 6`, `# fail 0`.

**Verify**: `grep -n "outline-gradient-animate\|2\.3\.5" src/library/loader.js` → no output.

## Test plan

- The new file `test/registry.test.js` is the deliverable; it has six tests
  (listed in Step 2).
- There is no existing test to model after — this is the first one. Future
  tests go in `test/` and are named `*.test.js`.
- Verification: `npm test` → all 6 pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm test` exits 0 and reports 6 passing tests
- [ ] `grep -c '"test":' package.json` prints `1`
- [ ] `grep -n "2\.3\.5" src/library/loader.js` returns no matches
- [ ] `grep -n "outline-gradient-animate" src/library/loader.js` returns no matches
- [ ] `grep -n "magnet\.js" src/library/data/componentsMetadata.js` returns no matches
- [ ] `git status --short` lists only `package.json`, `test/registry.test.js`,
      `src/library/loader.js`, `src/library/data/componentsMetadata.js` (and
      `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the locations in "Current state" doesn't match the excerpts.
- After Step 2, `npm test` shows failures other than the three listed (a new
  drift has appeared; the maintainer must decide how to resolve it — do not
  "fix" it by editing the test).
- `node -v` is older than 22.12 (`import.meta.dirname` and glob support in
  `node --test` need a current Node 22).
- Importing `src/library/loader.js` in Node throws.
- Making a test pass appears to require editing a file listed as out of scope.

## Maintenance notes

- When a component is added, `npm test` now fails until `loader.js` (both
  tables) and `componentsMetadata.js` agree. That is the intended behaviour.
- When the version is bumped, update `package.json`, `src/library/loader.js`
  (comment and constant), `src/library/core/WebflowBits.js` and the README
  badge; the last test names whichever one was missed. `docs/VERSION.md` does
  not list `loader.js` in its checklist — worth adding there.
- Deferred on purpose: `componentsRegistry.js` / `ComponentRegistry.js` (a
  broken second registry, exported only from the beta entry
  `src/library/index.js`), lint/typecheck, and CI. A reviewer should confirm
  the test file was added verbatim and that no assertion was weakened.
