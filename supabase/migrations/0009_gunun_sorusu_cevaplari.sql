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
