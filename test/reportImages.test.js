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
