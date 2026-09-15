-- Kitapmeetup — 12. göç: Topluluğun ortak Instagram hesabına (Instagram
-- Graph API üzerinden) etkinlik/gönderi paylaşımı. TEK bir resmi hesap
-- bağlanır (site yöneticisi tarafından, bir kere) — her kulüp yöneticisi
-- kendi hesabını bağlamaz, "Instagram'da paylaş" dediğinde içerik hep bu
-- ortak hesaba gider. 0001-0011'den SONRA çalıştırın.
--
-- ÖNEMLİ: access_token çok hassas bir alan. Bu tabloyu UYGULAMA KODUNDA
-- yalnızca sunucu tarafından (Server Action / Route Handler) okuyun, asla
-- bir Client Component'e prop olarak geçirmeyin — RLS "yönetici okuyabilir"
-- der ama tarayıcıya asla göndermemek bizim disiplinimiz olmalı.

create table if not exists public.instagram_connections (
  id uuid primary key default gen_random_uuid(),
  ig_user_id text not null,
  ig_username text,
  page_id text not null,
  access_token text not null,
  token_expires_at timestamptz,
  connected_by uuid references public.profiles (id) on delete set null,
  connected_at timestamptz not null default now()
);

-- Ne zaman, hangi etkinlik/gönderi Instagram'a gönderildi — geçmiş +
-- "zaten paylaşıldı mı" kontrolü için.
create table if not exists public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('event', 'post')),
  source_id uuid not null,
  ig_media_id text,
  ig_permalink text,
  status text not null default 'pending' check (status in ('pending', 'published', 'failed')),
  error text,
  posted_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists instagram_posts_source_idx on public.instagram_posts (source_type, source_id, created_at desc);

alter table public.instagram_connections enable row level security;
create policy "instagram_connections_admin_all" on public.instagram_connections
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

alter table public.instagram_posts enable row level security;
create policy "instagram_posts_select_all" on public.instagram_posts for select using (true);
create policy "instagram_posts_insert_self" on public.instagram_posts for insert with check (auth.uid() = posted_by);
