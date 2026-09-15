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
