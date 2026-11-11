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
