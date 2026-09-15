-- Kitapmeetup — 10. göç: Yayınevi hesapları. Kayıt sırasında "Yayınevi
-- olarak katıl" seçilebilir; sonradan Ayarlar'dan da hesap türü
-- değiştirilebilir. Yayınevi hesapları normal bir kullanıcı gibi paylaşım
-- yapabilir, kulüp kurabilir, mesajlaşabilir — sadece kimliği "Yayınevi"
-- rozetiyle ayırt edilir; ayrı bir tablo/izin sistemi gerekmedi.
-- 0001-0009'dan SONRA çalıştırın.

alter table public.profiles add column if not exists account_kind text not null default 'reader' check (account_kind in ('reader', 'publisher'));
alter table public.profiles add column if not exists publisher_website text;

-- handle_new_user() tetikleyicisini account_kind/publisher_website alanlarını
-- da işleyecek şekilde güncelliyoruz (0001_init.sql'deki fonksiyonun yerini alır).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  desired_username text;
  desired_kind text;
begin
  desired_username := coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1));
  desired_username := lower(regexp_replace(desired_username, '[^a-z0-9_]', '_', 'g'));

  if desired_username is null or length(desired_username) < 3 then
    desired_username := 'okur_' || substr(new.id::text, 1, 8);
  end if;

  desired_kind := coalesce(new.raw_user_meta_data ->> 'account_kind', 'reader');
  if desired_kind not in ('reader', 'publisher') then
    desired_kind := 'reader';
  end if;

  insert into public.profiles (id, username, full_name, birth_date, gender, account_kind, publisher_website)
  values (
    new.id,
    desired_username,
    coalesce(new.raw_user_meta_data ->> 'full_name', desired_username),
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    nullif(new.raw_user_meta_data ->> 'gender', ''),
    desired_kind,
    nullif(new.raw_user_meta_data ->> 'publisher_website', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
