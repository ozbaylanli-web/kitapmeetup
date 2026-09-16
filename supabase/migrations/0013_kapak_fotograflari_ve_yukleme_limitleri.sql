-- Kitapmeetup — 13. göç: kulüp/etkinlik kapak fotoğrafları + yükleme boyutu limiti.
-- 0001-0012'den SONRA çalıştırın.
--
-- Kulüpler ve etkinlikler artık isteğe bağlı bir kapak fotoğrafı taşıyabilir
-- (yoksa mevcut turuncu gradient arka plan aynen kullanılmaya devam eder).
-- Ayrıca tüm görsel yüklemelerinde (gönderi fotoğrafı, avatar, kapak) 2MB'lık
-- bir üst sınır getiriyoruz — hem uygulama kodunda hem de burada, depolama
-- katmanında (çift koruma: istemci atlatılsa bile Supabase reddeder).

alter table public.clubs add column if not exists cover_url text;
alter table public.events add column if not exists cover_url text;

update storage.buckets set file_size_limit = 2097152 where id in ('post-images', 'avatars');

insert into storage.buckets (id, name, public, file_size_limit)
values ('covers', 'covers', true, 2097152)
on conflict (id) do update set file_size_limit = 2097152, public = true;

create policy "covers_public_read" on storage.objects for select using (bucket_id = 'covers');
create policy "covers_insert_own" on storage.objects for insert with check (
  bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "covers_update_own" on storage.objects for update using (
  bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "covers_delete_own" on storage.objects for delete using (
  bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text
);
