-- NeoHomeo: Missing tables for flashcard SM2 persistence and quiz history
-- Run this in Supabase SQL Editor AFTER running migrate.sql and create-cases-tables.sql

-- ─── Flashcard review history (SM2 spaced repetition state) ───────────────────
create table if not exists public.flashcard_reviews (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users not null,
  card_id        text not null,            -- e.g. "sulphur_keynote_1"
  deck           text not null default 'materia-medica',
  ease_factor    numeric default 2.5,
  interval_days  int default 1,
  repetitions    int default 0,
  next_review_at timestamptz default now(),
  last_grade     int,                      -- 0=Again, 2=Hard, 4=Good, 5=Easy
  updated_at     timestamptz default now()
);

alter table public.flashcard_reviews enable row level security;

create policy "Own flashcard reviews"
  on public.flashcard_reviews for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create unique index if not exists flashcard_reviews_user_card
  on public.flashcard_reviews(user_id, card_id);

-- ─── Quiz result history ───────────────────────────────────────────────────────
create table if not exists public.quiz_results (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users not null,
  topic        text,
  score        int not null,
  total        int not null,
  answers      jsonb,          -- [{ questionId, selected, correct, topic }]
  completed_at timestamptz default now()
);

alter table public.quiz_results enable row level security;

create policy "Own quiz results"
  on public.quiz_results for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists quiz_results_user_id on public.quiz_results(user_id);
