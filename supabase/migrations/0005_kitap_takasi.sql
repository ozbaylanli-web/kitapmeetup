-- Kitapmeetup — 5. göç: kitap takası ilanları.
-- 0001, 0002, 0003, 0004'ten SONRA çalıştırın.
--
-- Bir takas ilanı, "posts" tablosunun 5. türü olarak modellenir (type='takas')
-- — böylece Ana Akış'ta diğer gönderilerle aynı kronolojik listede doğal
-- olarak yer alır, ayrı bir tablo/sorgu gerekmez. `book_id` takas edilmek
-- istenen kitabı, `body` ise "karşılığında ne arıyorum" notunu taşır.
-- Teklifler ayrı bir tabloda: bir ilana birden çok kullanıcı, kendi
-- kitabını teklif ederek yanıt verebilir.

alter table public.posts drop constraint if exists posts_type_check;
alter table public.posts add constraint posts_type_check check (type in ('text', 'quote', 'photo', 'question', 'takas'));

create table if not exists public.swap_offers (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  offerer_id uuid not null references public.profiles (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

create index if not exists swap_offers_post_idx on public.swap_offers (post_id, created_at desc);

alter table public.swap_offers enable row level security;
create policy "swap_offers_select_all" on public.swap_offers for select using (true);
create policy "swap_offers_insert_self" on public.swap_offers for insert with check (auth.uid() = offerer_id);
-- Kabul/reddet ilan sahibine, iptal etmek kendi teklifin olduğu için sana ait.
create policy "swap_offers_update_owner_or_self" on public.swap_offers for update using (
  auth.uid() = offerer_id
  or exists (select 1 from public.posts p where p.id = swap_offers.post_id and p.author_id = auth.uid())
);
create policy "swap_offers_delete_self" on public.swap_offers for delete using (auth.uid() = offerer_id);
