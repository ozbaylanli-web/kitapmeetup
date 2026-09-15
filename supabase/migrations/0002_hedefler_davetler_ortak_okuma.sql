-- Kitapmeetup — 2. göç: okuma hedefleri, arkadaş daveti, kulüpte "şu an
-- okunan kitap" (resmi) + bölüm tartışmaları.
-- 0001_init.sql'den SONRA, aynı şekilde SQL Editor'e yapıştırıp çalıştırın.

-- ─────────────────────────────────────────────────────────────────────────
-- ARKADAŞINI DAVET ET
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles add column if not exists referred_by uuid references public.profiles (id) on delete set null;

-- handle_new_user tetikleyicisini, kayıt formundan gelen "referred_by_username"
-- meta verisini de işleyecek şekilde güncelliyoruz (RLS/oturum zamanlaması
-- sorunu yaşamamak için bu işi SECURITY DEFINER tetikleyicide yapıyoruz).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  desired_username text;
  referrer_id uuid;
begin
  desired_username := coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1));
  desired_username := lower(regexp_replace(desired_username, '[^a-z0-9_]', '_', 'g'));

  if desired_username is null or length(desired_username) < 3 then
    desired_username := 'okur_' || substr(new.id::text, 1, 8);
  end if;

  if new.raw_user_meta_data ->> 'referred_by_username' is not null then
    select id into referrer_id from public.profiles where username = new.raw_user_meta_data ->> 'referred_by_username';
  end if;

  insert into public.profiles (id, username, full_name, birth_date, gender, referred_by)
  values (
    new.id,
    desired_username,
    coalesce(new.raw_user_meta_data ->> 'full_name', desired_username),
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    nullif(new.raw_user_meta_data ->> 'gender', ''),
    referrer_id
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- YILLIK OKUMA HEDEFİ
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.reading_goals (
  user_id uuid not null references public.profiles (id) on delete cascade,
  year int not null check (year between 2000 and 2200),
  target int not null check (target > 0 and target <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, year)
);

alter table public.reading_goals enable row level security;
create policy "reading_goals_select_all" on public.reading_goals for select using (true);
create policy "reading_goals_write_self" on public.reading_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- KULÜPTE "ŞU AN OKUNAN KİTAP" (resmi, kulüp yöneticisi tarafından sabitlenir)
-- + BÖLÜM BAZLI MİNİ TARTIŞMALAR
-- ─────────────────────────────────────────────────────────────────────────
alter table public.clubs add column if not exists current_book_id uuid references public.books (id) on delete set null;
alter table public.clubs add column if not exists current_book_note text;
alter table public.clubs add column if not exists current_book_set_at timestamptz;

create table if not exists public.club_read_threads (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  title text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists club_read_threads_club_idx on public.club_read_threads (club_id, created_at desc);

alter table public.club_read_threads enable row level security;
create policy "club_read_threads_select_all" on public.club_read_threads for select using (true);
create policy "club_read_threads_insert_member" on public.club_read_threads for insert with check (
  auth.uid() = created_by
  and exists (select 1 from public.club_members cm where cm.club_id = club_read_threads.club_id and cm.user_id = auth.uid())
);
create policy "club_read_threads_delete_owner" on public.club_read_threads for delete using (
  auth.uid() = created_by
  or exists (
    select 1 from public.club_members cm
    where cm.club_id = club_read_threads.club_id and cm.user_id = auth.uid() and cm.role in ('owner', 'moderator')
  )
);

-- comments tablosu zaten polimorfik (target_type/target_id) — tartışma
-- yorumlarını da barındırabilmesi için izin verilen tür listesini genişletiyoruz.
alter table public.comments drop constraint if exists comments_target_type_check;
alter table public.comments add constraint comments_target_type_check
  check (target_type in ('post', 'blog_post', 'lesson', 'read_thread'));
