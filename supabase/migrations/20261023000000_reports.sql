-- Public bug reports & feature requests shown in the site's feedback popup.
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

create index reports_created_at_idx on public.reports (created_at desc);

alter table public.reports enable row level security;

-- Anyone can read the board and file a new report; only the team (service role / dashboard)
-- can change status, which is why inserts must arrive as 'open'.
create policy "reports are public" on public.reports
  for select to anon, authenticated using (true);

create policy "anyone can file an open report" on public.reports
  for insert to anon, authenticated with check (status = 'open' and cardinality(images) <= 4);

-- Screenshots pasted or dropped into the form.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-images', 'report-images', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "anyone can upload report images" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'report-images');
