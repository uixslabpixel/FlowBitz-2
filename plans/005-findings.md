# Plan 005 findings: what the CDN channels really serve

Collected 2026-11-11 from a read-only probe of https://www.flowbitz.dev and a
local build.

## 1. What production serves

Raw output of the header probe (`curl -sI`, filtered to the relevant headers;
the `HTTP/1.1 200 Connection Established` line is the agent proxy's CONNECT
reply, not the site's):

```
== latest/flowbitz.umd.js
HTTP/2 200 
cache-control: public, max-age=3600
content-type: application/javascript; charset=utf-8
etag: "302543f8537c09bff008c1052b0e8ac6"
server: Vercel
x-vercel-id: iad1::7zvnl-1794368594310-93403c08bd4e
x-version: latest
content-length: 424402
== beta/flowbitz.umd.js
HTTP/2 200 
cache-control: public, max-age=300
content-type: application/javascript; charset=utf-8
etag: "302543f8537c09bff008c1052b0e8ac6"
server: Vercel
x-vercel-id: iad1::5zh84-1794368594772-7fdeeb521856
x-version: beta
content-length: 424402
== v2.4.5/flowbitz.umd.js
HTTP/2 200 
cache-control: public, max-age=31536000, immutable
content-type: application/javascript; charset=utf-8
etag: "302543f8537c09bff008c1052b0e8ac6"
server: Vercel
x-vercel-id: iad1::qcgt7-1794368594998-1d8ff732bc15
x-version: 2.4.5
content-length: 424402
== v2.3.0/flowbitz.umd.js
HTTP/2 200 
cache-control: public, max-age=31536000, immutable
content-type: application/javascript; charset=utf-8
etag: "302543f8537c09bff008c1052b0e8ac6"
server: Vercel
x-vercel-id: iad1::t92m4-1794368595149-981a1f67a46a
x-version: 2.3.0
content-length: 424402
== v0.0.1/flowbitz.umd.js
HTTP/2 200 
cache-control: public, max-age=31536000, immutable
content-type: application/javascript; charset=utf-8
etag: "302543f8537c09bff008c1052b0e8ac6"
server: Vercel
x-vercel-id: iad1::rdbpr-1794368595458-10dcec3b965f
x-version: 0.0.1
content-length: 424402
== flowbitz.umd.js
HTTP/2 301 
cache-control: public, max-age=3600
content-type: text/plain
location: /latest/flowbitz.umd.js
server: Vercel
x-vercel-id: iad1::4smd7-1794368595675-0f015cb3223f
== latest/flowbitz.umd.js.map
HTTP/2 200 
cache-control: public, max-age=3600
content-type: application/javascript; charset=utf-8
etag: "d0d6b90be4f25a18088306ff95b005af"
server: Vercel
x-vercel-id: iad1::bsx59-1794368595900-f135eb216369
x-version: latest
content-length: 1601717
== latest/flowbitz.es.js
HTTP/2 200 
cache-control: public, max-age=3600
content-type: application/javascript; charset=utf-8
etag: "1d938e509642d6768f169b1747be1b05"
server: Vercel
x-vercel-id: iad1::8bd5h-1794368596232-b2d88d18a356
x-version: latest
content-length: 17191
```

Body hashes (first 16 hex chars of sha256 of the followed response body):

```
latest/flowbitz.umd.js  12ce252fe2cdc178
beta/flowbitz.umd.js  12ce252fe2cdc178
v2.4.5/flowbitz.umd.js  12ce252fe2cdc178
v0.0.1/flowbitz.umd.js  12ce252fe2cdc178
```

- Are the four bodies identical? Yes: all four hash to `12ce252fe2cdc178`
  (and share one ETag and content-length 424402).
- Does the never-released `v0.0.1` return 200? Yes, 200, with the same body
  and `cache-control: public, max-age=31536000, immutable`.
- `/v2.4.5/…` gets `cache-control: public, max-age=31536000, immutable` and
  `content-type: application/javascript; charset=utf-8`. The `.map` file
  (requested via `/latest/`) gets `application/javascript; charset=utf-8`
  too, i.e. the forced type applies to source maps.
- Does it look like Vercel? Yes: `server: Vercel` and an `x-vercel-id`
  (`iad1::…`) on every response.
- Side observation: the live `/latest/flowbitz.umd.js` is 424402 bytes; the
  local build below produces 425279 bytes, so production is not byte-for-byte
  this checkout's current build.

## 2. What the local scripts produce

Before the script changes, `npm run build:stable` exited 0 and produced:

```
dist/v2.4.5:
-rw-r--r--  1 root root   17241 flowbitz.es.js
-rw-r--r--  1 root root  425279 flowbitz.umd.js
-rw-r--r--  1 root root 1607895 flowbitz.umd.js.map
-rw-r--r--  1 root root     156 version.json
dist/latest -> v2.4.5   (symlink; `test -L dist/latest` printed "symlink")
```

`dist/v2.4.5/` had no `chunks/` folder, no `flowbitz.es.js.map`, while
`dist/chunks/` exists and `dist/flowbitz.es.js` contains
`import("./chunks/components/splitText-DAB5Fo0j.js")` and similar. So a
versioned `flowbitz.es.js` copied by the old script could not load its
chunks from its own folder.

Could those folders reach production? `vercel.json` has
`"buildCommand": "npm run build"`, which runs `astro build && vite build
--config vite.config.library.js` and does not run `create-version` or
`create-beta`. A remote Vercel build (the default for `npx vercel --prod`
without `--prebuilt`) therefore would not contain `dist/vX.Y.Z/` or
`dist/beta/`. The probe in section 1 is consistent with that: every channel
returns the root build. This step did not inspect the Vercel project
settings, so how the live deploy was actually produced is not known.

After the script changes (same build), `dist/v2.4.5/` contains `chunks`,
`flowbitz.es.js`, `flowbitz.es.js.map`, `flowbitz.umd.js`,
`flowbitz.umd.js.map`, `version.json`. With `dist/flowbitz.umd.js` moved away,
`node scripts/create-version.js` printed `❌ Source file not found: …` and
exited 1.

## 3. Conclusion

Confirmed: all channels serve the root build. `/latest/`, `/beta/`,
`/v2.4.5/`, `/v2.3.0/` and the never-released `/v0.0.1/` return identical
bytes, and every `/vX.Y.Z/` response is marked cacheable for a year as
immutable.

## 4. Options for the maintainer

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
