-- =============================================================
-- DailyHabits (self-hosted) - Supabase schema
-- Paste this whole file into: Supabase dashboard -> SQL Editor -> Run
-- Safe to re-run: it drops nothing, only creates what is missing.
-- =============================================================

-- HABITS ------------------------------------------------------
create table if not exists public.habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  color       text not null default '#E6D9A8',
  goal        int  not null default 30 check (goal between 1 and 31),
  position    int  not null default 0,
  archived    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- CHECKINS (one row = habit done on that day) -----------------
create table if not exists public.checkins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  habit_id    uuid not null references public.habits (id) on delete cascade,
  day         date not null,
  created_at  timestamptz not null default now(),
  unique (habit_id, day)
);

-- NOTES (one journal note per day) ----------------------------
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day         date not null,
  content     text not null default '',
  updated_at  timestamptz not null default now(),
  unique (user_id, day)
);

-- Indexes -----------------------------------------------------
create index if not exists checkins_user_day_idx on public.checkins (user_id, day);
create index if not exists checkins_habit_idx    on public.checkins (habit_id);
create index if not exists habits_user_idx       on public.habits (user_id, position);
create index if not exists notes_user_day_idx    on public.notes (user_id, day desc);

-- Row Level Security: every user only ever sees their own rows
alter table public.habits   enable row level security;
alter table public.checkins enable row level security;
alter table public.notes    enable row level security;

drop policy if exists "own habits"   on public.habits;
drop policy if exists "own checkins" on public.checkins;
drop policy if exists "own notes"    on public.notes;

create policy "own habits" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own checkins" on public.checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own notes" on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
