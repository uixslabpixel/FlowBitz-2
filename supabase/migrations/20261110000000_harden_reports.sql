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
