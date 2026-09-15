-- Kitapmeetup — 7. göç: İstanbul'daki kitapçı/kitap kafe/okumaya uygun kafeleri
-- uygulamaya bir mekan rehberi olarak taşıyoruz. 0001-0006'dan SONRA çalıştırın.
--
-- Mekanlar; etkinlik oluştururken seçilebilir, kulüpler kendine "sabit mekan"
-- seçebilir, üyeler not+puan bırakabilir, "şu an buradayım" ile check-in
-- yapabilir. "Haftanın Mekanı" bu check-in'lerden ve o hafta gerçekleşen
-- etkinliklerden dinamik olarak hesaplanır (uygulama tarafında, ayrı bir
-- tablo/iş gerekmez).

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  district text not null,
  kind text not null default 'kitap_kafe' check (kind in ('kitapci', 'kitap_kafe', 'okuma_dostu_kafe')),
  description text not null default '',
  maps_url text,
  added_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.venue_notes (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint check (rating between 1 and 5),
  body text not null default '',
  created_at timestamptz not null default now(),
  unique (venue_id, author_id)
);

create table if not exists public.venue_checkins (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists venue_notes_venue_idx on public.venue_notes (venue_id);
create index if not exists venue_checkins_venue_idx on public.venue_checkins (venue_id, created_at desc);

-- Kulübün "sabit buluşma mekanı" ve bir etkinliğin bağlı olduğu (varsa) mekan.
alter table public.clubs add column if not exists home_venue_id uuid references public.venues (id) on delete set null;
alter table public.events add column if not exists venue_id uuid references public.venues (id) on delete set null;

alter table public.venues enable row level security;
create policy "venues_select_all" on public.venues for select using (true);
create policy "venues_insert_auth" on public.venues for insert with check (auth.uid() = added_by);
create policy "venues_update_owner" on public.venues for update using (auth.uid() = added_by);
create policy "venues_delete_owner" on public.venues for delete using (auth.uid() = added_by);

alter table public.venue_notes enable row level security;
create policy "venue_notes_select_all" on public.venue_notes for select using (true);
create policy "venue_notes_write_self" on public.venue_notes for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

alter table public.venue_checkins enable row level security;
create policy "venue_checkins_select_all" on public.venue_checkins for select using (true);
create policy "venue_checkins_insert_self" on public.venue_checkins for insert with check (auth.uid() = user_id);
create policy "venue_checkins_delete_self" on public.venue_checkins for delete using (auth.uid() = user_id);
