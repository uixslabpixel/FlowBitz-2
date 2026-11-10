# Plan 005: We know what the `/latest`, `/beta` and `/vX.Y.Z` CDN URLs really serve, and the release scripts cannot half-publish

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 5f0e001..HEAD -- vercel.json scripts/create-version.js scripts/create-beta.js scripts/promote-beta.js vite.config.beta.js vite.config.library.js package.json`
> Plan 001 adds one `"test"` script line to `package.json`; that is expected.
> If anything else changed, compare the "Current state" excerpts against the
> live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW — this plan gathers evidence and hardens local scripts; it
  deliberately changes nothing that production serves
- **Depends on**: none
- **Category**: dx (investigation)
- **Planned at**: commit `5f0e001`, 2026-11-10

## Why this matters

FlowBitz tells users they can load the library from three channels on
flowbitz.dev: `/latest/…` (newest stable), `/beta/…` (pre-release) and
`/vX.Y.Z/…` (a pinned version). Reading the configuration, all three appear
to serve the same file — the current build at the site root — and the pinned
route marks it cacheable for a year as "immutable". If that is what happens,
a site that pins `/v2.3.0/` silently gets today's code, the beta channel
tests nothing, and a browser can hold a wrong copy for a year. This was read
from config only and was **not** confirmed against the live site, and it is
not certain that flowbitz.dev is even served by this repo's Vercel project.
Changing CDN routes blind could break customer sites, so this plan first
collects evidence and writes it down for the maintainer to decide on, and
separately fixes three local release-script defects that are safe to fix
whatever the decision.

## Current state

- `vercel.json` — routing and headers for the deployed site.
- `scripts/create-version.js`, `scripts/create-beta.js`,
  `scripts/promote-beta.js` — Node scripts run after a local library build;
  they copy bundles into `dist/vX.Y.Z/`, `dist/beta/` and point `dist/latest`
  at a version.
- `vite.config.library.js` — stable library build; entry
  `src/library/loader.js`; ES output is code-split into `dist/chunks/`.
- `vite.config.beta.js` — beta build; entry `src/library/index.js` (a
  different entry from stable); output `dist/beta-build/`.
- `dist/` is git-ignored, and there is no `.vercelignore`.

`vercel.json:5` — what Vercel runs when it builds:

```json
  "buildCommand": "npm run build",
```

`package.json` scripts involved:

```json
    "build": "astro build && vite build --config vite.config.library.js",
    "build:beta": "vite build --config vite.config.beta.js && npm run create-beta",
    "build:stable": "npm run build:library && npm run create-version",
    "deploy:beta": "npm run build:beta && npx vercel --prod",
    "deploy:stable": "rm -rf dist/index.html dist/assets … && npm run build:stable && npx vercel --prod",
    "deploy:promote": "npm run promote-beta && npx vercel --prod"
```

`npm run build` does not run `create-version` or `create-beta`. If
`npx vercel --prod` uploads the source and builds remotely (its default
without `--prebuilt`), the folders those scripts create locally never reach
production. That is the hypothesis to test.

`vercel.json:65-91` — the three channel routes:

```json
    {
      "src": "/v([0-9]+)\\.([0-9]+)\\.([0-9]+)/(.*)",
      "dest": "/$4",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Version": "$1.$2.$3",
        "Content-Type": "application/javascript"
      }
    },
    {
      "src": "/latest/(.*)",
      "dest": "/$1",
      "headers": {
        "Cache-Control": "public, max-age=3600",
        "X-Version": "latest",
        "Content-Type": "application/javascript"
      }
    },
    {
      "src": "/beta/(.*)",
      "dest": "/$1",
      "headers": {
        "Cache-Control": "public, max-age=300",
        "X-Version": "beta",
        "Content-Type": "application/javascript"
      }
    },
```

Each `dest` drops the channel folder, and each forces a JavaScript content
type on every file under it (including `.map` files).

`scripts/create-version.js:25-40` — a missing bundle is only a warning, and
`chunks/` is not copied although `flowbitz.es.js` imports `./chunks/…`:

```js
// Copy library files to versioned directory
const files = ['flowbitz.umd.js', 'flowbitz.es.js', 'flowbitz.umd.js.map'];
let copiedFiles = 0;

files.forEach(file => {
  const source = path.join(distDir, file);
  const dest = path.join(versionDir, file);
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log(`✅ Copied ${file} to v${version}`);
    copiedFiles++;
  } else {
    console.warn(`⚠️  Source file not found: ${file}`);
  }
});
```

Immediately after (`:42-56`) it deletes `dist/latest` and re-creates it as a
symlink to the new version — even when zero files were copied.

`scripts/create-beta.js:22-37` has the same copy loop (source
`dist/beta-build/`, destination `dist/beta/`). `scripts/promote-beta.js` has
the same loop at `:45-60` (source `betaDir`, destination `versionDir`; its
warning text is `Beta file not found`), then re-points `dist/latest`
(`:62-75`), and near the end of the file, under the comment
`// Clean up beta`, runs `fs.rmSync(betaDir, { recursive: true });`.

Script conventions: ES modules, single quotes, semicolons, two-space indent,
emoji-prefixed `console.log` progress lines, `process.exit(1)` on fatal
errors (see `create-version.js:54-56`).

Background from the repo's handoff notes (`context.md`): the current live
site for this repo is a Vercel project that is **not connected to git** and
is deployed by hand with `npm install && npm run build && npx vercel --prod`.
The public domain in the docs is `https://www.flowbitz.dev`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `npm install` | exit 0 |
| Stable build + version | `npm run build:stable` | exit 0; creates `dist/v2.4.5/` and `dist/latest` |
| Beta build | `npm run build:beta` | exit 0; creates `dist/beta/` |
| Headers of a URL | `curl -sI <url>` | prints the response status and headers |

The build commands come from `package.json`; they were not executed during
planning. They write only inside `dist/`, which is git-ignored.

## Scope

**In scope** (the only files you should modify):
- `plans/005-findings.md` (create) — the evidence and the decision table
- `scripts/create-version.js`
- `scripts/create-beta.js`
- `scripts/promote-beta.js`

**Out of scope** (do NOT touch, even though they look related):
- `vercel.json` — do not change any route or header. What to change depends
  on the evidence and is the maintainer's decision.
- `vite.config.beta.js`, `vite.config.library.js`, `package.json` scripts.
- **Any deploy.** Do not run `vercel`, any `deploy:*` script, or `npm publish`.
  Do not log in to anything.
- `README.md` and `docs/VERSION.md`, even where they describe the channels.

## Git workflow

- Branch: `advisor/005-cdn-channels`
- Two commits: the script changes, then the findings file. Message style: a
  short sentence, e.g. `Release scripts: fail when a bundle is missing`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Record what production serves

Run each command and save the full output. These are read-only requests for
public files.

```bash
for u in latest/flowbitz.umd.js beta/flowbitz.umd.js v2.4.5/flowbitz.umd.js v2.3.0/flowbitz.umd.js v0.0.1/flowbitz.umd.js flowbitz.umd.js latest/flowbitz.umd.js.map latest/flowbitz.es.js; do
  echo "== $u"; curl -sI "https://www.flowbitz.dev/$u" | grep -iE "^(HTTP|content-type|content-length|cache-control|etag|x-version|server|x-vercel-id|location)"
done
```

Then compare the bodies of four of them by hash:

```bash
for u in latest/flowbitz.umd.js beta/flowbitz.umd.js v2.4.5/flowbitz.umd.js v0.0.1/flowbitz.umd.js; do
  printf "%s  " "$u"; curl -sL "https://www.flowbitz.dev/$u" | sha256sum | cut -c1-16
done
```

`v0.0.1` is a version that was never released; whether it returns a file or a
404 is the key fact.

**Verify**: you have a status line for all eight URLs and a hash for all four.
If the network is unavailable, write "not reachable from this environment"
for this step in the findings file and continue with Step 2.

### Step 2: Record what a local build produces

```bash
npm install
npm run build:stable
ls -la dist/ dist/v2.4.5 dist/latest
ls dist/chunks | head
grep -o 'from"\./chunks/[^"]*"\|import("\./chunks/[^"]*")' dist/flowbitz.es.js | head -5
```

Note: whether `dist/v2.4.5/` contains a `chunks/` folder (expected: no), and
whether `dist/flowbitz.es.js` imports from `./chunks/` (expected: yes).

**Verify**: `test -L dist/latest && echo symlink` → prints `symlink`.

### Step 3: Make the scripts fail loudly and copy the chunks

Apply the same two changes to all three scripts
(`create-version.js`, `create-beta.js`, `promote-beta.js`):

1. Add `'flowbitz.es.js.map'` to the `files` array.
2. Replace the copy loop's `else` branch — the `console.warn(…)` — so that a
   missing source stops the script before anything else is changed:

```js
  } else {
    console.error(`❌ Source file not found: ${source}`);
    process.exit(1);
  }
```

3. Directly after the copy loop, copy the `chunks` folder when the source has
   one. In `create-version.js` the source folder is `distDir` and the
   destination is `versionDir`; in `create-beta.js` they are `betaBuildDir`
   and `betaDir`; in `promote-beta.js` use the same source and destination
   variables its copy loop uses:

```js
// The ES entry imports ./chunks/*, so the chunks must travel with it.
const chunksSource = path.join(<source dir variable>, 'chunks');
if (fs.existsSync(chunksSource)) {
  fs.cpSync(chunksSource, path.join(<destination dir variable>, 'chunks'), { recursive: true });
  console.log('✅ Copied chunks/');
}
```

Change nothing else in the scripts (leave the `latest` symlink logic, the
version info and the log lines as they are).

**Verify**: `grep -c "process.exit(1)" scripts/create-version.js scripts/create-beta.js scripts/promote-beta.js`
→ each count is at least 1 higher than before your change (check with
`git diff`).

**Verify**: `rm -rf dist/v2.4.5 && npm run build:stable && ls dist/v2.4.5`
→ exit 0 and the listing includes `chunks`, `flowbitz.es.js`,
`flowbitz.es.js.map`, `flowbitz.umd.js`, `flowbitz.umd.js.map`,
`version.json`.

**Verify** (failure path): `mv dist/flowbitz.umd.js /tmp/fb-umd.bak && node scripts/create-version.js; echo "exit=$?"; mv /tmp/fb-umd.bak dist/flowbitz.umd.js`
→ prints `❌ Source file not found:` and `exit=1`.

### Step 4: Write the findings

Create `plans/005-findings.md` with these sections, filled from Steps 1–2
(quote the raw command output in fenced blocks; do not summarise it away):

1. **What production serves** — the header table and the four hashes, and one
   sentence each answering: Are the four bodies identical? Does the
   never-released `v0.0.1` return 200? What `Cache-Control` and
   `Content-Type` do `/v2.4.5/…` and the `.map` file get? Does the response
   look like it comes from Vercel (`server` / `x-vercel-id` headers)?
2. **What the local scripts produce** — the `ls` output, and whether those
   folders could reach production given `buildCommand` is `npm run build`.
3. **Conclusion** — one of: "confirmed: all channels serve the root build",
   "not confirmed: …", or "could not test: …".
4. **Options for the maintainer** — copy this list as written, without
   choosing:
   - A. Keep one build for all channels, and say so: stop marking `/vX.Y.Z/`
     as immutable (use the same short cache as `/latest/`), drop the forced
     `Content-Type`, and point users who need a real pin to the npm-backed
     jsDelivr URLs the README already shows.
   - B. Make pins real by redirecting `/vX.Y.Z/<file>` to
     `https://cdn.jsdelivr.net/npm/flowbitz@X.Y.Z/dist/<file>` (requires each
     version to be published on npm).
   - C. Make pins real on flowbitz.dev by committing each release's bundles
     under `public/vX.Y.Z/` and rewriting `/vX.Y.Z/(.*)` to that folder.
   - D. Beta: either build it from the same entry as stable
     (`src/library/loader.js`) and actually serve `dist/beta/`, or remove the
     `/beta/` route and the beta scripts.

**Verify**: `test -s plans/005-findings.md && grep -c "^## \|^### \|^[0-9]\. \*\*" plans/005-findings.md`
→ the file exists and has at least four section headings.

## Test plan

- No unit tests: the scripts are verified by running them (Step 3's success
  and failure checks). The findings file is verified by a reviewer reading it.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `plans/005-findings.md` exists and contains the four sections
- [ ] `npm run build:stable` exits 0 and `ls dist/v2.4.5/chunks` lists files
- [ ] With `dist/flowbitz.umd.js` moved away, `node scripts/create-version.js`
      exits 1 (then restore the file)
- [ ] `git diff --stat -- vercel.json vite.config.beta.js vite.config.library.js package.json` prints nothing
- [ ] `git status --short` lists only the three scripts and
      `plans/005-findings.md` (plus `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the locations in "Current state" doesn't match the excerpts.
- Any step seems to need a Vercel login, a deploy, or an npm publish.
- `npm run build:stable` fails before you have changed anything (report the
  error; a broken build is its own finding).
- `promote-beta.js` does not have a copy loop shaped like the one in
  `create-version.js` (then leave that script alone and say so).
- Step 1 shows the channels serving **different** files — the hypothesis is
  wrong; still write the findings, but do not draw the conclusion for the
  maintainer.

## Maintenance notes

- Nothing here changes what users load. The follow-up is a second, small plan
  written after the maintainer picks from options A–D.
- Related, deliberately not touched: the beta build uses a different entry
  (`src/library/index.js`) from stable (`src/library/loader.js`), so promoting
  a beta would replace the stable loader with a different bundle shape.
- A reviewer should check the findings quote raw output, and that the scripts
  still log a success summary only when every file was copied.
