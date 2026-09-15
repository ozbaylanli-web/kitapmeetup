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
