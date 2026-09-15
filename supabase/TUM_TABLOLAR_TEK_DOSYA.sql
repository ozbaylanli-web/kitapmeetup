-- ============================================================
-- supabase/migrations/0001_init.sql
-- ============================================================
-- Kitapmeetup — başlangıç şeması
-- Bu dosyayı Supabase SQL Editor'e yapıştırıp çalıştırabilir, ya da
-- Supabase CLI kullanıyorsanız `supabase db push` ile uygulayabilirsiniz.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  full_name text,
  avatar_url text,
  avatar_color text not null default '#F0611F',
  bio text not null default '',
  city text,
  -- İkisi de opsiyonel — "isteyen ekler". gender serbest metin (kapalı bir enum
  -- yerine) tutulur ki "belirtmek istemiyorum" gibi seçenekler de doğal dursun.
  birth_date date,
  gender text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Auth kullanıcısı başına bir profil satırı; auth.users ile 1:1.';

-- ─────────────────────────────────────────────────────────────────────────
-- CLUBS (alt kulüpler: Felsefe, Bilimkurgu, ...)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  color text not null default '#F0611F',
  icon text not null default '📚',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.club_members (
  club_id uuid not null references public.clubs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'moderator', 'owner')),
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

create index if not exists club_members_user_idx on public.club_members (user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- BOOKS & SHELF ("Ne okuyorum")
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  spine_color text not null default '#F0611F',
  added_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Kitap kataloğu (scripts/seed.ts) ve kullanıcı eklemeleri aynı başlığı iki kez
-- yaratmasın diye başlık bazında tekilleştirme.
create unique index if not exists books_title_unique_idx on public.books (lower(title));

-- Kitap kataloğu arama kutusu (/kitaplar) "içeriyor" aramasını hızlandırır.
create extension if not exists pg_trgm;
create index if not exists books_title_search_idx on public.books using gin (lower(title) gin_trgm_ops);

create table if not exists public.shelf_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  status text not null default 'reading' check (status in ('reading', 'read', 'want')),
  rating smallint check (rating between 1 and 5),
  note text,
  started_at date,
  finished_at date,
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create index if not exists shelf_entries_user_status_idx on public.shelf_entries (user_id, status);

-- ─────────────────────────────────────────────────────────────────────────
-- POSTS (ana akış: metin, alıntı, fotoğraf, soru) + beğeni + yorum + takip
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  club_id uuid references public.clubs (id) on delete set null,
  type text not null default 'text' check (type in ('text', 'quote', 'photo', 'question')),
  body text,
  book_id uuid references public.books (id) on delete set null,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_club_idx on public.posts (club_id);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- target_type: 'post' | 'blog_post' | 'lesson' — basit polimorfik yorum tablosu
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('post', 'blog_post', 'lesson')),
  target_id uuid not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_target_idx on public.comments (target_type, target_id);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- EVENTS (fiziksel/online buluşmalar)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  club_id uuid references public.clubs (id) on delete set null,
  title text not null,
  description text not null default '',
  location_name text,
  location_url text,
  is_online boolean not null default false,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity int,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists events_starts_at_idx on public.events (starts_at);

create table if not exists public.event_rsvps (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'going' check (status in ('going', 'interested', 'not_going')),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- AKADEMİ (haftalık/aylık temel eğitimler)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.academy_courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  description text not null default '',
  level text not null default 'giriş' check (level in ('giriş', 'orta', 'ileri')),
  cadence text not null default 'haftalık' check (cadence in ('haftalık', 'aylık', 'kendi hızında')),
  color text not null default '#F0611F',
  is_published boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.academy_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.academy_courses (id) on delete cascade,
  slug text not null,
  title text not null,
  order_index int not null default 0,
  content text not null default '',
  duration_minutes int not null default 10,
  created_at timestamptz not null default now(),
  unique (course_id, slug)
);

create index if not exists academy_lessons_course_idx on public.academy_lessons (course_id, order_index);

create table if not exists public.academy_enrollments (
  course_id uuid not null references public.academy_courses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (course_id, user_id)
);

create table if not exists public.academy_lesson_progress (
  lesson_id uuid not null references public.academy_lessons (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (lesson_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- BLOG
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null unique,
  title text not null,
  summary text,
  color text not null default '#F0611F',
  body text not null default '',
  tags text[] not null default '{}',
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on public.blog_posts (published_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- GÜNÜN SORUSU (her gün döngüsel olarak seçilen sohbet kıvılcımı)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.daily_prompts (
  id serial primary key,
  question text not null
);

-- ─────────────────────────────────────────────────────────────────────────
-- DOĞRUDAN MESAJLAR (Kitap Eşleşmeleri'nden başlayan basit, senkron olmayan sohbet)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);

create index if not exists direct_messages_sender_idx on public.direct_messages (sender_id, created_at);
create index if not exists direct_messages_recipient_idx on public.direct_messages (recipient_id, created_at);

-- ─────────────────────────────────────────────────────────────────────────
-- Yeni auth.users satırı için otomatik profil oluşturma
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  desired_username text;
begin
  desired_username := coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1));
  desired_username := lower(regexp_replace(desired_username, '[^a-z0-9_]', '_', 'g'));

  if desired_username is null or length(desired_username) < 3 then
    desired_username := 'okur_' || substr(new.id::text, 1, 8);
  end if;

  insert into public.profiles (id, username, full_name, birth_date, gender)
  values (
    new.id,
    desired_username,
    coalesce(new.raw_user_meta_data ->> 'full_name', desired_username),
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    nullif(new.raw_user_meta_data ->> 'gender', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.books enable row level security;
alter table public.shelf_entries enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.academy_courses enable row level security;
alter table public.academy_lessons enable row level security;
alter table public.academy_enrollments enable row level security;
alter table public.academy_lesson_progress enable row level security;
alter table public.blog_posts enable row level security;
alter table public.daily_prompts enable row level security;
alter table public.direct_messages enable row level security;

-- profiles: herkes okuyabilir, herkes sadece kendi satırını yazabilir
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_self" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- clubs: herkes okuyabilir; kurucu/yönetici günceller
create policy "clubs_select_all" on public.clubs for select using (true);
create policy "clubs_insert_auth" on public.clubs for insert with check (auth.uid() = created_by);
create policy "clubs_update_owner" on public.clubs for update using (
  auth.uid() = created_by
  or exists (
    select 1 from public.club_members cm
    where cm.club_id = clubs.id and cm.user_id = auth.uid() and cm.role in ('owner', 'moderator')
  )
);
create policy "clubs_delete_owner" on public.clubs for delete using (auth.uid() = created_by);

-- club_members: herkes okuyabilir; kullanıcı kendi üyeliğini yönetir
create policy "club_members_select_all" on public.club_members for select using (true);
create policy "club_members_insert_self" on public.club_members for insert with check (auth.uid() = user_id);
create policy "club_members_delete_self_or_owner" on public.club_members for delete using (
  auth.uid() = user_id
  or exists (
    select 1 from public.club_members cm
    where cm.club_id = club_members.club_id and cm.user_id = auth.uid() and cm.role in ('owner', 'moderator')
  )
);
create policy "club_members_update_owner" on public.club_members for update using (
  exists (
    select 1 from public.club_members cm
    where cm.club_id = club_members.club_id and cm.user_id = auth.uid() and cm.role = 'owner'
  )
);

-- books: herkes okuyabilir; giriş yapan ekleyebilir
create policy "books_select_all" on public.books for select using (true);
create policy "books_insert_auth" on public.books for insert with check (auth.uid() = added_by);
create policy "books_update_owner" on public.books for update using (auth.uid() = added_by);

-- shelf_entries: herkes okuyabilir ("ne okuyorum" profilde görünür); sahibi yazar
create policy "shelf_select_all" on public.shelf_entries for select using (true);
create policy "shelf_write_owner" on public.shelf_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- posts: herkes okuyabilir; sahibi yazar
create policy "posts_select_all" on public.posts for select using (true);
create policy "posts_insert_self" on public.posts for insert with check (auth.uid() = author_id);
create policy "posts_update_self" on public.posts for update using (auth.uid() = author_id);
create policy "posts_delete_self" on public.posts for delete using (auth.uid() = author_id);

-- post_likes / comments / follows: herkes okuyabilir; sahibi yazar
create policy "post_likes_select_all" on public.post_likes for select using (true);
create policy "post_likes_write_self" on public.post_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "comments_select_all" on public.comments for select using (true);
create policy "comments_insert_self" on public.comments for insert with check (auth.uid() = author_id);
create policy "comments_delete_self" on public.comments for delete using (auth.uid() = author_id);

create policy "follows_select_all" on public.follows for select using (true);
create policy "follows_write_self" on public.follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

-- events: herkes okuyabilir; oluşturan/kulüp yöneticisi düzenler
create policy "events_select_all" on public.events for select using (true);
create policy "events_insert_auth" on public.events for insert with check (auth.uid() = created_by);
create policy "events_update_owner" on public.events for update using (
  auth.uid() = created_by
  or (
    club_id is not null
    and exists (
      select 1 from public.club_members cm
      where cm.club_id = events.club_id and cm.user_id = auth.uid() and cm.role in ('owner', 'moderator')
    )
  )
);
create policy "events_delete_owner" on public.events for delete using (auth.uid() = created_by);

create policy "event_rsvps_select_all" on public.event_rsvps for select using (true);
create policy "event_rsvps_write_self" on public.event_rsvps for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- academy: yayınlanan içerik herkese açık; yazma admin'e özel
create policy "academy_courses_select_published" on public.academy_courses for select using (
  is_published or auth.uid() = created_by
);
create policy "academy_courses_write_admin" on public.academy_courses for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  or auth.uid() = created_by
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  or auth.uid() = created_by
);

create policy "academy_lessons_select_published" on public.academy_lessons for select using (
  exists (
    select 1 from public.academy_courses c
    where c.id = academy_lessons.course_id and (c.is_published or c.created_by = auth.uid())
  )
);
create policy "academy_lessons_write_admin" on public.academy_lessons for all using (
  exists (
    select 1 from public.academy_courses c
    join public.profiles p on p.id = auth.uid()
    where c.id = academy_lessons.course_id and (p.is_admin or c.created_by = auth.uid())
  )
);

create policy "academy_enrollments_self" on public.academy_enrollments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "academy_progress_self" on public.academy_lesson_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- blog_posts: yayınlanan herkese açık; sahibi kendi taslağını da görür/yazar
create policy "blog_posts_select_published" on public.blog_posts for select using (
  is_published or auth.uid() = author_id
);
create policy "blog_posts_insert_self" on public.blog_posts for insert with check (auth.uid() = author_id);
create policy "blog_posts_update_self" on public.blog_posts for update using (auth.uid() = author_id);
create policy "blog_posts_delete_self" on public.blog_posts for delete using (auth.uid() = author_id);

-- daily_prompts: herkes okuyabilir, yazma yalnızca servis rolüyle (seed script)
create policy "daily_prompts_select_all" on public.daily_prompts for select using (true);

-- direct_messages: sadece gönderen/alıcı kendi mesajlarını görebilir ve yazabilir
create policy "direct_messages_select_own" on public.direct_messages for select using (
  auth.uid() = sender_id or auth.uid() = recipient_id
);
create policy "direct_messages_insert_own" on public.direct_messages for insert with check (auth.uid() = sender_id);
create policy "direct_messages_update_recipient" on public.direct_messages for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- ─────────────────────────────────────────────────────────────────────────
-- STORAGE (kitap fotoğrafları ve profil fotoğrafları için genel-okur bucket'lar)
-- Yükleme yolu kuralı: "<auth.uid()>/dosya-adi.jpg" — her kullanıcı sadece
-- kendi klasörüne yazabilir, herkes okuyabilir.
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "post_images_public_read" on storage.objects for select using (bucket_id = 'post-images');
create policy "post_images_insert_own" on storage.objects for insert with check (
  bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "post_images_delete_own" on storage.objects for delete using (
  bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_insert_own" on storage.objects for insert with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "avatars_update_own" on storage.objects for update using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);


-- ============================================================
-- supabase/migrations/0002_hedefler_davetler_ortak_okuma.sql
-- ============================================================
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


-- ============================================================
-- supabase/migrations/0003_kitap_turu_ve_genisletilmis_eslesme.sql
-- ============================================================
-- Kitapmeetup — 3. göç: kitaplara "tür" (genre) alanı ekler.
-- 0001 ve 0002'den SONRA çalıştırın.
--
-- Bu alan, Kitap Eşleşmeleri'nin artık sadece "aynı kitabı okuyanlar" değil,
-- "aynı TÜRDEN kitap okuyanlar" arasında da eşleşme kurabilmesi için gerekli.
-- Kulüp/etkinlik bazlı eşleşme zaten var olan club_members/event_rsvps
-- tablolarından hesaplanır — şema değişikliği gerektirmez.

alter table public.books add column if not exists genre text;
create index if not exists books_genre_idx on public.books (genre) where genre is not null;


-- ============================================================
-- supabase/migrations/0004_akademi_derslerini_bulusmaya_cevir.sql
-- ============================================================
-- Kitapmeetup — 4. göç: Akademi derslerini gerçek buluşmalara çeviriyoruz.
-- 0001, 0002, 0003'ten SONRA çalıştırın.
--
-- Artık bir "ders" sadece okunan bir metin değil — "haftalık"/"aylık" ritimli
-- kurslarda tarihi, yeri (fiziksel ya da online) olan gerçek bir buluşma
-- olabilir. "Kendi hızında" kurslar için starts_at boş bırakılabilir — o
-- derslerde eski (self-paced okuma + "tamamladım") akış aynen çalışmaya
-- devam eder. RSVP mekanizması event_rsvps ile birebir aynı desende.

alter table public.academy_lessons add column if not exists starts_at timestamptz;
alter table public.academy_lessons add column if not exists ends_at timestamptz;
alter table public.academy_lessons add column if not exists is_online boolean not null default true;
alter table public.academy_lessons add column if not exists location_name text;
alter table public.academy_lessons add column if not exists location_url text;
alter table public.academy_lessons add column if not exists capacity int;

create index if not exists academy_lessons_starts_at_idx on public.academy_lessons (starts_at) where starts_at is not null;

create table if not exists public.academy_lesson_rsvps (
  lesson_id uuid not null references public.academy_lessons (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'going' check (status in ('going', 'interested', 'not_going')),
  created_at timestamptz not null default now(),
  primary key (lesson_id, user_id)
);

alter table public.academy_lesson_rsvps enable row level security;
create policy "academy_lesson_rsvps_select_all" on public.academy_lesson_rsvps for select using (true);
create policy "academy_lesson_rsvps_write_self" on public.academy_lesson_rsvps for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ============================================================
-- supabase/migrations/0005_kitap_takasi.sql
-- ============================================================
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


-- ============================================================
-- supabase/migrations/0006_kitap_arama_ilanlari.sql
-- ============================================================
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


-- ============================================================
-- supabase/migrations/0007_mekanlar.sql
-- ============================================================
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


-- ============================================================
-- supabase/migrations/0008_sistem_gonderileri.sql
-- ============================================================
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


-- ============================================================
-- supabase/migrations/0009_gunun_sorusu_cevaplari.sql
-- ============================================================
-- Kitapmeetup — 9. göç: "Günün Sorusu"na tıklandığında diğer üyelerin
-- cevaplarının göründüğü, kullanıcıların kendi cevabını (isteğe bağlı bir
-- fotoğrafla) bırakabildiği bir sayfa. 0001-0008'den SONRA çalıştırın.
--
-- Üye başına, gün başına tek cevap (unique) — daha önce cevap verdiysen
-- formu tekrar göndermek cevabını günceller.

create table if not exists public.daily_prompt_answers (
  id uuid primary key default gen_random_uuid(),
  prompt_id bigint not null references public.daily_prompts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null default '',
  image_url text,
  created_at timestamptz not null default now(),
  unique (prompt_id, author_id)
);

create index if not exists daily_prompt_answers_prompt_idx on public.daily_prompt_answers (prompt_id, created_at desc);

alter table public.daily_prompt_answers enable row level security;
create policy "daily_prompt_answers_select_all" on public.daily_prompt_answers for select using (true);
create policy "daily_prompt_answers_write_self" on public.daily_prompt_answers for all using (auth.uid() = author_id) with check (auth.uid() = author_id);


-- ============================================================
-- supabase/migrations/0010_yayinevi_hesaplari.sql
-- ============================================================
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


-- ============================================================
-- supabase/migrations/0011_etkinlik_kayit_formlari.sql
-- ============================================================
-- Kitapmeetup — 11. göç: Etkinlik kayıt formu özelleştirme + yönetici
-- paneli. Topluluk yöneticileri (etkinliği oluşturan kişi ya da etkinliğin
-- bağlı olduğu kulübün yöneticisi/moderatörü) bir etkinlik için serbest
-- sorular tanımlayabilir; "Gidiyorum" diyen katılımcı bu soruları
-- yanıtlar. Yöneticiler kaç kişinin kayıt olduğunu ve verdikleri
-- yanıtları görebilir. 0001-0010'dan SONRA çalıştırın.

create table if not exists public.event_registration_fields (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  label text not null,
  field_type text not null default 'text' check (field_type in ('text', 'textarea', 'select', 'checkbox')),
  options text[],
  is_required boolean not null default false,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.event_registration_answers (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.event_registration_fields (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  value text not null default '',
  created_at timestamptz not null default now(),
  unique (field_id, user_id)
);

create index if not exists event_registration_fields_event_idx on public.event_registration_fields (event_id, order_index);
create index if not exists event_registration_answers_event_idx on public.event_registration_answers (event_id);

-- Bir etkinliği "yönetip yönetemeyeceğini" tek yerden karara bağlayan yardımcı
-- fonksiyon: etkinliği oluşturan kişi YA DA (etkinlik bir kulübe bağlıysa) o
-- kulübün sahibi/moderatörü. RLS politikalarında ve gelecekte başka
-- yönetim özelliklerinde de yeniden kullanılabilir.
create or replace function public.can_manage_event(p_event_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.events e
    where e.id = p_event_id
      and (
        e.created_by = auth.uid()
        or (
          e.club_id is not null
          and exists (
            select 1 from public.club_members cm
            where cm.club_id = e.club_id
              and cm.user_id = auth.uid()
              and cm.role in ('owner', 'moderator')
          )
        )
      )
  );
$$;

alter table public.event_registration_fields enable row level security;
create policy "event_registration_fields_select_all" on public.event_registration_fields for select using (true);
create policy "event_registration_fields_write_manager" on public.event_registration_fields
  for all using (public.can_manage_event(event_id)) with check (public.can_manage_event(event_id));

alter table public.event_registration_answers enable row level security;
create policy "event_registration_answers_select_own_or_manager" on public.event_registration_answers
  for select using (auth.uid() = user_id or public.can_manage_event(event_id));
create policy "event_registration_answers_insert_self" on public.event_registration_answers
  for insert with check (auth.uid() = user_id);
create policy "event_registration_answers_update_self" on public.event_registration_answers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ============================================================
-- supabase/migrations/0012_instagram_paylasimi.sql
-- ============================================================
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


