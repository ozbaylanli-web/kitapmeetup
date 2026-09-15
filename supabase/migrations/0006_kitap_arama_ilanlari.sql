-- Kitapmeetup — 6. göç: "aradığım kitap" ilanları.
-- 0001-0005'ten SONRA çalıştırın.
--
-- Kitap Takası'nın ikinci yönü: "elimde var, takas ediyorum" (type='takas')
-- yanına "bunu arıyorum, kimde var?" (type='takas_arama') ekleniyor. Arayan
-- kişi isterse karşılığında verebileceği bir kitabı da ilana ekleyebilir
-- (counter_book_id) — bu, hem "elimde var" ilanlarında "karşılığında
-- istediğim kitap" hem de "arıyorum" ilanlarında "karşılığında
-- verebileceğim kitap" anlamına gelebilecek nötr, ikincil bir kitap alanı.

alter table public.posts drop constraint if exists posts_type_check;
alter table public.posts add constraint posts_type_check check (type in ('text', 'quote', 'photo', 'question', 'takas', 'takas_arama'));

alter table public.posts add column if not exists counter_book_id uuid references public.books (id) on delete set null;
