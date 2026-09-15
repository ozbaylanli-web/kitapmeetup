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
