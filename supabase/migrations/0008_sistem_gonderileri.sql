-- Kitapmeetup — 8. göç: yeni bir etkinlik ya da yeni bir kulüp
-- oluşturulduğunda, bunu duyuran otomatik bir "sistem gönderisi" ana akışa
-- düşer. 0001-0007'den SONRA çalıştırın.
--
-- "kulup" türü gönderiler zaten var olan posts.club_id kolonunu kullanır
-- (yeni kulübün kendisi bağlanır) — ekstra kolon gerekmez. "etkinlik" türü
-- gönderiler için ise hangi etkinliğin duyurulduğunu tutan yeni bir
-- posts.event_id kolonu ekliyoruz.

alter table public.posts add column if not exists event_id uuid references public.events (id) on delete cascade;

create index if not exists posts_event_idx on public.posts (event_id);

alter table public.posts drop constraint if exists posts_type_check;
alter table public.posts add constraint posts_type_check
  check (type in ('text', 'quote', 'photo', 'question', 'takas', 'takas_arama', 'etkinlik', 'kulup'));
