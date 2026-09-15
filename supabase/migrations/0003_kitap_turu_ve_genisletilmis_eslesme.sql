-- Kitapmeetup — 3. göç: kitaplara "tür" (genre) alanı ekler.
-- 0001 ve 0002'den SONRA çalıştırın.
--
-- Bu alan, Kitap Eşleşmeleri'nin artık sadece "aynı kitabı okuyanlar" değil,
-- "aynı TÜRDEN kitap okuyanlar" arasında da eşleşme kurabilmesi için gerekli.
-- Kulüp/etkinlik bazlı eşleşme zaten var olan club_members/event_rsvps
-- tablolarından hesaplanır — şema değişikliği gerektirmez.

alter table public.books add column if not exists genre text;
create index if not exists books_genre_idx on public.books (genre) where genre is not null;
