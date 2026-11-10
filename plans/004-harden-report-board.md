# Plan 004: The public report board only stores and shows what the form can produce

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 5f0e001..HEAD -- supabase/ src/app/components/redesign/ReportBoard.jsx src/shared/lib/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S–M
- **Risk**: LOW for the code; the SQL must be applied by the operator, not by you
- **Depends on**: plans/001-add-verification-baseline.md (for `npm test`)
- **Category**: security
- **Planned at**: commit `5f0e001`, 2026-11-10

## Why this matters

The FlowBitz site has a public board of bug reports and feature requests,
stored in a Supabase table that the browser writes to directly with the
public (anonymous) key. Because that key is public, anyone can skip the form
and insert rows through the API. The database currently checks very little:
the `images` column accepts any text, so a row can carry links that are not
uploaded screenshots at all, and the board renders each one as a clickable
link and an image for every visitor. A direct insert can also set its own
`created_at` (a future date pins the row to the top of the board), store
unbounded text in two columns, and add rows without limit. This plan makes the
database accept only what the real form sends, and makes the board render only
image links that point at the project's own screenshot bucket.

## Current state

- `supabase/migrations/20261023000000_reports.sql` — the only migration. It
  creates the table, its row-level-security policies and the storage bucket.
- `src/app/components/redesign/ReportBoard.jsx` — the form and the list.
- `src/shared/lib/supabase.js` — creates the client from two env vars.
- There is no Supabase CLI config in the repo (`supabase/` contains only
  `migrations/`), so migrations cannot be run locally from this checkout.

`supabase/migrations/20261023000000_reports.sql:2-13` and `:17-25`:

```sql
create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('bug', 'feature')),
  message     text not null check (char_length(message) between 1 and 5000),
  images      text[] not null default '{}',
  status      text not null default 'open'
              check (status in ('open', 'in_progress', 'on_hold', 'solved')),
  author_name text check (char_length(author_name) <= 80),
  page_url    text,
  component   text,
  created_at  timestamptz not null default now()
);
```
```sql
alter table public.reports enable row level security;

-- Anyone can read the board and file a new report; only the team (service role / dashboard)
-- can change status, which is why inserts must arrive as 'open'.
create policy "reports are public" on public.reports
  for select to anon, authenticated using (true);

create policy "anyone can file an open report" on public.reports
  for insert to anon, authenticated with check (status = 'open' and cardinality(images) <= 4);
```

There are no update or delete policies (good — leave that as it is).

`src/shared/lib/supabase.js` (whole file):

```js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// null when the env vars aren't set, so the UI can say so instead of crashing.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
```

`src/app/components/redesign/ReportBoard.jsx:27-33` — how a screenshot URL is
made (so a legitimate URL is always
`<VITE_SUPABASE_URL>/storage/v1/object/public/report-images/<uuid>.<png|jpeg|webp|gif>`):

```js
const uploadImage = async (file) => {
  const ext = file.type.split("/")[1] || "png";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
};
```

`ReportBoard.jsx:57-64` — the only columns the form sends:

```js
      const { error } = await supabase.from("reports").insert({
        type,
        message: message.trim(),
        images,
        author_name: anonymous ? null : name.trim() || null,
        page_url: window.location.pathname,
        component,
      });
```

`ReportBoard.jsx:206-212` — every stored value is rendered as a link and an image:

```jsx
                    {r.images.map((src) => (
                      <a key={src} href={src} target="_blank" rel="noreferrer">
                        <img src={src} alt="" loading="lazy" className="h-24 rounded-[4px] object-cover" />
                      </a>
                    ))}
```

`ReportBoard.jsx:244-255` — where rows are loaded:

```js
  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("id, message, images, status, author_name, created_at")
      .eq("type", type)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) console.error("Error loading reports:", error);
    setReports(data || []);
    setLoading(false);
  }, [type]);
```

Conventions: site code uses double quotes, semicolons, two-space indent, arrow
functions, and short `//` comments that say why. Shared helpers live in
`src/shared/lib/` (see `supabase.js`). SQL in the existing migration is
lower-case with a `--` comment above each block; migration files are named
`<UTC timestamp>_<name>.sql`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Tests | `npm test` | exit 0, all pass |
| Install | `npm install` | exit 0 |
| Site build | `npm run build:app` | exit 0 |

`npm test` is added by plan 001. `npm install` and `npm run build:app` come
from `package.json`; they were not executed during planning. There is no
command in this repo that applies SQL — see "Operator hand-off" below.

## Scope

**In scope** (the only files you should modify):
- `supabase/migrations/20261110000000_harden_reports.sql` (create)
- `src/shared/lib/reportImages.js` (create)
- `test/reportImages.test.js` (create)
- `src/app/components/redesign/ReportBoard.jsx` (two small edits)

**Out of scope** (do NOT touch, even though they look related):
- `supabase/migrations/20261023000000_reports.sql` — an applied migration is
  history; never edit it.
- **Any live database.** Do not run the SQL anywhere, do not install or run
  the Supabase CLI, do not look for or use database credentials.
- The storage upload policy (`"anyone can upload report images"`). Anonymous
  uploads to the bucket stay unlimited after this plan; fixing that needs a
  server-side upload step and is deferred (see Maintenance notes).
- The contact/feedback email form (`FeedbackModal.jsx`) — a different feature.
- The look of the board.

## Git workflow

- Branch: `advisor/004-harden-report-board`
- Commit per step is fine. Message style: a short sentence, e.g.
  `Report board: only render screenshots from our own bucket`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the URL check and its tests

Create `src/shared/lib/reportImages.js`:

```js
// Screenshots on the report board live in this public Supabase bucket. Anything else in a
// row's `images` did not come from the form, so the board must not link to it or load it.
const BUCKET_PATH = "/storage/v1/object/public/report-images/";

export const isReportImageUrl = (value, supabaseUrl) => {
  if (typeof value !== "string" || !supabaseUrl) return false;
  try {
    const url = new URL(value);
    return url.origin === new URL(supabaseUrl).origin && url.pathname.startsWith(BUCKET_PATH);
  } catch {
    return false;
  }
};
```

Create `test/reportImages.test.js`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { isReportImageUrl } from "../src/shared/lib/reportImages.js";

const BASE = "https://abcdefgh.supabase.co";
const OK = `${BASE}/storage/v1/object/public/report-images/0b9f6c1e-1111-4222-8333-444455556666.png`;

test("accepts a screenshot in the project's report-images bucket", () => {
  assert.equal(isReportImageUrl(OK, BASE), true);
});

test("rejects other hosts, other buckets and non-http schemes", () => {
  const rejected = [
    "https://example.com/storage/v1/object/public/report-images/a.png",
    `${BASE}/storage/v1/object/public/other-bucket/a.png`,
    `${BASE}.example.com/storage/v1/object/public/report-images/a.png`,
    "javascript:void(0)",
    "data:image/png;base64,AAAA",
    "/storage/v1/object/public/report-images/a.png",
    "",
    null,
    undefined,
    42,
  ];
  for (const value of rejected) assert.equal(isReportImageUrl(value, BASE), false, String(value));
});

test("rejects everything when the Supabase URL is not configured", () => {
  assert.equal(isReportImageUrl(OK, undefined), false);
  assert.equal(isReportImageUrl(OK, ""), false);
});
```

**Verify**: `npm test` → exit 0; the three new tests pass.

### Step 2: Filter images when the board loads

In `src/app/components/redesign/ReportBoard.jsx`:

1. Add this import directly below the existing
   `import { supabase } from "../../../shared/lib/supabase";` line:

```js
import { isReportImageUrl } from "../../../shared/lib/reportImages";
```

2. In `load`, replace the line `setReports(data || []);` with:

```js
    // Only show screenshots from our own bucket; a row inserted around the form can hold any text.
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    setReports(
      (data || []).map((r) => ({
        ...r,
        images: (r.images || []).filter((src) => isReportImageUrl(src, supabaseUrl)),
      })),
    );
```

Change nothing in the JSX.

**Verify**: `grep -c "isReportImageUrl" src/app/components/redesign/ReportBoard.jsx` → prints `2`.

**Verify**: `npm install` (if `node_modules/` is absent) then `npm run build:app` → exit 0.

### Step 3: Write the migration (do not apply it)

Create `supabase/migrations/20261110000000_harden_reports.sql` with exactly:

```sql
-- Tighten what an anonymous insert into public.reports may contain. The public key lets
-- anyone call the API directly, so the form's own limits have to live here too.

-- 1. Screenshots must be files in this project's public report-images bucket, named the way
--    the form names them (<uuid>.<ext>). Assumes the project is served from *.supabase.co.
create function public.report_images_valid(imgs text[]) returns boolean
  language sql immutable
as $$
  select coalesce(
    bool_and(i ~ '^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/report-images/[A-Za-z0-9-]+\.[a-z0-9]+$'),
    true)
  from unnest(imgs) as i
$$;

-- "not valid": enforce on new rows without failing on rows that already exist.
alter table public.reports
  add constraint reports_images_valid
    check (public.report_images_valid(images)) not valid,
  add constraint reports_page_url_length
    check (page_url is null or char_length(page_url) <= 300) not valid,
  add constraint reports_component_length
    check (component is null or char_length(component) <= 80) not valid;

-- 2. Callers may only set the columns the form sends. id, status and created_at always take
--    their defaults, so a report cannot be back- or forward-dated.
revoke insert on public.reports from anon, authenticated;
grant insert (type, message, images, author_name, page_url, component)
  on public.reports to anon, authenticated;

-- 3. A site-wide cap so the board cannot be flooded: at most 20 new reports per 10 minutes.
--    This is a blunt limit shared by everyone; remove this block if a per-visitor limit
--    (captcha or an edge function) replaces it.
create function public.reports_rate_limit() returns trigger
  language plpgsql security definer set search_path = public
as $$
begin
  if (select count(*) from public.reports
      where created_at > now() - interval '10 minutes') >= 20 then
    raise exception 'Too many reports right now. Please try again in a few minutes.';
  end if;
  return new;
end
$$;

create trigger reports_rate_limit
  before insert on public.reports
  for each row execute function public.reports_rate_limit();
```

**Verify**: `ls supabase/migrations` → lists exactly
`20261023000000_reports.sql` and `20261110000000_harden_reports.sql`.

**Verify**: `git diff --stat -- supabase/migrations/20261023000000_reports.sql` → no output.

## Operator hand-off (not for the executor)

After review, a person with access to the Supabase project applies
`20261110000000_harden_reports.sql` (SQL editor, or `supabase db push` from a
linked checkout). Before applying, confirm `VITE_SUPABASE_URL` is of the form
`https://<ref>.supabase.co`; with a custom domain the pattern in block 1 must
be changed first or every report with a screenshot will be rejected. After
applying, check on the live site: a report with a screenshot can be filed and
appears on the board; then, with the anon key in an API client, an insert that
sets `created_at`, and one whose `images` holds an arbitrary URL, are both
refused.

To undo: `drop trigger reports_rate_limit on public.reports; drop function
public.reports_rate_limit(); alter table public.reports drop constraint
reports_images_valid, drop constraint reports_page_url_length, drop constraint
reports_component_length; drop function public.report_images_valid(text[]);
grant insert on public.reports to anon, authenticated;`

## Test plan

- New file `test/reportImages.test.js`, three tests (Step 1): accepts a real
  screenshot URL; rejects other hosts, buckets, look-alike hosts, non-http
  schemes, relative paths and non-strings; rejects everything when the base
  URL is missing.
- Structural pattern: `test/registry.test.js` from plan 001.
- The SQL has no automated test in this repo; it is verified by the operator
  hand-off checks above.
- Verification: `npm test` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm test` exits 0; `test/reportImages.test.js` contributes 3 passing tests
- [ ] `npm run build:app` exits 0
- [ ] `grep -c "isReportImageUrl" src/app/components/redesign/ReportBoard.jsx` prints `2`
- [ ] `grep -c "not valid" supabase/migrations/20261110000000_harden_reports.sql` prints `4`
      (three constraints and one comment)
- [ ] `git diff --stat -- supabase/migrations/20261023000000_reports.sql` prints nothing
- [ ] `git status --short` lists only the four in-scope files (plus `plans/README.md`)
- [ ] `plans/README.md` status row updated, with the note "SQL not yet applied"

## STOP conditions

Stop and report back (do not improvise) if:

- `npm test` does not exist (plan 001 has not landed).
- The code at the locations in "Current state" doesn't match the excerpts —
  in particular if the form now sends columns other than the six listed, or
  builds screenshot URLs differently (the grant and the pattern would then
  reject real reports).
- A second migration already exists in `supabase/migrations/` that touches
  `public.reports`.
- Anything in the task seems to require database credentials, the Supabase
  CLI, or running SQL.
- `npm run build:app` fails for a reason unrelated to your change.

## Maintenance notes

- The client filter (Step 2) protects visitors as soon as the site is
  deployed, even before the SQL is applied, and also hides any bad rows that
  already exist. The SQL stops new bad rows from being stored.
- If the form ever sends a new column, add it to the `grant insert (…)` list
  in a new migration, or inserts will fail with a permission error.
- The rate limit is global, so a burst from one sender delays everyone's
  reports for up to ten minutes. It trades a flooded board for a briefly
  closed one; revisit if it bites.
- Deferred: anonymous uploads to the public `report-images` bucket are still
  unlimited and are not tied to a report (the upload happens before the row
  exists). Closing that needs uploads to go through a server-side function
  with a captcha or signed upload URLs, plus cleanup of unreferenced files.
- A reviewer should check that the pattern in block 1 matches a real stored
  URL from the live table before the SQL is applied.
